import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

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
            <button onClick={() => navigate('/search')}>Destinations</button>
            <button onClick={() => navigate('/search')}>Weekend escapes</button>
            <button onClick={() => navigate('/search')}>Family villas</button>
          </div>
          <div className="footer-col">
            <h4>Hosting</h4>
            <button onClick={() => navigate(user ? '/host' : '/signup')}>List your property</button>
            <button onClick={() => navigate('/halal-charter')}>Halal Charter</button>
            <button onClick={() => navigate('/host-agreement')}>Host Agreement</button>
            <button onClick={() => navigate('/cancellation-policy')}>Cancellation policy</button>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <button onClick={() => navigate('/about')}>About us</button>
            <button onClick={() => navigate('/coming-soon')}>Blog</button>
            <button onClick={() => navigate('/coming-soon')}>Careers</button>
            <button onClick={() => navigate('/contact')}>Contact</button>
          </div>
        </div>

        <div className="footer-legal-links">
          <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
          <span className="footer-legal-dot">·</span>
          <button onClick={() => navigate('/terms')}>Terms of Service</button>
          <span className="footer-legal-dot">·</span>
          <button onClick={() => navigate('/cookies')}>Cookie Policy</button>
          <span className="footer-legal-dot">·</span>
          <button onClick={() => navigate('/cancellation-policy')}>Cancellations</button>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2026 SunnaStays Ltd · Registered in England and Wales</div>
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
