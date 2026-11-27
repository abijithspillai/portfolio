import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ajceLogo from "../assets/ajcelogo.jpg";
import awsLogo from "../assets/aws academy.png";
import blankspaceLogo from "../assets/blankspace.png";
import ciscoLogo from "../assets/cisco.png";
import gcloudLogo from "../assets/Gcloud.png";
import ieeeLogo from "../assets/ieee.jpg";
import anthropicLogo from "../assets/images.png";
import ipsrLogo from "../assets/ipsr.jpg";
import kdiscLogo from "../assets/kdisk.png";
import nasaLogo from "../assets/nasaspaceapp.jpg";
import nestLogo from "../assets/nest.png";
import nptelLogo from "../assets/nptel.jpg";
import sapLogo from "../assets/sap.jpg";

function formatMonthYear(isoDate) {
  if (!isoDate || !isoDate.includes("-")) return isoDate || "N/A";
  const [year, month] = isoDate.split("-");
  const dateObj = new Date(year, month - 1);
  return dateObj.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// Generate smart acronym or initials for organizations
function getOrgInitials(name) {
  if (!name) return "CERT";
  const stopWords = new Set(["of", "and", "the", "for", "in", "on", "at", "to", "a", "an"]);
  const words = name
    .trim()
    .split(/[\s-]+/)
    .filter((w) => w.length > 0 && !stopWords.has(w.toLowerCase()));

  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  if (words.length <= 4) {
    return words.map((w) => w[0]).join("").toUpperCase();
  }
  return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
}

// Helper to determine the best logo URL for an organization
function getOrgLogoUrl(organization, orgDomain, certName) {
  const text = `${organization || ""} ${certName || ""}`.toLowerCase();

  // 1. Local assets for verified organizations (Highest priority)
  if (
    text.includes("amal jyothi") ||
    text.includes("ajce") ||
    text.includes("amaljyothi") ||
    text.includes("ai club ajce")
  ) {
    return ajceLogo;
  }

  if (
    text.includes("google") ||
    text.includes("gcloud") ||
    text.includes("gemini")
  ) {
    return gcloudLogo;
  }

  if (
    text.includes("aws") ||
    text.includes("amazon web services")
  ) {
    return awsLogo;
  }

  if (
    text.includes("cisco") ||
    text.includes("netacad")
  ) {
    return ciscoLogo;
  }

  if (
    text.includes("anthropic") ||
    text.includes("claude")
  ) {
    return anthropicLogo;
  }

  if (
    text.includes("nasa") ||
    text.includes("space apps")
  ) {
    return nasaLogo;
  }

  if (
    text.includes("sap")
  ) {
    return sapLogo;
  }

  if (
    text.includes("nptel") ||
    text.includes("swayam")
  ) {
    return nptelLogo;
  }

  if (
    text.includes("ipsr")
  ) {
    return ipsrLogo;
  }

  if (
    text.includes("kerala development") ||
    text.includes("k-disc") ||
    text.includes("kdisc") ||
    text.includes("yip")
  ) {
    return kdiscLogo;
  }

  if (
    text.includes("nest digital") ||
    text.includes("nest")
  ) {
    return nestLogo;
  }

  if (
    text.includes("blankspace")
  ) {
    return blankspaceLogo;
  }

  if (
    text.includes("ieee")
  ) {
    return ieeeLogo;
  }

  // 2. St. Joseph's College of Engineering and Technology (SJCET)
  if (
    text.includes("sjcet") ||
    text.includes("st joseph") ||
    text.includes("st. joseph") ||
    text.includes("st.joseph") ||
    text.includes("joseph")
  ) {
    return "https://www.google.com/s2/favicons?domain=sjcetpalai.ac.in&sz=128";
  }

  // 3. Direct image URL or host provided in orgDomain (e.g. LinkedIn CDN media.licdn.com, Cloudinary, etc.)
  if (orgDomain) {
    const trimmed = orgDomain.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const parsed = new URL(trimmed);
        const host = parsed.hostname.toLowerCase();

        // Direct image hosts or image paths (including original LinkedIn company logos)
        if (
          host.includes("licdn.com") ||
          host.includes("cloudinary.com") ||
          host.includes("googleusercontent.com") ||
          host.includes("githubusercontent.com") ||
          parsed.pathname.includes("company-logo") ||
          parsed.pathname.includes("logo") ||
          parsed.pathname.includes("image") ||
          /\.(png|jpg|jpeg|svg|webp|ico|gif)(\?.*)?$/i.test(trimmed)
        ) {
          return trimmed;
        }

        // Company website URL (e.g. https://ipsrsolutions.com)
        if (!host.includes("linkedin.com")) {
          const cleanHost = host.replace(/^www\./, "");
          return `https://www.google.com/s2/favicons?domain=${cleanHost}&sz=128`;
        }
      } catch {
        // Fall through
      }
    } else {
      // Clean domain string (e.g. "coursera.org" or "be10x.in")
      const cleanDomain = trimmed.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
      if (cleanDomain.includes(".") && cleanDomain.length > 3 && !cleanDomain.includes("linkedin.com")) {
        return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
      }
    }
  }

  // 4. Other Online Platforms
  if (text.includes("be10x")) {
    return "https://www.google.com/s2/favicons?domain=be10x.in&sz=128";
  }
  if (text.includes("simplilearn")) {
    return "https://www.google.com/s2/favicons?domain=simplilearn.com&sz=128";
  }
  if (text.includes("hack2skill")) {
    return "https://www.google.com/s2/favicons?domain=hack2skill.com&sz=128";
  }
  if (text.includes("coursera")) return "https://cdn.simpleicons.org/coursera/0056D2";
  if (text.includes("udemy")) return "https://cdn.simpleicons.org/udemy/A435F0";
  if (text.includes("freecodecamp")) return "https://cdn.simpleicons.org/freecodecamp";
  if (text.includes("hackerrank")) return "https://cdn.simpleicons.org/hackerrank/00EA64";
  if (text.includes("linkedin")) return "https://cdn.simpleicons.org/linkedin";
  if (text.includes("ibm")) return "https://cdn.simpleicons.org/ibm/052FAD";
  if (text.includes("microsoft")) return "https://cdn.simpleicons.org/microsoft";

  return null;
}

// Logo badge component with smart monogram fallback (no generic globes!)
function OrgLogo({ organization, orgDomain, certName }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getOrgLogoUrl(organization, orgDomain, certName);
  const initials = getOrgInitials(organization || certName);

  if (!logoUrl || imgError) {
    return (
      <div className="cert-org-avatar" title={organization || certName || "Organization"}>
        {initials}
      </div>
    );
  }

  return (
    <div className="cert-org-logo-wrapper">
      <img
        src={logoUrl}
        alt={`${organization || certName || "Organization"} logo`}
        className="cert-org-logo"
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          // If Google returns its default 16x16 fallback globe, discard it
          if (
            e.target.naturalWidth <= 16 &&
            e.target.naturalHeight <= 16 &&
            typeof logoUrl === "string" &&
            logoUrl.includes("favicons?domain=")
          ) {
            setImgError(true);
          }
        }}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
}

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState("all"); // "all" | "verified" | "completion"
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    document.title = "Certificates - Abijith S Pillai Portfolio";

    async function loadCertificates() {
      try {
        const certsRef = collection(db, "certificates");
        const q = query(certsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const list = [];
        snapshot.forEach((docSnap) => {
          const c = docSnap.data();
          if (c.isListed === false || c.listed === false) return;
          let org = c.organization;
          const nameLower = (c.name || "").toLowerCase();

          // Auto-detect organization if field was omitted or N/A
          if (!org || org.trim() === "" || org.toUpperCase() === "N/A") {
            if (nameLower.includes("google") || nameLower.includes("gemini")) org = "Google Cloud";
            else if (nameLower.includes("nasa") || nameLower.includes("space apps")) org = "NASA";
            else if (nameLower.includes("ieee")) org = "IEEE";
            else if (nameLower.includes("ajce") || nameLower.includes("amal jyothi")) org = "Amal Jyothi College of Engineering";
            else if (nameLower.includes("sjcet") || nameLower.includes("st joseph")) org = "St. Joseph's College of Engineering and Technology";
            else if (nameLower.includes("cisco")) org = "Cisco Networking Academy";
            else if (nameLower.includes("anthropic") || nameLower.includes("claude")) org = "Anthropic";
            else if (nameLower.includes("ipsr")) org = "ipsr solutions ltd";
            else if (nameLower.includes("nptel")) org = "NPTEL";
            else if (nameLower.includes("aws")) org = "AWS Academy";
            else if (nameLower.includes("sap")) org = "SAP";
            else if (nameLower.includes("blankspace")) org = "Blankspace";
            else if (nameLower.includes("nest")) org = "NeST Digital";
            else if (nameLower.includes("k-disc") || nameLower.includes("kdisc") || nameLower.includes("yip")) org = "Kerala Development and Innovation Strategic Council";
          }

          const isPdf = c.image && c.image.toLowerCase().includes(".pdf");
          const displayUrl = isPdf ? c.image.replace(/\.pdf$/i, ".jpg") : c.image;
          list.push({ id: docSnap.id, ...c, organization: org, displayUrl, isPdf });
        });

        setCertificates(list);
      } catch (err) {
        console.error("Error loading certificates:", err);
        setError("Failed to load certificates. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();

    return () => {
      document.title = "Abijith S Pillai | Web Developer Portfolio";
    };
  }, []);

  // Keyboard accessibility for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedCert(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Counts
  const withCredCount = certificates.filter(
    (c) => Boolean(c.credentialUrl && c.credentialUrl.trim() !== "")
  ).length;
  const withoutCredCount = certificates.length - withCredCount;

  // Filtered List
  const filteredCerts = certificates.filter((c) => {
    const hasCred = Boolean(c.credentialUrl && c.credentialUrl.trim() !== "");
    if (activeTab === "with" && !hasCred) return false;
    if (activeTab === "without" && hasCred) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchOrg = c.organization?.toLowerCase().includes(q);
      const matchDomain = c.orgDomain?.toLowerCase().includes(q);
      return matchName || matchOrg || matchDomain;
    }
    return true;
  });

  return (
    <div className="certificates-page">
      <div className="certs-page-header">
        <h1>My Certificates</h1>
        <p className="tagline">
          Verified credentials, certifications, and technical achievements.
        </p>
      </div>

      {/* Toolbar: Filters and Search */}
      {!loading && !error && certificates.length > 0 && (
        <div className="certs-toolbar">
          <div className="certs-filter-tabs">
            <button
              className={`certs-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({certificates.length})
            </button>
            <button
              className={`certs-tab ${activeTab === "with" ? "active" : ""}`}
              onClick={() => setActiveTab("with")}
            >
              With Credential ({withCredCount})
            </button>
            <button
              className={`certs-tab ${activeTab === "without" ? "active" : ""}`}
              onClick={() => setActiveTab("without")}
            >
              Without Credential ({withoutCredCount})
            </button>
          </div>

          <div className="certs-search-box">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by title or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="certs-loading-state">
          <div className="spinner"></div>
          <p>Loading certificates...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card certs-empty-card">
          <h3>Oops!</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCerts.length === 0 && (
        <div className="card certs-empty-card">
          <h3>No Certificates Found</h3>
          <p className="muted">
            {searchQuery
              ? `No certificates found matching "${searchQuery}".`
              : "No certificates available in this section."}
          </p>
          {searchQuery && (
            <button className="btn outline btn-sm" onClick={() => setSearchQuery("")}>
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Certificates Grid */}
      {!loading && !error && filteredCerts.length > 0 && (
        <div className="certs-showcase-grid">
          {filteredCerts.map((cert) => (
            <div className="card cert-card-modern" key={cert.id}>
              {/* Image Preview Container */}
              <div
                className="cert-card-media"
                onClick={() => setSelectedCert(cert)}
                title="Click to view certificate"
              >
                <img
                  src={cert.displayUrl || ""}
                  alt={`${cert.name} certificate`}
                  loading="lazy"
                />
                <div className="cert-hover-overlay">
                  <span className="cert-expand-pill">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    Preview
                  </span>
                </div>

                {/* Status Badges */}
                <div className="cert-badges-wrapper">
                  {cert.credentialUrl && (
                    <span className="cert-badge verified">Verified</span>
                  )}
                  {cert.isPdf && (
                    <span className="cert-badge pdf">PDF</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="cert-card-body">
                {/* Organization Header with Logo and Name */}
                <div className="cert-org-row">
                  <OrgLogo
                    organization={cert.organization}
                    orgDomain={cert.orgDomain}
                    certName={cert.name}
                  />
                  <div className="cert-org-text">
                    <span className="cert-org-name" title={cert.organization}>
                      {cert.organization || "Independent"}
                    </span>
                    <span className="cert-date-text">
                      {formatMonthYear(cert.date)}
                    </span>
                  </div>
                </div>

                <h3 className="cert-title" title={cert.name}>
                  {cert.name}
                </h3>
              </div>

              {/* Card Actions */}
              <div className="cert-card-actions">
                {cert.credentialUrl ? (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm cert-action-btn"
                  >
                    View Credential ↗
                  </a>
                ) : (
                  <button
                    type="button"
                    className="btn outline btn-sm cert-action-btn"
                    onClick={() => setSelectedCert(cert)}
                  >
                    View Certificate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Certificate Viewer Modal */}
      {selectedCert && (
        <div
          className="cert-modal-backdrop"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="cert-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="cert-modal-header">
              <div className="cert-modal-org-meta">
                <OrgLogo
                  organization={selectedCert.organization}
                  orgDomain={selectedCert.orgDomain}
                  certName={selectedCert.name}
                />
                <div>
                  <h3 className="cert-modal-title">{selectedCert.name}</h3>
                  <div className="cert-modal-subtitle">
                    <span className="cert-modal-org">
                      {selectedCert.organization || "Organization"}
                    </span>
                    <span className="dot-separator">•</span>
                    <span>{formatMonthYear(selectedCert.date)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="cert-modal-close"
                onClick={() => setSelectedCert(null)}
                aria-label="Close certificate viewer"
              >
                &times;
              </button>
            </div>

            {/* Modal Image Viewer */}
            <div className="cert-modal-image-wrapper">
              <img
                src={selectedCert.displayUrl || ""}
                alt={`${selectedCert.name} full view`}
              />
            </div>

            {/* Modal Actions Footer */}
            <div className="cert-modal-footer">
              <div className="cert-modal-footer-info">
                {selectedCert.credentialUrl && (
                  <span className="cert-badge verified">✓ Credential Verified</span>
                )}
              </div>

              <div className="cert-modal-footer-btns">
                {selectedCert.image && (
                  <a
                    href={selectedCert.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn outline btn-sm"
                  >
                    Open Original {selectedCert.isPdf ? "PDF" : "Image"} ↗
                  </a>
                )}
                {selectedCert.credentialUrl && (
                  <a
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                  >
                    Verify Credential ↗
                  </a>
                )}
                <button
                  type="button"
                  className="btn outline btn-sm"
                  onClick={() => setSelectedCert(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
