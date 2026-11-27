import { useEffect, useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { Send, CheckCircle2 } from "lucide-react";
import SocialDock from "../components/SocialDock";

export default function Contact() {
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    document.title = "Contact - Abijith S Pillai";

    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }

    return () => {
      document.title = "Abijith S Pillai | Web Developer Portfolio";
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setMessage(null);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

    if (!serviceId || !templateId) {
      setMessage({
        type: "error",
        text: "Email service is not configured. Please check environment variables.",
      });
      setSending(false);
      return;
    }

    emailjs
      .sendForm(serviceId, templateId, formRef.current)
      .then(
        () => {
          setMessage({
            type: "success",
            text: "Thanks for reaching out! Your message was sent successfully.",
          });
          formRef.current.reset();
        },
        (error) => {
          setMessage({
            type: "error",
            text: "Something went wrong while sending. Please try again later.",
          });
          console.error("EmailJS error:", error);
        }
      )
      .finally(() => {
        setSending(false);
      });
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-header" data-aos="fade-up">
        <h1 className="contact-title">
          <span className="highlight">Contact</span>
        </h1>
        <p className="contact-subtitle">
          Have a question, an opportunity, or just want to say hi? Feel free to drop a message below or connect with me online.
        </p>
      </div>

      <div className="contact-layout-grid">
        {/* Left: Connect & Socials */}
        <div className="contact-info-column" data-aos="fade-right">
          <div className="card contact-hub-card">
            <h3>Let's Connect</h3>
            <p className="muted">
              I'm always happy to talk about software engineering, web technologies, or potential projects and collaborations.
            </p>

            <div className="contact-dock-section">
              <span className="dock-section-label">Profiles &amp; Links</span>
              <SocialDock showActions={false} />
            </div>
          </div>
        </div>

        {/* Right: Clean, Natural Form */}
        <div className="contact-form-column" data-aos="fade-left">
          <div className="card contact-form-card">
            <h3>Send a Message</h3>

            <form id="contact-form" ref={formRef} onSubmit={handleSubmit} className="natural-contact-form">
              <div className="form-field-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="from_name"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="reply_to"
                  placeholder="Your email address"
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Write your message here..."
                  rows={5}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn contact-submit-btn"
                id="submit-btn"
                disabled={sending}
              >
                {sending ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`form-feedback-card ${message.type}`} role="alert">
                {message.type === "success" && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                <p className="m-0">{message.text}</p>
                <button
                  type="button"
                  className="feedback-dismiss"
                  onClick={() => setMessage(null)}
                  aria-label="Dismiss message"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
