import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import Footer from './Footer';

function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // simulare trimitere
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <>
      <style>{`
        .contact-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #DCE8FF, #b8d0ff, #a0bcff);
          font-family: 'Segoe UI', sans-serif;
        }

        .contact-hero {
          text-align: center;
          padding: 80px 20px 40px;
        }

        .contact-hero h1 {
          font-size: 3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .contact-hero p {
          font-size: 1.2rem;
          color: #475569;
          max-width: 500px;
          margin: 0 auto;
        }

        .contact-wrapper {
          display: flex;
          gap: 40px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 40px 80px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* ---- INFO CARDS ---- */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
          min-width: 260px;
          max-width: 320px;
        }

        .info-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 18px;
          padding: 24px 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(99,102,241,0.15);
        }

        .info-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .info-card h3 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 4px;
        }

        .info-card p, .info-card a {
          font-size: 1rem;
          color: #1e293b;
          font-weight: 500;
          margin: 0;
          text-decoration: none;
        }

        .info-card a:hover { color: #6366f1; }

        /* ---- FORM ---- */
        .contact-form-box {
          flex: 2;
          min-width: 300px;
          max-width: 640px;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.85);
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow: 0 8px 40px rgba(99,102,241,0.12);
        }

        .contact-form-box h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 28px;
        }

        .form-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 200px;
          margin-bottom: 18px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.95rem;
          font-family: 'Segoe UI', sans-serif;
          color: #1e293b;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: none;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }

        .form-group textarea {
          min-height: 130px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          letter-spacing: 0.3px;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        /* ---- SUCCESS ---- */
        .success-box {
          text-align: center;
          padding: 40px 20px;
        }

        .success-icon {
          font-size: 60px;
          margin-bottom: 16px;
        }

        .success-box h3 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .success-box p {
          color: #64748b;
          font-size: 1rem;
        }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 768px) {
          .contact-hero h1 { font-size: 2rem; }
          .contact-wrapper { padding: 20px 20px 60px; gap: 24px; }
          .contact-form-box { padding: 28px 20px; }
          .contact-info { max-width: 100%; flex-direction: row; flex-wrap: wrap; }
          .info-card { flex: 1; min-width: 140px; }
        }

        @media (max-width: 480px) {
          .contact-hero h1 { font-size: 1.6rem; }
          .contact-hero p { font-size: 1rem; }
          .contact-info { flex-direction: column; }
          .form-row { flex-direction: column; }
        }
      `}</style>

      <div className="contact-page">

        {/* HEADER */}
        <header>
          <Link to="/">
            <img className="logo" src="/novopdf logo.png" alt="NovoPDF Logo" />
          </Link>
          <nav>
            <ul className={`nav-links ${menuOpen ? 'nav-active' : ''}`}>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><a href="#reviews">Reviews</a></li>
            </ul>
          </nav>
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span>☰</span>
          </div>
        </header>

        {/* HERO TEXT */}
        <div className="contact-hero">
          <h1>Get in touch 👋</h1>
          <p>Have a question, feedback, or just want to say hi? I'd love to hear from you.</p>
        </div>

        {/* CONTENT */}
        <div className="contact-wrapper">

          {/* INFO CARDS */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📧</div>
              <div>
                <h3>Email</h3>
                <a href="mailto:marioddev@gmail.com">marioddev@gmail.com</a>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📅</div>
              <div>
                <h3>Book a call</h3>
                <a href="https://calendly.com/mariodumidesign/30min" target="_blank" rel="noreferrer">
                  Schedule on Calendly
                </a>
              </div>
            </div>

         

            <div className="info-card">
              <div className="info-icon">🌍</div>
              <div>
                <h3>Based in</h3>
                <p>Romania 🇷🇴</p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="contact-form-box">
            {sent ? (
              <div className="success-box">
                <div className="success-icon">✅</div>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <>
                <h2>Send us a message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required>
                      <option value="">Select a topic...</option>
                      <option value="general">General question</option>
                      <option value="bug">Report a bug</option>
                      <option value="feature">Feature request</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      name="message"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? '⏳ Sending...' : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
       <Footer />
    </>
  );
}

export default Contact;