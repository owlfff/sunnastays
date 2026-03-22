import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
            <a onClick={() => navigate('/search')}>Search stays</a>
            <a href="#">Destinations</a>
            <a href="#">Weekend escapes</a>
            <a href="#">Family villas</a>
          </div>
          <div className="footer-col">
            <h4>Hosting</h4>
            <a onClick={() => navigate('/host')}>List your property</a>
            <a href="#">Halal Charter</a>
            <a href="#">Host resources</a>
            <a href="#">Verification</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
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
