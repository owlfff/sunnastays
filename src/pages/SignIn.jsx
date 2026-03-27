import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import './SignUp.css';

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    navigate(redirect);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="auth-logo-text">SunnaStays</span>
        </div>

        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your SunnaStays account</p>

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => update('email', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Your password"
            value={form.password} onChange={e => update('password', e.target.value)} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-primary auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
