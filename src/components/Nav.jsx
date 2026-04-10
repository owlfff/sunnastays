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
  const [profile, setProfile] = useState(null);
  const search = useSearch();

  React.useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('display_name, avatar_emoji').eq('user_id', user.id).single();
        if (data) setProfile(data);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('display_name, avatar_emoji').eq('user_id', session.user.id).single();
        if (data) setProfile(data);
      } else {
        setProfile(null);
      }
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
            <button className="nav-avatar-btn" onClick={() => navigate('/account')}>
              <span className="nav-avatar-emoji">{profile?.avatar_emoji || '👤'}</span>
              <span className="nav-avatar-name">{profile?.display_name || user.email.split('@')[0]}</span>
            </button>
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
