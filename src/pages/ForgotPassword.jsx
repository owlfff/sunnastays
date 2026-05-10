import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import './SignUp.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
  };

  if (sent) return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="auth-logo-text">Sunna<span>Stays</span></span>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
            Check your email
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>
            We've sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
          </p>
          <div style={{ background: 'var(--sand)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
            Can't find it? Check your spam folder.
          </div>
          <button className="btn-primary" style={{ width: '100%', borderRadius: 14, padding: 14 }} onClick={() => navigate('/signin')}>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="auth-logo-text">Sunna<span>Stays</span></span>
        </div>

        <h2>Reset your password</h2>
        <p className="auth-sub">Enter your email and we'll send you a reset link</p>

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-primary auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>

        <p className="auth-switch">
          Remembered it? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
