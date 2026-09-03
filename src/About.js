import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import Footer from './Footer';
import { useEffect } from 'react';


function About() {
 const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    document.querySelectorAll(
      '.about-hero, .about-story, .privacy-card, .features-section, .about-cta'
    ).forEach(el => observer.observe(el))

    return () => observer.disconnect()
    
  }, [])


  const features = [
    {
      icon: '✍️',
      title: 'Rich-text editing',
      description:
        'Edit text directly on your PDF with a simple and intuitive editing experience.',
    },
    {
      icon: '🖼️',
      title: 'Insert images',
      description:
        'Add images to your documents and resize or position them exactly where you want.',
    },
    {
      icon: '✒️',
      title: 'Digital signatures',
      description:
        'Sign your documents digitally in seconds without printing or scanning anything.',
    },
    {
      icon: '📄',
      title: 'Instant PDF export',
      description:
        'Export clean, professional PDFs instantly when your document is ready.',
    },
    {
      icon: '🔒',
      title: '100% private',
      description:
        'Your files stay on your device. NovoPDF does not upload your documents to a server.',
    },
    {
      icon: '⚡',
      title: 'Fast & lightweight',
      description:
        'Everything runs directly in your browser for a fast and seamless experience.',
    },
  ];

  return (
    <div className="about-page">
<header>
        <Link to="/">
          <img className="logo" src="/novopdf logo.png" alt="NovoPDF Logo" />
        </Link>

        <nav>
          <ul className={`nav-links ${menuOpen ? 'nav-active' : ''}`}>
  
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/about">About</Link></li>
        
          </ul>
        </nav>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span id="hamburger-lines">☰</span>
        </div>
      </header>
      {/* Hero */}
      <section className="about-hero">
        <div className="about-badge">
          <span>✦</span> Simple. Private. Powerful.
        </div>

        <h1>
          PDF editing,{' '}
          <span>without the complexity.</span>
        </h1>

        <p>
          NovoPDF started as a personal project with one simple idea:
          make PDF editing fast, accessible, and completely private.
        </p>

        <div className="about-hero-stats">
          <div>
            <strong>100%</strong>
            <span>Private</span>
          </div>

          <div>
            <strong>5+</strong>
            <span>Editing tools</span>
          </div>

          <div>
            <strong>0</strong>
            <span>Uploads</span>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="about-story">
        <div className="about-section-label">OUR STORY</div>

        <h2>Built from scratch, with privacy in mind.</h2>

        <p>
          NovoPDF started as a personal project built entirely by one
          developer. The goal was simple: create a PDF editor that feels
          modern, fast, and easy to use without forcing users into
          subscriptions or complicated software.
        </p>

        <p>
          Built with React, Tiptap, pdf-lib, and React PDF, NovoPDF runs
          entirely on the client side. Your documents stay on your device
          instead of being uploaded to a remote server.
        </p>
      </section>

      {/* Privacy card */}
      <section className="privacy-card">
        <div className="privacy-icon">🔒</div>

        <div>
          <div className="about-section-label">YOUR FILES STAY YOURS</div>

          <h2>Privacy isn't an option. It's the default.</h2>

          <p>
            NovoPDF processes your documents directly in your browser.
            No server-side processing. No unnecessary uploads. No one
            looking at your files.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="about-section-label">WHAT NOVOPDF CAN DO</div>

        <h2>Everything you need to work with PDFs.</h2>

        <p className="features-subtitle">
          Powerful editing features packed into a simple experience.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="about-cta">
        <h2>Ready to edit your next PDF?</h2>

        <p>
          No downloads. No subscriptions. Just open NovoPDF and get started.
        </p>

         <Link to="/editor" className="about-cta-button">
            Start editing →
          </Link>
      </section>

      <Footer />
    </div>
  );
}

export default About;