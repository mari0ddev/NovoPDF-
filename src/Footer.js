import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';


function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #DCE8FF, #b8d0ff, #a0bcff)',
      color: '#94a3b8',
      padding: '40px 60px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 20,
      fontFamily: "Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;",
    }}>
      <div>
        <img src="/novopdf logo.png" alt="NovoPDF" className="footer-logo" style={{ width: 100, marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: 13 ,color: '#2c2f32' }}>© 2026 NovoPDF. All rights reserved.</p>
      </div>

      <div style={{ display: 'flex', gap: 32,marginRight: 100 }}>
        <Link to="/contact" className="footer-link">Contact</Link>
  <Link to="/about" className="footer-link">About</Link>
  <Link to="/editor" className="footer-link">Editor</Link>
      </div>

      <p style={{ margin: 0, fontSize: 13,color: '#2c2f32' }}>made by mari0ddev</p>
    </footer>
  )
}

export default Footer;