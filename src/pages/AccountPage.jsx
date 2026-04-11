import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './AccountPage.css';

const AVATARS = ['👤','😊','🧑','👨','👩','🧔','👱','🧕','👲','🎩','😎','🤓','🧑‍💼','👨‍💼','👩‍💼'];

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    phone: '',
    bio: '',
    avatar_emoji: '👤',
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { navigate('/signin'); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setForm({
          display_name: profile.display_name || '',
          phone:        profile.phone || '',
          bio:          profile.bio || '',
          avatar_emoji: profile.avatar_emoji || '👤',
        });
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id:      user.id,
        display_name: form.display_name,
        phone:        form.phone,
        bio:          form.bio,
        avatar_emoji: form.avatar_emoji,
      }, { onConflict: 'user_id' });
    console.log('Save error:', error);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    window.dispatchEvent(new CustomEvent('profile-updated'));
  };

  if (loading) return (
    <div className="account-page">
      <div className="account-loading">Loading…</div>
    </div>
  );

  return (
    <div className="account-page">
      <div className="account-header">
        <div className="account-header-left">
          <div className="dashboard-logo" onClick={() => navigate('/')}>
            <div className="nav-logo-mark">س</div>
            <span className="dashboard-logo-text">SunnaStays</span>
          </div>
          <span className="dashboard-tag">My Account</span>
        </div>
        <div className="account-header-right">
          <button className="dashboard-nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="dashboard-nav-btn" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>Sign out</button>
        </div>
      </div>

      <div className="account-body">
        <div className="account-card">

          {/* AVATAR PICKER */}
          <div className="account-avatar-section">
            <div className="account-avatar-display">{form.avatar_emoji}</div>
            <div>
              <div className="account-avatar-name">{form.display_name || user?.email}</div>
              <div className="account-avatar-email">{user?.email}</div>
            </div>
          </div>

          <div className="account-avatar-picker">
            <div className="account-section-label">Choose your avatar</div>
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <button key={a}
                  className={`avatar-option ${form.avatar_emoji === a ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({...f, avatar_emoji: a}))}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <hr className="account-divider" />

          {/* PROFILE FORM */}
          <div className="account-section-label">Profile details</div>

          <div className="form-group">
            <label className="form-label">Display name</label>
            <input className="form-input" type="text"
              placeholder="How you'll appear to hosts and guests"
              value={form.display_name}
              onChange={e => setForm(f => ({...f, display_name: e.target.value}))} />
          </div>

          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input className="form-input" type="tel"
              placeholder="+44 7700 000000"
              value={form.phone}
              onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
          </div>

          <div className="form-group">
            <label className="form-label">About you <span style={{fontWeight:300,color:'var(--ink-soft)'}}>(optional)</span></label>
            <textarea className="form-input form-textarea" rows={3}
              placeholder="Tell hosts a little about yourself…"
              value={form.bio}
              onChange={e => setForm(f => ({...f, bio: e.target.value}))} />
          </div>

          <hr className="account-divider" />

          {/* ACCOUNT INFO */}
          <div className="account-section-label">Account</div>
          <div className="account-info-row">
            <span>Email address</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="account-info-row">
            <span>Member since</span>
            <strong>{new Date(user?.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
          </div>

          <button className="btn-primary account-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
