import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './SignUp.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the user lands via the reset link.
    // The SDK automatically exchanges the URL hash tokens for a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!password) { setError('Please enter a new password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => navigate('/signin'), 3000);
  };

  if (done) return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="auth-logo-text">Sunna<span>Stays</span></span>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
            Password updated
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.6 }}>
            Your password has been changed. Redirecting you to sign in…
          </p>
        </div>
      </div>
    </div>
  );

  if (!ready) return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="auth-logo-text">Sunna<span>Stays</span></span>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔗</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
            Invalid or expired link
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>
            This password reset link has expired or already been used. Please request a new one.
          </p>
          <button className="btn-primary" style={{ width: '100%', borderRadius: 14, padding: 14 }} onClick={() => navigate('/forgot-password')}>
            Request new link
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

        <h2>Set new password</h2>
        <p className="auth-sub">Choose a strong password for your account</p>

        <div className="form-group">
          <label className="form-label">New password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm new password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Repeat your new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-primary auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
}
