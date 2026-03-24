import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import './SignUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState('guest');
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        user_id:   data.user.id,
        full_name: form.full_name,
        email:     form.email,
        role:      role,
      }]);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    navigate(role === 'host' ? '/host' : '/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="auth-logo-text">SunnaStays</span>
        </div>

        <h2>Create your account</h2>
        <p className="auth-sub">Join thousands of Muslim travellers and hosts</p>

        <div className="role-toggle">
          <button className={`role-btn ${role === 'guest' ? 'active' : ''}`} onClick={() => setRole('guest')}>
            🌍 I want to travel
          </button>
          <button className={`role-btn ${role === 'host' ? 'active' : ''}`} onClick={() => setRole('host')}>
            🏠 I want to host
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" type="text" placeholder="Your full name"
            value={form.full_name} onChange={e => update('full_name', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => update('email', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Minimum 6 characters"
            value={form.password} onChange={e => update('password', e.target.value)} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-primary auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
