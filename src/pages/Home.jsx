import { useEffect, useRef, useCallback } from "react";
import SocialDock from "../components/SocialDock";
import { InteractiveHoverButton } from "@/registry/magicui/interactive-hover-button";

import myPicture from "../assets/mypicture.png";
import ajceLogo from "../assets/ajcelogo.jpg";
import sjpsLogo from "../assets/sjpslogo.png";

const skills = [
  { name: "Python", category: "Languages", icon: "https://cdn.simpleicons.org/python" },
  { name: "Java", category: "Languages", icon: "https://cdn.simpleicons.org/java" },
  { name: "C", category: "Languages", icon: "https://cdn.simpleicons.org/c" },
  { name: "JavaScript", category: "Languages", icon: "https://cdn.simpleicons.org/javascript" },
  { name: "React", category: "Frontend", icon: "https://cdn.simpleicons.org/react" },
  { name: "HTML5", category: "Frontend", icon: "https://cdn.simpleicons.org/html5" },
  { name: "CSS3", category: "Frontend", icon: "https://cdn.simpleicons.org/css" },
  { name: "Firebase", category: "Backend & Cloud", icon: "https://cdn.simpleicons.org/firebase" },
  { name: "Git", category: "Tools", icon: "https://cdn.simpleicons.org/git" },
  { name: "GitHub", category: "Tools", icon: "https://cdn.simpleicons.org/github" },
  { name: "Web Technologies", category: "Core", icon: "https://img.icons8.com/fluency/48/domain.png" },
  { name: "AI/ML Concepts", category: "Core", icon: "https://img.icons8.com/fluency/48/artificial-intelligence.png" },
];

export default function Home() {
  const typingTextRef = useRef(null);
  const terminalSectionRef = useRef(null);

  const startTyping = useCallback(() => {
    const typingText = typingTextRef.current;
    if (!typingText) return;

    typingText.innerHTML = "";

    const textToType =
      "run build_portfolio\\n> Assembling components...\\n> Optimizing algorithms...\\n> Ready to deploy.";
    let index = 0;

    typingText.dataset.typing = "true";

    function type() {
      if (!typingTextRef.current || typingTextRef.current.dataset.typing !== "true") return;

      if (index < textToType.length) {
        if (textToType.substring(index, index + 2) === "\\n") {
          typingText.innerHTML += "<br>";
          index += 2;
        } else {
          typingText.innerHTML += textToType.charAt(index);
          index++;
        }
        setTimeout(type, 45 + Math.random() * 45);
      }
    }

    setTimeout(type, 600);
  }, []);

  useEffect(() => {
    const terminalSection = terminalSectionRef.current;
    const typingEl = typingTextRef.current;

    if (terminalSection) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          startTyping();
          observer.disconnect();
        }
      });
      observer.observe(terminalSection);

      return () => {
        observer.disconnect();
        if (typingEl) {
          typingEl.dataset.typing = "false";
        }
      };
    }
  }, [startTyping]);

  return (
    <div className="home-page">
      {/* 2-Column Hero Section: Left Text & CTA, Right Photo */}
      <section className="hero-two-column">
        {/* Left Column: Introductions & Actions */}
        <div className="hero-content" data-aos="fade-right">
          <h1 id="display-name" className="hero-name">
            Hi, I'm <span className="highlight">Abijith S Pillai</span>
          </h1>

          <div className="subtitle-wrapper">
            <p className="subtitle">Web Developer &amp; AI Enthusiast</p>
          </div>

          <p className="tagline">
            B.Tech Computer Science student at Amal Jyothi College of Engineering.
            Crafting high-performance web applications, intelligent interfaces, and elegant software solutions.
          </p>

          <div className="cta hero-cta">
            <InteractiveHoverButton to="/projects">
              View Projects
            </InteractiveHoverButton>
            <InteractiveHoverButton to="/contact" variant="outline">
              Get In Touch
            </InteractiveHoverButton>
            <InteractiveHoverButton href="/resume.pdf" download variant="outline">
              Resume ⤓
            </InteractiveHoverButton>
          </div>

          {/* Quick social dock */}
          <div className="hero-dock-container">
            <SocialDock />
          </div>
        </div>

        {/* Right Column: Photo in Modern Presentation */}
        <div className="hero-visual" data-aos="fade-left">
          <div className="hero-photo-wrapper">
            <div className="photo-card">
              <img
                src={myPicture}
                alt="Abijith S Pillai"
                className="hero-main-photo"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Typing Simulation */}
      <section
        id="terminal-section"
        className="terminal-section"
        ref={terminalSectionRef}
        data-aos="fade-up"
      >
        <div className="terminal-window">
          <div className="terminal-header">
            <span className="btn-close"></span>
            <span className="btn-min"></span>
            <span className="btn-max"></span>
            <span className="terminal-title">guest@portfolio:~</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-prompt">
              <span className="user">guest@abijith</span>:<span className="dir">~</span>${" "}
              <span className="typing-text" ref={typingTextRef}></span>
              <span className="cursor">&nbsp;</span>
            </p>
          </div>
        </div>
      </section>

      {/* About Me Section (Structured & Enhanced) */}
      <section id="about" className="about-section">
        <h2 data-aos="fade-up">About Me</h2>
        <div className="about-grid" data-aos="fade-up">
          <div className="card about-main-card">
            <h3>Who I Am</h3>
            <p>
              I am an aspiring software developer currently pursuing a B.Tech in Computer Science and
              Engineering at <strong>Amal Jyothi College of Engineering</strong>. Driven by curiosity and a commitment
              to continuous learning, I love bridging the gap between innovative software design and real-world impact.
            </p>
            <p>
              My hands-on development journey spans foundational programming in C, Python, and Java,
              modern responsive web engineering with React, JavaScript, HTML5/CSS3, and cloud integrations with Firebase.
              Whether architecting full-stack applications, exploring generative AI workflows, or participating in hackathons,
              I am always eager to solve challenging problems.
            </p>
          </div>
        </div>
      </section>

      {/* Education Timeline */}
      <section id="education" className="education">
        <h2 data-aos="fade-up">Education Timeline</h2>
        <div className="timeline" data-aos="fade-up">
          <div className="timeline-item" data-aos="fade-right">
            <div className="timeline-dot"></div>
            <div className="timeline-content card glass-card">
              <div className="timeline-header">
                <img src={ajceLogo} alt="Amal Jyothi Logo" className="timeline-logo" />
                <div>
                  <h3>Amal Jyothi College of Engineering</h3>
                  <p className="timeline-date">2024 - 2028</p>
                </div>
              </div>
              <p className="timeline-text">
                Pursuing B.Tech in Computer Science and Engineering. Active member of technical clubs,
                hackathons, and recipient of the Director's Honours List.
              </p>
            </div>
          </div>

          <div className="timeline-item" data-aos="fade-right" data-aos-delay="100">
            <div className="timeline-dot"></div>
            <div className="timeline-content card glass-card">
              <div className="timeline-header">
                <img
                  src={sjpsLogo}
                  alt="St Joseph's Public School Logo"
                  className="timeline-logo"
                />
                <div>
                  <h3>St Joseph's Public School</h3>
                  <p className="timeline-date">2010 - 2024</p>
                </div>
              </div>
              <p className="timeline-text">
                Completed secondary and higher secondary education with strong foundations in science and mathematics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Skills Section */}
      <section id="skills" className="skills-section">
        <h2 data-aos="fade-up">Key Technical Skills</h2>
        <p className="section-subtitle" data-aos="fade-up">
          Technologies and tools I work with to bring digital products to life.
        </p>

        <div className="skills-pills" data-aos="fade-up">
          {skills.map((skill, i) => (
            <div
              className="skill"
              key={skill.name}
              data-aos="zoom-in"
              data-aos-delay={i * 40}
            >
              <img src={skill.icon} alt={`${skill.name} logo`} />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Home Bottom Call-To-Action */}
      <section className="home-cta-section" data-aos="fade-up">
        <div className="card home-cta-card">
          <h2>Let's Build Something Great Together</h2>
          <p>
            Whether you have an interesting project, an internship opportunity, or just want to chat tech,
            my inbox is always open!
          </p>
          <div className="cta">
            <InteractiveHoverButton to="/contact">
              Send a Message
            </InteractiveHoverButton>
            <InteractiveHoverButton to="/projects" variant="outline">
              Explore All Projects
            </InteractiveHoverButton>
          </div>
        </div>
      </section>
    </div>
  );
}
