import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Nav.css';

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`nav ${scrolled || !isHome ? 'nav--solid' : ''}`}>
      <Link to="/" className="nav-logo">
        <div className="nav-logo-mark">س</div>
        <span className="nav-logo-text">Sunna<span>Stays</span></span>
      </Link>
      <div className="nav-right">
        <Link to="/search" className="nav-link">Explore</Link>
        <a href="#" className="nav-link">Sign in</a>
        <button className="nav-host-btn" onClick={() => navigate('/host')}>
          List your property
        </button>
      </div>
    </nav>
  );
}
