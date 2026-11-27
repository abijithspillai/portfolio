import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ParticleBackground from "./components/ParticleBackground";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Certificates from "./pages/Certificates";
import Contact from "./pages/Contact";

const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));

import AOS from "aos";
import "aos/dist/aos.css";

const ROUTE_FAVICONS = {
  "/": "/favicons/home.svg",
  "/projects": "/favicons/projects.svg",
  "/certificates": "/favicons/certificates.svg",
  "/contact": "/favicons/contact.svg",
  "/login": "/favicons/admin.svg",
  "/admin": "/favicons/admin.svg",
};

function useDynamicFavicon() {
  const { pathname } = useLocation();

  useEffect(() => {
    let iconUrl = ROUTE_FAVICONS[pathname];
    if (!iconUrl) {
      if (pathname.startsWith("/admin")) {
        iconUrl = "/favicons/admin.svg";
      } else if (pathname.startsWith("/projects")) {
        iconUrl = "/favicons/projects.svg";
      } else if (pathname.startsWith("/certificates")) {
        iconUrl = "/favicons/certificates.svg";
      } else if (pathname.startsWith("/contact")) {
        iconUrl = "/favicons/contact.svg";
      } else {
        iconUrl = "/favicons/home.svg";
      }
    }

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = iconUrl;
  }, [pathname]);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Refresh AOS whenever route changes
    AOS.refresh();
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/login";

  useDynamicFavicon();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    // Add a slightly delayed refresh for when fonts/images load
    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }, []);

  return (
    <>
      <ParticleBackground />
      {!isAdminRoute && <Header />}
      <ScrollToTop />
      <main className={isAdminRoute ? "admin-page-main" : "container"}>
        <Suspense
          fallback={
            <div className="login-loading-screen">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
