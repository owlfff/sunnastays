import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSearch } from '../hooks/useSearch';
import SearchBar from './SearchBar';
import './Nav.css';

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const search = useSearch();

  React.useEffect(() => {
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

  const isAuth = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <nav className="nav nav--solid">
      {/* LEFT — Logo */}
      <Link to="/" className="nav-logo">
        <div className="nav-logo-mark">س</div>
        <span className="nav-logo-text nav-logo-text--desktop">Sunna<span>Stays</span></span>
      </Link>

      {/* CENTRE — Search bar */}
      {!isAuth && (
        <div className="nav-search-wrap">
          <SearchBar search={search} compact />
        </div>
      )}

      {/* RIGHT — Auth links */}
      <div className="nav-right">
        {user ? (
          <>
            <button className="nav-link nav-signin" onClick={() => navigate('/dashboard/guest')}>My trips</button>
            <button className="nav-link nav-signin" onClick={() => navigate('/dashboard/host')}>My listings</button>
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
