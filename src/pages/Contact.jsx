import { useEffect, useState, useRef } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import SocialDock from "../components/SocialDock";

export default function Contact() {
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    document.title = "Contact - Abijith S Pillai";

    return () => {
      document.title = "Abijith S Pillai | Web Developer Portfolio";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage(null);

    const form = formRef.current;
    const payload = {
      name: form.from_name.value.trim(),
      email: form.reply_to.value.trim(),
      message: form.message.value.trim(),
      _gotcha: form._gotcha ? form._gotcha.value : "",
    };

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while sending. Please try again later.");
      }

      setMessage({
        type: "success",
        text: "Thanks for reaching out! Your message was sent successfully.",
      });
      form.reset();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Something went wrong while sending. Please try again later.",
      });
      console.error("Email submission error:", error);
    } finally {
      setSending(false);
    }
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

        <div className="contact-form-column" data-aos="fade-left">
          <div className="card contact-form-card">
            <h3>Send a Message</h3>

            <form id="contact-form" ref={formRef} onSubmit={handleSubmit} className="natural-contact-form">
              <input
                type="text"
                name="_gotcha"
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

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
