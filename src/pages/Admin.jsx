import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";

function formatMonthYear(isoDate) {
  if (!isoDate || !isoDate.includes("-")) return isoDate || "N/A";
  const [year, month] = isoDate.split("-");
  const dateObj = new Date(year, month - 1);
  return dateObj.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState("projects"); // "projects" | "certificates"
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // "all" | "listed" | "unlisted"

  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCertificates, setLoadingCertificates] = useState(true);

  // Modal states
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { collection: 'projects' | 'certificates', id, title }

  // Project form state
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    date: "",
    description: "",
    thumbnail: "",
    projectLink: "",
    sourceLink: "",
    imageType: "upload", // "upload" | "url"
    isListed: true,
  });
  const [projectFile, setProjectFile] = useState(null);
  const [projectPreview, setProjectPreview] = useState("");

  // Certificate form state
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [certificateForm, setCertificateForm] = useState({
    name: "",
    date: "",
    organization: "",
    orgDomain: "",
    credentialUrl: "",
    category: "",
    image: "",
    imageType: "upload", // "upload" | "url"
    isListed: true,
  });
  const [certFile, setCertFile] = useState(null);
  const [certPreview, setCertPreview] = useState("");

  // Operation flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type }
  const notificationTimeoutRef = useRef(null);

  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Auth Guard
  useEffect(() => {
    document.title = "Admin Dashboard - Abijith S Pillai Portfolio";

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthChecking(false);
        loadProjects();
        loadCertificates();
      } else {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      unsubscribe();
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      document.title = "Abijith S Pillai | Web Developer Portfolio";
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (err) {
      showNotification("Logout failed: " + err.message, "error");
    }
  };

  // Load Data
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const q = query(collection(db, "projects"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProjects(list);
    } catch (error) {
      console.error("Error loading projects:", error);
      showNotification("Error loading projects: " + error.message, "error");
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const q = query(collection(db, "certificates"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCertificates(list);
    } catch (error) {
      console.error("Error loading certificates:", error);
      showNotification("Error loading certificates: " + error.message, "error");
    } finally {
      setLoadingCertificates(false);
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!currentUser) {
      throw new Error("Authentication required for upload.");
    }
    showNotification("Authorizing and uploading asset to Cloudinary...", "info");

    const idToken = await currentUser.getIdToken();
    const signResponse = await fetch("/api/sign-cloudinary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    const signData = await signResponse.json().catch(() => ({}));
    if (!signResponse.ok) {
      throw new Error(signData.error || "Failed to obtain upload signature.");
    }

    const { signature, timestamp, apiKey, cloudName, folder } = signData;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    if (folder) {
      formData.append("folder", folder);
    }

    const isImageOrPdf = file.type.startsWith("image/") || file.type === "application/pdf";
    const resourceType = isImageOrPdf ? "image" : "raw";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Cloudinary upload failed.");
    }

    let finalUrl = data.secure_url;
    if (resourceType === "raw" && finalUrl) {
      finalUrl = finalUrl.replace("/upload/", "/upload/fl_inline/");
    }
    return finalUrl;
  };

  // --- LIST / UNLIST TOGGLE ---
  const toggleListStatus = async (colName, id, currentListed) => {
    const newStatus = !currentListed;
    try {
      await updateDoc(doc(db, colName, id), { isListed: newStatus });
      showNotification(
        `${colName === "projects" ? "Project" : "Certificate"} ${newStatus ? "listed (visible on public site)" : "unlisted (hidden from public site)"}!`,
        "success"
      );
      if (colName === "projects") {
        setProjects((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isListed: newStatus } : item))
        );
      } else {
        setCertificates((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isListed: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Toggle list error:", err);
      showNotification("Failed to update status: " + err.message, "error");
    }
  };

  // --- PROJECT ACTIONS ---
  const openNewProjectModal = () => {
    setEditingProject(null);
    setProjectForm({
      name: "",
      date: new Date().toISOString().slice(0, 7),
      description: "",
      thumbnail: "",
      projectLink: "",
      sourceLink: "",
      imageType: "upload",
      isListed: true,
    });
    setProjectFile(null);
    setProjectPreview("");
    setProjectModalOpen(true);
  };

  const openEditProjectModal = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      name: proj.name || "",
      date: proj.date || "",
      description: proj.description || "",
      thumbnail: proj.thumbnail || "",
      projectLink: proj.projectLink || "",
      sourceLink: proj.sourceLink || "",
      imageType: "url",
      isListed: proj.isListed !== false,
    });
    setProjectFile(null);
    setProjectPreview(proj.thumbnail || "");
    setProjectModalOpen(true);
  };

  const handleProjectFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectFile(file);
      if (file.type.startsWith("image/")) {
        setProjectPreview(URL.createObjectURL(file));
      } else {
        setProjectPreview("");
      }
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalThumbnailUrl = projectForm.thumbnail.trim();

      if (projectForm.imageType === "upload") {
        if (projectFile) {
          finalThumbnailUrl = await uploadToCloudinary(projectFile);
        } else if (!editingProject || !finalThumbnailUrl) {
          showNotification("Please select a file to upload or provide an image URL.", "error");
          setIsSubmitting(false);
          return;
        }
      } else {
        if (!finalThumbnailUrl) {
          showNotification("Please provide a valid thumbnail URL.", "error");
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        name: projectForm.name.trim(),
        date: projectForm.date,
        description: projectForm.description.trim(),
        thumbnail: finalThumbnailUrl,
        projectLink: projectForm.projectLink.trim() || null,
        sourceLink: projectForm.sourceLink.trim() || null,
        isListed: projectForm.isListed !== false,
      };

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), payload);
        showNotification("Project updated successfully!", "success");
      } else {
        payload.timestamp = serverTimestamp();
        await addDoc(collection(db, "projects"), payload);
        showNotification("Project created successfully!", "success");
      }

      setProjectModalOpen(false);
      loadProjects();
    } catch (err) {
      console.error("Save project error:", err);
      showNotification("Failed to save project: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CERTIFICATE ACTIONS ---
  const openNewCertificateModal = () => {
    setEditingCertificate(null);
    setCertificateForm({
      name: "",
      date: new Date().toISOString().slice(0, 7),
      organization: "",
      orgDomain: "",
      credentialUrl: "",
      category: "",
      image: "",
      imageType: "upload",
      isListed: true,
    });
    setCertFile(null);
    setCertPreview("");
    setCertificateModalOpen(true);
  };

  const openEditCertificateModal = (cert) => {
    setEditingCertificate(cert);
    setCertificateForm({
      name: cert.name || "",
      date: cert.date || "",
      organization: cert.organization || "",
      orgDomain: cert.orgDomain || "",
      credentialUrl: cert.credentialUrl || "",
      category: cert.category || "",
      image: cert.image || "",
      imageType: "url",
      isListed: cert.isListed !== false,
    });
    setCertFile(null);
    setCertPreview(cert.image || "");
    setCertificateModalOpen(true);
  };

  const handleCertFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertFile(file);
      if (file.type.startsWith("image/")) {
        setCertPreview(URL.createObjectURL(file));
      } else {
        setCertPreview("");
      }
    }
  };

  const handleCertificateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = certificateForm.image.trim();

      if (certificateForm.imageType === "upload") {
        if (certFile) {
          finalImageUrl = await uploadToCloudinary(certFile);
        } else if (!editingCertificate || !finalImageUrl) {
          showNotification("Please select an image/PDF file to upload.", "error");
          setIsSubmitting(false);
          return;
        }
      } else {
        if (!finalImageUrl) {
          showNotification("Please provide a valid certificate image URL.", "error");
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        name: certificateForm.name.trim(),
        date: certificateForm.date,
        organization: certificateForm.organization.trim(),
        orgDomain: certificateForm.orgDomain.trim() || null,
        credentialUrl: certificateForm.credentialUrl.trim() || null,
        category: certificateForm.category?.trim() || null,
        image: finalImageUrl,
        isListed: certificateForm.isListed !== false,
      };

      if (editingCertificate) {
        await updateDoc(doc(db, "certificates", editingCertificate.id), payload);
        showNotification("Certificate updated successfully!", "success");
      } else {
        payload.timestamp = serverTimestamp();
        await addDoc(collection(db, "certificates"), payload);
        showNotification("Certificate created successfully!", "success");
      }

      setCertificateModalOpen(false);
      loadCertificates();
    } catch (err) {
      console.error("Save certificate error:", err);
      showNotification("Failed to save certificate: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE CONFIRMATION ---
  const requestDelete = (colName, id, title) => {
    setItemToDelete({ collection: colName, id, title });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);

    try {
      await deleteDoc(doc(db, itemToDelete.collection, itemToDelete.id));
      showNotification(
        `${itemToDelete.collection === "projects" ? "Project" : "Certificate"} deleted successfully!`,
        "success"
      );
      setDeleteConfirmOpen(false);
      setItemToDelete(null);

      if (itemToDelete.collection === "projects") {
        loadProjects();
      } else {
        loadCertificates();
      }
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("Error deleting item: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authChecking) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Filtered lists for search and visibility
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const isListed = p.isListed !== false;
    const matchesVisibility =
      visibilityFilter === "all"
        ? true
        : visibilityFilter === "listed"
        ? isListed
        : !isListed;
    return matchesSearch && matchesVisibility;
  });

  const filteredCertificates = certificates.filter((c) => {
    const matchesSearch =
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.organization || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.orgDomain || "").toLowerCase().includes(searchQuery.toLowerCase());
    const isListed = c.isListed !== false;
    const matchesVisibility =
      visibilityFilter === "all"
        ? true
        : visibilityFilter === "listed"
        ? isListed
        : !isListed;
    return matchesSearch && matchesVisibility;
  });

  return (
    <div className="admin-dashboard-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`admin-toast-notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setNotification(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="admin-nav-header">
        <div className="container admin-nav-inner">
          <div className="admin-brand">
            <span className="admin-badge">ADMIN</span>
            <h2>Portfolio Manager</h2>
          </div>

          <div className="admin-user-controls">
            <span className="user-email" title={currentUser?.email}>
              👤 {currentUser?.email || "Admin"}
            </span>
            <Link to="/" className="btn outline btn-sm" target="_blank" rel="noopener noreferrer">
              View Portfolio ↗
            </Link>
            <AnimatedThemeToggler />
            <button
              onClick={handleLogout}
              className="btn btn-sm logout-btn"
              title="Sign out of Admin"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="container admin-content">
        {/* Quick Stats & Action Bar */}
        <section className="admin-stats-bar">
          <div className="stat-card">
            <div className="stat-number">{projects.length}</div>
            <div className="stat-label">
              Total Projects &bull; {projects.filter((p) => p.isListed !== false).length} Listed
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{certificates.length}</div>
            <div className="stat-label">
              Total Certificates &bull; {certificates.filter((c) => c.isListed !== false).length} Listed
            </div>
          </div>
          <div className="stat-actions">
            <button className="btn" onClick={openNewProjectModal}>
              + Add Project
            </button>
            <button className="btn outline" onClick={openNewCertificateModal}>
              + Add Certificate
            </button>
          </div>
        </section>

        {/* Tab Switcher & Search Bar */}
        <div className="admin-toolbar">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              Projects ({projects.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "certificates" ? "active" : ""}`}
              onClick={() => setActiveTab("certificates")}
            >
              Certificates ({certificates.length})
            </button>
          </div>

          <div className="admin-filter-pills">
            <button
              type="button"
              className={`visibility-filter-btn ${visibilityFilter === "all" ? "active" : ""}`}
              onClick={() => setVisibilityFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`visibility-filter-btn ${visibilityFilter === "listed" ? "active" : ""}`}
              onClick={() => setVisibilityFilter("listed")}
            >
              ● Listed (
              {activeTab === "projects"
                ? projects.filter((p) => p.isListed !== false).length
                : certificates.filter((c) => c.isListed !== false).length}
              )
            </button>
            <button
              type="button"
              className={`visibility-filter-btn ${visibilityFilter === "unlisted" ? "active" : ""}`}
              onClick={() => setVisibilityFilter("unlisted")}
            >
              ○ Unlisted (
              {activeTab === "projects"
                ? projects.filter((p) => p.isListed === false).length
                : certificates.filter((c) => c.isListed === false).length}
              )
            </button>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <section className="admin-section">
            <div className="section-header">
              <h3>Manage Projects</h3>
              <button className="btn btn-sm" onClick={openNewProjectModal}>
                + Add Project
              </button>
            </div>

            {loadingProjects ? (
              <div className="admin-loading-state">
                <div className="spinner"></div>
                <p>Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="card admin-empty-card">
                <h4>No projects found</h4>
                <p className="muted">
                  {searchQuery ? "No projects match your search query." : "You haven't added any projects yet."}
                </p>
                <button className="btn" onClick={openNewProjectModal}>
                  + Create Your First Project
                </button>
              </div>
            ) : (
              <div className="admin-items-grid">
                {filteredProjects.map((proj) => (
                  <div className={`card admin-item-card ${proj.isListed === false ? "is-unlisted" : ""}`} key={proj.id}>
                    <div className="admin-card-media">
                      <span className={`admin-visibility-badge ${proj.isListed !== false ? "listed" : "unlisted"}`}>
                        {proj.isListed !== false ? "● Listed" : "○ Unlisted"}
                      </span>
                      {proj.thumbnail ? (
                        <img src={proj.thumbnail} alt={proj.name} />
                      ) : (
                        <div className="no-media-placeholder">No Image</div>
                      )}
                      <span className="admin-card-date">{formatMonthYear(proj.date)}</span>
                    </div>

                    <div className="admin-card-content">
                      <h4 className="admin-item-title">{proj.name}</h4>
                      <p className="admin-item-desc">{proj.description}</p>
                      
                      <div className="admin-item-links">
                        {proj.projectLink && (
                          <a
                            href={proj.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-chip live"
                          >
                            Live ↗
                          </a>
                        )}
                        {proj.sourceLink && (
                          <a
                            href={proj.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-chip code"
                          >
                            Code ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className={`btn btn-sm btn-toggle-listed ${proj.isListed !== false ? "listed" : "unlisted"}`}
                        onClick={() => toggleListStatus("projects", proj.id, proj.isListed !== false)}
                        title={proj.isListed !== false ? "Click to unlist (hide from public site)" : "Click to list (show on public site)"}
                      >
                        {proj.isListed !== false ? "Unlist" : "List"}
                      </button>
                      <button
                        className="btn outline btn-sm"
                        onClick={() => openEditProjectModal(proj)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete btn-sm"
                        onClick={() => requestDelete("projects", proj.id, proj.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === "certificates" && (
          <section className="admin-section">
            <div className="section-header">
              <h3>Manage Certificates</h3>
              <button className="btn btn-sm" onClick={openNewCertificateModal}>
                + Add Certificate
              </button>
            </div>

            {loadingCertificates ? (
              <div className="admin-loading-state">
                <div className="spinner"></div>
                <p>Loading certificates...</p>
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="card admin-empty-card">
                <h4>No certificates found</h4>
                <p className="muted">
                  {searchQuery ? "No certificates match your search query." : "You haven't added any certificates yet."}
                </p>
                <button className="btn" onClick={openNewCertificateModal}>
                  + Add Your First Certificate
                </button>
              </div>
            ) : (
              <div className="admin-items-grid">
                {filteredCertificates.map((cert) => (
                  <div className={`card admin-item-card ${cert.isListed === false ? "is-unlisted" : ""}`} key={cert.id}>
                    <div className="admin-card-media">
                      <span className={`admin-visibility-badge ${cert.isListed !== false ? "listed" : "unlisted"}`}>
                        {cert.isListed !== false ? "● Listed" : "○ Unlisted"}
                      </span>
                      {cert.image ? (
                        <img
                          src={cert.image.toLowerCase().includes(".pdf") ? cert.image.replace(/\.pdf$/i, ".jpg") : cert.image}
                          alt={cert.name}
                        />
                      ) : (
                        <div className="no-media-placeholder">No Image</div>
                      )}
                      <span className="admin-card-date">{formatMonthYear(cert.date)}</span>
                    </div>

                    <div className="admin-card-content">
                      <h4 className="admin-item-title">{cert.name}</h4>
                      {cert.category && (
                        <span className="status-badge" style={{ marginBottom: "6px", display: "inline-block", fontSize: "0.75rem" }}>
                          🏷️ {cert.category}
                        </span>
                      )}
                      <p className="admin-item-org">
                        🏢 {cert.organization || "Independent / Other"}
                      </p>

                      <div className="admin-item-links">
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-chip cred"
                          >
                            Verify Credential ↗
                          </a>
                        )}
                        {cert.image && (
                          <a
                            href={cert.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-chip live"
                          >
                            View File ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className={`btn btn-sm btn-toggle-listed ${cert.isListed !== false ? "listed" : "unlisted"}`}
                        onClick={() => toggleListStatus("certificates", cert.id, cert.isListed !== false)}
                        title={cert.isListed !== false ? "Click to unlist (hide from public site)" : "Click to list (show on public site)"}
                      >
                        {cert.isListed !== false ? "Unlist" : "List"}
                      </button>
                      <button
                        className="btn outline btn-sm"
                        onClick={() => openEditCertificateModal(cert)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete btn-sm"
                        onClick={() => requestDelete("certificates", cert.id, cert.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ===================== PROJECT MODAL ===================== */}
      {projectModalOpen && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setProjectModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProject ? "Edit Project" : "Add New Project"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                disabled={isSubmitting}
                onClick={() => setProjectModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="proj-name">Project Name *</label>
                <input
                  id="proj-name"
                  type="text"
                  placeholder="e.g. Netflix Clone"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="proj-date">Date (Month & Year) *</label>
                <input
                  id="proj-date"
                  type="month"
                  value={projectForm.date}
                  onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="proj-desc">Project Description *</label>
                <textarea
                  id="proj-desc"
                  rows="4"
                  placeholder="Describe your project, technologies used, key features..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              {/* Thumbnail Selector */}
              <div className="form-group image-selection-group">
                <label>Project Thumbnail *</label>
                <div className="radio-toggle-group">
                  <label className={`radio-pill ${projectForm.imageType === "upload" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="projImageType"
                      value="upload"
                      checked={projectForm.imageType === "upload"}
                      onChange={() => setProjectForm({ ...projectForm, imageType: "upload" })}
                    />
                    Upload File
                  </label>
                  <label className={`radio-pill ${projectForm.imageType === "url" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="projImageType"
                      value="url"
                      checked={projectForm.imageType === "url"}
                      onChange={() => setProjectForm({ ...projectForm, imageType: "url" })}
                    />
                    Image URL
                  </label>
                </div>

                {projectForm.imageType === "upload" ? (
                  <div className="upload-input-box">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleProjectFileChange}
                    />
                    <small className="muted">Upload image (PNG, JPG, WebP) or PDF to Cloudinary</small>
                  </div>
                ) : (
                  <div className="url-input-box">
                    <input
                      type="url"
                      placeholder="https://example.com/thumbnail.png"
                      value={projectForm.thumbnail}
                      onChange={(e) => {
                        setProjectForm({ ...projectForm, thumbnail: e.target.value });
                        setProjectPreview(e.target.value);
                      }}
                    />
                  </div>
                )}

                {projectPreview && (
                  <div className="image-preview-wrapper">
                    <span>Preview:</span>
                    <img src={projectPreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="proj-link">Live Project URL</label>
                  <input
                    id="proj-link"
                    type="url"
                    placeholder="https://myproject.com"
                    value={projectForm.projectLink}
                    onChange={(e) => setProjectForm({ ...projectForm, projectLink: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="proj-src">Source Code URL</label>
                  <input
                    id="proj-src"
                    type="url"
                    placeholder="https://github.com/..."
                    value={projectForm.sourceLink}
                    onChange={(e) => setProjectForm({ ...projectForm, sourceLink: e.target.value })}
                  />
                </div>
              </div>

              {/* Visibility Status */}
              <div className="form-group">
                <label>Visibility Status *</label>
                <div className="radio-toggle-group">
                  <label className={`radio-pill ${projectForm.isListed ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="projVisibility"
                      checked={projectForm.isListed}
                      onChange={() => setProjectForm({ ...projectForm, isListed: true })}
                    />
                    ● Listed (Visible on Public Site)
                  </label>
                  <label className={`radio-pill ${!projectForm.isListed ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="projVisibility"
                      checked={!projectForm.isListed}
                      onChange={() => setProjectForm({ ...projectForm, isListed: false })}
                    />
                    ○ Unlisted (Hidden from Public)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn outline"
                  disabled={isSubmitting}
                  onClick={() => setProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? "Saving Project..." : editingProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CERTIFICATE MODAL ===================== */}
      {certificateModalOpen && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setCertificateModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCertificate ? "Edit Certificate" : "Add New Certificate"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                disabled={isSubmitting}
                onClick={() => setCertificateModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCertificateSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="cert-name">Certificate Name *</label>
                <input
                  id="cert-name"
                  type="text"
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  value={certificateForm.name}
                  onChange={(e) => setCertificateForm({ ...certificateForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="cert-org">Issued Organization *</label>
                  <input
                    id="cert-org"
                    type="text"
                    placeholder="e.g. Google, Amazon, Coursera"
                    value={certificateForm.organization}
                    onChange={(e) =>
                      setCertificateForm({ ...certificateForm, organization: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cert-date">Date (Month & Year) *</label>
                  <input
                    id="cert-date"
                    type="month"
                    value={certificateForm.date}
                    onChange={(e) => setCertificateForm({ ...certificateForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="cert-domain">Org Domain / Logo / LinkedIn URL</label>
                  <input
                    id="cert-domain"
                    type="text"
                    placeholder="e.g. coursera.org"
                    value={certificateForm.orgDomain}
                    onChange={(e) => setCertificateForm({ ...certificateForm, orgDomain: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cert-cred">Credential Verification URL</label>
                  <input
                    id="cert-cred"
                    type="url"
                    placeholder="https://coursera.org/verify/..."
                    value={certificateForm.credentialUrl}
                    onChange={(e) =>
                      setCertificateForm({ ...certificateForm, credentialUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cert-category">Certificate Category</label>
                <select
                  id="cert-category"
                  value={certificateForm.category || ""}
                  onChange={(e) => setCertificateForm({ ...certificateForm, category: e.target.value })}
                >
                  <option value="">Auto-Detect from Title / Organization</option>
                  <option value="Courses & Certifications">Courses & Certifications</option>
                  <option value="Workshops & Training">Workshops & Training</option>
                  <option value="Competitions & Awards">Competitions & Awards</option>
                  <option value="Events & Participation">Events & Participation</option>
                </select>
              </div>

              {/* Certificate Image Selector */}
              <div className="form-group image-selection-group">
                <label>Certificate Image / Document *</label>
                <div className="radio-toggle-group">
                  <label className={`radio-pill ${certificateForm.imageType === "upload" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="certImageType"
                      value="upload"
                      checked={certificateForm.imageType === "upload"}
                      onChange={() => setCertificateForm({ ...certificateForm, imageType: "upload" })}
                    />
                    Upload File
                  </label>
                  <label className={`radio-pill ${certificateForm.imageType === "url" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="certImageType"
                      value="url"
                      checked={certificateForm.imageType === "url"}
                      onChange={() => setCertificateForm({ ...certificateForm, imageType: "url" })}
                    />
                    Image URL
                  </label>
                </div>

                {certificateForm.imageType === "upload" ? (
                  <div className="upload-input-box">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleCertFileChange}
                    />
                    <small className="muted">Upload Certificate (Image or PDF) to Cloudinary</small>
                  </div>
                ) : (
                  <div className="url-input-box">
                    <input
                      type="url"
                      placeholder="https://example.com/certificate.png"
                      value={certificateForm.image}
                      onChange={(e) => {
                        setCertificateForm({ ...certificateForm, image: e.target.value });
                        setCertPreview(e.target.value);
                      }}
                    />
                  </div>
                )}

                {certPreview && (
                  <div className="image-preview-wrapper">
                    <span>Preview:</span>
                    <img src={certPreview} alt="Preview" />
                  </div>
                )}
              </div>

              {/* Visibility Status */}
              <div className="form-group">
                <label>Visibility Status *</label>
                <div className="radio-toggle-group">
                  <label className={`radio-pill ${certificateForm.isListed ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="certVisibility"
                      checked={certificateForm.isListed}
                      onChange={() => setCertificateForm({ ...certificateForm, isListed: true })}
                    />
                    ● Listed (Visible on Public Site)
                  </label>
                  <label className={`radio-pill ${!certificateForm.isListed ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="certVisibility"
                      checked={!certificateForm.isListed}
                      onChange={() => setCertificateForm({ ...certificateForm, isListed: false })}
                    />
                    ○ Unlisted (Hidden from Public)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn outline"
                  disabled={isSubmitting}
                  onClick={() => setCertificateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving Certificate..."
                    : editingCertificate
                    ? "Save Changes"
                    : "Create Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION DIALOG ===================== */}
      {deleteConfirmOpen && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setDeleteConfirmOpen(false)}>
          <div className="modal-window delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "var(--red)" }}>Confirm Deletion</h3>
              <button
                type="button"
                className="modal-close-btn"
                disabled={isSubmitting}
                onClick={() => setDeleteConfirmOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete:
                <br />
                <strong>"{itemToDelete?.title}"</strong>?
              </p>
              <p className="muted" style={{ fontSize: "0.9rem" }}>
                This action cannot be undone and will remove it from the database immediately.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn outline"
                disabled={isSubmitting}
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-delete"
                disabled={isSubmitting}
                onClick={executeDelete}
              >
                {isSubmitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
