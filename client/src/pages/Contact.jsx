import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to an API endpoint
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="page-content">
      <section className="page-header">
        <h1>Contact Us</h1>
        <p className="page-header-subtitle">
          Have questions, suggestions, or need help? We'd love to hear from you.
        </p>
      </section>

      <div className="contact-wrapper">
        {/* Contact Form */}
        <div className="contact-form-card">
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Message Sent!</h3>
              <p>
                Thank you for reaching out. We'll get back to you as soon as
                possible.
              </p>
              <button
                className="btn-primary"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2>Send Us a Message</h2>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-primary btn-submit">
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="contact-info-card">
          <h2>Get in Touch</h2>
          <div className="contact-info-item">
            <div className="contact-info-icon">📧</div>
            <div>
              <h4>Email</h4>
              <p>support@ytconverter.com</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">⏰</div>
            <div>
              <h4>Response Time</h4>
              <p>We typically respond within 24 hours</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">🌍</div>
            <div>
              <h4>Location</h4>
              <p>Available worldwide, 24/7</p>
            </div>
          </div>

          <div className="contact-faq">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-item">
              <h4>Is the service free?</h4>
              <p>
                Yes! Our YouTube to MP3 converter is completely free to use with
                no hidden charges.
              </p>
            </div>
            <div className="faq-item">
              <h4>What formats are supported?</h4>
              <p>
                We currently support MP3 and MP4 formats with high quality audio
                extraction.
              </p>
            </div>
            <div className="faq-item">
              <h4>Is there a file size limit?</h4>
              <p>
                We support videos up to 2 hours in length. For longer videos,
                please contact us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
