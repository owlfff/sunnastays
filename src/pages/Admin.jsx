import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/signin'); return; }
      setUser(user);
      loadProperties();
    });
  }, [navigate]);

  const loadProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setProperties(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', id);
    if (!error) loadProperties();
  };

  const filtered = properties.filter(p => p.status === filter);

  const counts = {
    pending:  properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo" onClick={() => navigate('/')}>
            <div className="nav-logo-mark">س</div>
            <span className="admin-logo-text">SunnaStays Admin</span>
          </div>
        </div>
        <div className="admin-header-right">
          <span className="admin-user">{user?.email}</span>
          <button className="admin-signout" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-body">
        <h1 className="admin-title">Property Listings</h1>
        <p className="admin-sub">Review and approve halal-certified property submissions</p>

        <div className="admin-stats">
          <div className="stat-card stat-pending">
            <div className="stat-num">{counts.pending}</div>
            <div className="stat-label">Pending review</div>
          </div>
          <div className="stat-card stat-approved">
            <div className="stat-num">{counts.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card stat-rejected">
            <div className="stat-num">{counts.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div className="admin-filters">
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              className={`admin-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loading">Loading properties…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No {filter} properties</div>
        ) : (
          <div className="admin-grid">
            {filtered.map(p => (
              <div key={p.id} className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-name">{p.name || '—'}</div>
                    <div className="admin-card-loc">📍 {p.city}, {p.country}</div>
                  </div>
                  <div className={`admin-status admin-status--${p.status}`}>
                    {p.status}
                  </div>
                </div>

                <div className="admin-card-details">
                  <div className="admin-detail"><span>Type</span><strong>{p.type || '—'}</strong></div>
                  <div className="admin-detail"><span>Price</span><strong>£{p.price} / night</strong></div>
                  <div className="admin-detail"><span>Bedrooms</span><strong>{p.bedrooms}</strong></div>
                  <div className="admin-detail"><span>Max guests</span><strong>{p.max_guests}</strong></div>
                </div>

                {p.photos && p.photos.length > 0 ? (
                  <div className="admin-photos">
                    {p.photos.map((url, i) => (
                      <img key={i} src={url} alt={`Property ${i+1}`} className="admin-photo" />
                    ))}
                  </div>
                ) : (
                  <div className="admin-no-photos">No photos uploaded</div>
                )}

                {p.description && (
                  <p className="admin-card-desc">{p.description}</p>
                )}

                <div className="admin-card-submitted">
                  Submitted {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                {p.status === 'pending' && (
                  <div className="admin-card-actions">
                    <button className="admin-btn-approve" onClick={() => updateStatus(p.id, 'approved')}>
                      ✓ Approve
                    </button>
                    <button className="admin-btn-reject" onClick={() => updateStatus(p.id, 'rejected')}>
                      ✕ Reject
                    </button>
                  </div>
                )}

                {p.status === 'approved' && (
                  <div className="admin-card-actions">
                    <button className="admin-btn-reject" onClick={() => updateStatus(p.id, 'rejected')}>
                      ✕ Revoke approval
                    </button>
                  </div>
                )}

                {p.status === 'rejected' && (
                  <div className="admin-card-actions">
                    <button className="admin-btn-approve" onClick={() => updateStatus(p.id, 'approved')}>
                      ✓ Approve instead
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
