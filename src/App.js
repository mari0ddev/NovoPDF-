import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Editor from './Editor';
import './App.css';

function App() {

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
      '.hero-subtitle, .hero-text-big, .hero-text h3, .cta-btn, .hero-subtitle-1, .hero-text-big-1, .hero-desc-1, .hero-image img, .hero-images-1 img, .help-section h2, .help-left h1, .help-right ul, .help-section .subtext'
    ).forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
