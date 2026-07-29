import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* HEADER CU LOGO ȘI HAMBURGER */}
      <header>
        <Link to="/">
          <img className="logo" src="/novopdf logo.png" alt="NovoPDF Logo" />
        </Link>

        <nav>
          <ul className={`nav-links ${menuOpen ? 'nav-active' : ''}`}>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#reviews">Reviews</a></li>
          </ul>
        </nav>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span id="hamburger-lines">☰</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-subtitle">NovoPDF</p>
          <p className="hero-text-big">
            Transform the way you work with PDFs<br />
            all in one place, free and easy.
          </p>
          <h3>Save time, work quickly, and deliver professional documents.</h3>

       
          <Link to="/editor" className="cta-btn">
            Start
          </Link>
        </div>

        <div className="hero-image">
          <img src="/poza main.png" alt="NovoPDF Hero" />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="hero-1">
        <div className="hero-text-1">
          <p className="hero-subtitle-1">About us</p>
          <p className="hero-text-big-1">
           NovoPDF is a free, browser-based PDF tool built to simplify document editing and make your life easier.<br />
            Create new PDFs, edit existing files, add digital signatures, and convert documents<br />
            nto multiple formats all in one place, without installing any software.
          </p>
          <h3 className="hero-desc-1">
            Fast, intuitive, and secure, NovoPDF lets you focus on your work, not the tools.
          </h3>
        </div>

        <div className="hero-images-1">
          <img src="/pdf pc.png" alt="NovoPDF PC" />
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="help-section">
        <h2>Why choose our PDF editor?</h2>

        <div className="content">
          <div className="help-left">
            <h1>
              Work with your PDFs faster and easier using a clean, browser-based workspace designed for simplicity and privacy.
              <br />No learning curve, no hidden steps. Just open, edit, and done  exactly how it should be.
              
            </h1>
          </div>

          <div className="help-right">
            <ul>
              <li>Edit text, images, and pages with ease</li>
              <li>Sign PDFs securely in seconds</li>
              <li>Convert files with a single click</li>
              <li>Built for speed and simplicity</li>
              <li>Keep your files private nothing is stored permanently</li>
              <li>Fast, lightweight, and easy to use</li>
              <li>Simple experience with zero learning curve</li>
            </ul>
          </div>
        </div>

        <p className="subtext">
         No installs. No clutter. Just a fast and simple PDF workspace built for everyday use.
        </p>

        <Link to="/editor" className="cta-button">
          Edit, Sign & Convert Your PDFs Instantly
        </Link>

        <small className="small">
          Everything is completely free, without limitations, directly in your browser.
        </small>
      </section>
    </>
  );
}

export default LandingPage;
