import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import './Nav.css';

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`nav ${scrolled || !isHome ? 'nav--solid' : ''}`}>
      <Link to="/" className="nav-logo">
        <div className="nav-logo-mark">س</div>
        <span className="nav-logo-text">Sunna<span>Stays</span></span>
      </Link>
      <div className="nav-right">
        <Link to="/search" className="nav-link">Explore</Link>
        {user ? (
          <>
            <span className="nav-user">👤 {user.email}</span>
            <button className="nav-link nav-signin" onClick={handleSignOut}>Sign out</button>
          </>
        ) : (
          <>
            <button className="nav-link nav-signin" onClick={() => navigate('/signin')}>Sign in</button>
            <button className="nav-link nav-signin" onClick={() => navigate('/signup')}>Sign up</button>
          </>
        )}
        <button className="nav-host-btn" onClick={() => navigate('/host')}>
          List your property
        </button>
      </div>
    </nav>
  );
}
