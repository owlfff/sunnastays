import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="nav-logo-mark">س</div>
              <span className="footer-logo-text">SunnaStays</span>
            </div>
            <p>Halal-certified short stays for the modern Muslim traveller. Travel without compromise.</p>
            <div className="footer-arabic">إقامة حلال في كل مكان</div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <button onClick={() => navigate('/search')}>Search stays</button>
            <button>Destinations</button>
            <button>Weekend escapes</button>
            <button>Family villas</button>
          </div>
          <div className="footer-col">
            <h4>Hosting</h4>
            <button onClick={() => navigate('/host')}>List your property</button>
            <button>Halal Charter</button>
            <button>Host resources</button>
            <button>Verification</button>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <button>About us</button>
            <button>Blog</button>
            <button>Careers</button>
            <button>Contact</button>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 SunnaStays Ltd · sunnastays.com</div>
          <div className="footer-badges">
            <span className="footer-badge">✓ Halal Certified</span>
            <span className="footer-badge">🔒 Secure Payments</span>
            <span className="footer-badge">🌍 38 Countries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
