import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import Footer from './Footer';
import { PenLine } from 'lucide-react';
import { Signature} from 'lucide-react';
import { StickyNote } from 'lucide-react';
import {Gauge} from 'lucide-react';
import {Lock} from 'lucide-react';
import { Rocket } from 'lucide-react';
import MiniEditorPreview from './MiniEditorPreview'
function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
const benefits = [
  {
    icon: <PenLine size={20} />,
    title: 'Easy editing',
    description: 'Edit text, images, and pages with ease.',
  },
  {
    icon: <Signature size={20} />,
    title: 'Digital signatures',
    description: 'Sign PDFs securely in seconds.',
  },
  {
    icon: <StickyNote size={20} />,
    title: 'Quick conversion',
    description: 'Convert files with a single click.',
  },
  {
    icon: <Gauge size={20} />,
    title: 'Fast & simple',
    description: 'Built for speed and simplicity.',
  },
  {
    icon: <Lock size={20} />,
    title: '100% private',
    description: 'Keep your files private and secure.',
  },
  {
    icon: <Rocket size={20} />,
    title: 'Lightweight',
    description: 'Fast, lightweight, and easy to use.',
  },
 
];
  return (
    <>
      {/* HEADER CU LOGO ȘI HAMBURGER */}
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

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-subtitle">NovoPDF</p>
         <p className="hero-text-big">
  Transform the way you work with PDFs<br />
  <span>all in one place, free and easy.</span>
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
           NovoPDF is a free, browser based PDF tool built to simplify document editing and make your life easier.<br />
            Create new PDFs, edit existing files, add digital signatures, and convert documents<br />
            into multiple formats all in one place, without installing any software.
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
        <h2>
          <span>Why choose our PDF editor</span>
            </h2>

        <div className="content">
  <div className="help-right">
    {benefits.map((benefit, index) => (
      <div className="benefit-card" key={index}>
        <div className="benefit-icon">{benefit.icon}</div>
        <div>
          <h3>{benefit.title}</h3>
          <p>{benefit.description}</p>
        </div>
      </div>
    ))}
  </div>

  <div className="help-left">
    <h1>
  <span>Work smarter. Keep it simple.</span>
</h1>
    <p>
      NovoPDF gives you everything you need to
      <br />
      edit, sign, and manage your PDFs without
      <br />
      complicated software or unnecessary steps.
    </p>
      
  </div>
</div>
       
<MiniEditorPreview />

        <p className="subtext">
           No installs. No clutter. Just a fast and
          <br />
           simple PDF workspace built for everyday use.
        </p>

        <Link to="/editor" className="cta-button">
          Edit, Sign & Convert Your PDFs Instantly
        </Link>

        <small className="small">
          Everything is completely free, without limitations, directly in your browser.
        </small>
      </section>
          <Footer />
    </>
  );
}

export default LandingPage;
