import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

function formatMonthYear(isoDate) {
  if (!isoDate || !isoDate.includes("-")) return isoDate || "N/A";
  const [year, month] = isoDate.split("-");
  const dateObj = new Date(year, month - 1);
  return dateObj.toLocaleString("en-US", { month: "long", year: "numeric" });
}

const KNOWN_TECHS = [
  { name: "React", pattern: /\breact(\.js)?\b/i },
  { name: "Node.js", pattern: /\bnode(\.js)?\b/i },
  { name: "Python", pattern: /\bpython\b/i },
  { name: "JavaScript", pattern: /\b(javascript|js|es6)\b/i },
  { name: "TypeScript", pattern: /\b(typescript|ts)\b/i },
  { name: "Firebase", pattern: /\bfirebase\b/i },
  { name: "HTML5/CSS3", pattern: /\b(html5?|css3?)\b/i },
  { name: "Tailwind CSS", pattern: /\btailwind(\s?css)?\b/i },
  { name: "Java", pattern: /\bjava\b/i },
  { name: "SQL", pattern: /\b(sql|mysql|postgresql)\b/i },
  { name: "MongoDB", pattern: /\bmongo(db)?\b/i },
  { name: "Three.js", pattern: /\bthree(\.js)?\b/i },
  { name: "Vite", pattern: /\bvite\b/i },
  { name: "REST API", pattern: /\b(api|rest|restful)\b/i },
  { name: "Cloudinary", pattern: /\bcloudinary\b/i },
  { name: "Next.js", pattern: /\bnext(\.js)?\b/i },
  { name: "Express", pattern: /\bexpress(\.js)?\b/i },
  { name: "Bootstrap", pattern: /\bbootstrap\b/i },
];

function extractTechTags(text) {
  if (!text) return [];
  const tags = [];
  KNOWN_TECHS.forEach((tech) => {
    if (tech.pattern.test(text)) {
      tags.push(tech.name);
    }
  });
  return tags;
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState("all"); // "all" | "live" | "source"
  const [selectedTech, setSelectedTech] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal for preview
  const [previewProject, setPreviewProject] = useState(null);

  useEffect(() => {
    document.title = "Projects - Abijith S Pillai Portfolio";

    async function loadProjects() {
      try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const data = [];
        snapshot.forEach((doc) => {
          const p = doc.data();
          if (p.isListed === false || p.listed === false) return;
          const combinedText = `${p.name || ""} ${p.description || ""}`;
          const tags = extractTechTags(combinedText);
          data.push({ id: doc.id, ...p, tags });
        });

        setProjects(data);
      } catch (err) {
        console.error("Error loading projects:", err);
        setError("There was an error loading projects. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();

    return () => {
      document.title = "Abijith S Pillai | Web Developer Portfolio";
    };
  }, []);

  // Keyboard accessibility for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setPreviewProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute counts
  const liveCount = projects.filter((p) => Boolean(p.projectLink && p.projectLink.trim())).length;
  const sourceCount = projects.filter((p) => Boolean(p.sourceLink && p.sourceLink.trim())).length;

  // Compute popular technology tags across all projects
  const allUniqueTags = Array.from(
    new Set(projects.flatMap((p) => p.tags || []))
  );

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const hasLive = Boolean(p.projectLink && p.projectLink.trim());
    const hasSource = Boolean(p.sourceLink && p.sourceLink.trim());

    if (activeTab === "live" && !hasLive) return false;
    if (activeTab === "source" && !hasSource) return false;

    if (selectedTech && (!p.tags || !p.tags.includes(selectedTech))) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
      return matchName || matchDesc || matchTag;
    }

    return true;
  });

  return (
    <div className="projects-page-wrapper">
      <div className="projects-header-section">
        <h1>Featured Projects</h1>
        <p className="tagline">
          Explore my recent web applications, interactive software, and engineering experiments.
        </p>
      </div>

      {/* Toolbar: Category Tabs & Search Bar */}
      {!loading && !error && projects.length > 0 && (
        <div className="projects-toolbar">
          <div className="projects-tabs">
            <button
              className={`project-tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Projects ({projects.length})
            </button>
            <button
              className={`project-tab-btn ${activeTab === "live" ? "active" : ""}`}
              onClick={() => setActiveTab("live")}
            >
              Live Apps ({liveCount})
            </button>
            <button
              className={`project-tab-btn ${activeTab === "source" ? "active" : ""}`}
              onClick={() => setActiveTab("source")}
            >
              Open Source ({sourceCount})
            </button>
          </div>

          <div className="projects-search-wrapper">
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
              placeholder="Search projects by name, keyword, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tech Filter Pills (if any tags found) */}
      {!loading && allUniqueTags.length > 0 && (
        <div className="tech-filter-pills">
          <span className="filter-label">Filter by Tech:</span>
          <button
            className={`tech-pill ${selectedTech === null ? "active" : ""}`}
            onClick={() => setSelectedTech(null)}
          >
            All
          </button>
          {allUniqueTags.map((tech) => (
            <button
              key={tech}
              className={`tech-pill ${selectedTech === tech ? "active" : ""}`}
              onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
            >
              {tech}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="projects-loading-state">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card projects-empty-state">
          <h3>Oops!</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="card projects-empty-state">
          <h3>No Projects Found</h3>
          <p className="muted">
            {searchQuery || selectedTech
              ? "No projects matched your search criteria."
              : "No projects in this category yet."}
          </p>
          {(searchQuery || selectedTech || activeTab !== "all") && (
            <button
              className="btn outline btn-sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedTech(null);
                setActiveTab("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Projects Showcase Cards Grid */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="projects-showcase-grid">
          {filteredProjects.map((p) => (
            <div className="card modern-project-card" key={p.id}>
              {/* Media Thumbnail */}
              <div
                className="project-media-box"
                onClick={() => setPreviewProject(p)}
                title="Click to view full preview"
              >
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={`${p.name} preview`}
                    loading="lazy"
                  />
                ) : (
                  <div className="project-placeholder-media">
                    <span>Project Preview</span>
                  </div>
                )}

                <div className="project-media-overlay">
                  <span className="project-zoom-btn">
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

                {/* Floating Chips */}
                <div className="project-floating-badges">
                  {p.projectLink && (
                    <span className="live-status-badge">
                      <span className="pulse-dot"></span> Live
                    </span>
                  )}
                  <span className="project-date-chip">
                    {formatMonthYear(p.date)}
                  </span>
                </div>
              </div>

              {/* Project Card Info */}
              <div className="project-details">
                <div className="project-title-row">
                  <h3 className="project-title" title={p.name}>
                    {p.name}
                  </h3>
                </div>

                <p className="project-desc">{p.description}</p>

                {/* Auto-detected Tech Stack Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="project-tech-tags">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`tech-chip ${selectedTech === tag ? "highlight" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTech(selectedTech === tag ? null : tag);
                        }}
                        title={`Filter by ${tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="project-actions-row">
                  {p.projectLink && (
                    <a
                      href={p.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm project-btn-primary"
                    >
                      Live Demo ↗
                    </a>
                  )}
                  {p.sourceLink && (
                    <a
                      href={p.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn outline btn-sm project-btn-secondary"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ marginRight: "4px" }}
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                      </svg>
                      Source Code
                    </a>
                  )}
                  {!p.projectLink && !p.sourceLink && (
                    <button
                      type="button"
                      className="btn outline btn-sm"
                      onClick={() => setPreviewProject(p)}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Project Modal Preview */}
      {previewProject && (
        <div
          className="project-modal-backdrop"
          onClick={() => setPreviewProject(null)}
        >
          <div
            className="project-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="project-modal-header">
              <div>
                <h3 className="project-modal-title">{previewProject.name}</h3>
                <span className="project-modal-date">
                  {formatMonthYear(previewProject.date)}
                </span>
              </div>
              <button
                type="button"
                className="project-modal-close"
                onClick={() => setPreviewProject(null)}
                aria-label="Close project modal"
              >
                &times;
              </button>
            </div>

            <div className="project-modal-image-wrapper">
              <img
                src={previewProject.thumbnail}
                alt={`${previewProject.name} full preview`}
              />
            </div>

            <div className="project-modal-body">
              <p className="project-modal-desc">{previewProject.description}</p>

              {previewProject.tags && previewProject.tags.length > 0 && (
                <div className="project-tech-tags" style={{ margin: "14px 0" }}>
                  {previewProject.tags.map((t) => (
                    <span key={t} className="tech-chip">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="project-modal-footer">
              <div className="project-modal-actions">
                {previewProject.projectLink && (
                  <a
                    href={previewProject.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                  >
                    Open Live Project ↗
                  </a>
                )}
                {previewProject.sourceLink && (
                  <a
                    href={previewProject.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn outline btn-sm"
                  >
                    GitHub Source ↗
                  </a>
                )}
                <button
                  type="button"
                  className="btn outline btn-sm"
                  onClick={() => setPreviewProject(null)}
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
