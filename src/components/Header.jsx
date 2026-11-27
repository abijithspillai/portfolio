import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <div className="container nav-row">
        <NavLink className="logo" to="/">
          Abijith S Pillai
        </NavLink>
        <nav className={`nav-links${menuOpen ? " open" : ""}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/projects" onClick={() => setMenuOpen(false)}>
            Projects
          </NavLink>
          <NavLink to="/certificates" onClick={() => setMenuOpen(false)}>
            Certificates
          </NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </NavLink>
          <AnimatedThemeToggler />
        </nav>
        <button
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
