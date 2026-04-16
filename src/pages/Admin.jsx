import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [hostProfiles, setHostProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*, properties(name, city, country)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setBookings(data || []));

    supabase
      .from('reviews')
      .select('*, properties(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data || []));

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { navigate('/signin'); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (!profile || profile.role !== 'admin') { navigate('/'); return; }
      setChecking(false);
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
    if (!error && data) {
      setProperties(data);
      const hostIds = [...new Set(data.map(p => p.host_id).filter(Boolean))];
      if (hostIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, full_name, email, phone, created_at')
          .in('user_id', hostIds);
        if (profiles) {
          const map = {};
          profiles.forEach(p => { map[p.user_id] = p; });
          setHostProfiles(map);
        }
      }
    }
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

  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = d => { const dt = new Date(d); return dt.getDate() + ' ' + MONTHS_SHORT[dt.getMonth()] + ' ' + dt.getFullYear(); };

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter);
  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.total_price || 0), 0);

  if (checking) return null;

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
        {/* STATS */}
        <div className="admin-stats">
          <div className="admin-stat"><div className="admin-stat-num">{bookings.length}</div><div className="admin-stat-label">Total bookings</div></div>
          <div className="admin-stat"><div className="admin-stat-num" style={{color:'var(--terra)'}}>{bookings.filter(b=>b.status==='pending').length}</div><div className="admin-stat-label">Pending</div></div>
          <div className="admin-stat"><div className="admin-stat-num" style={{color:'var(--success)'}}>{bookings.filter(b=>b.status==='confirmed').length}</div><div className="admin-stat-label">Confirmed</div></div>
          <div className="admin-stat"><div className="admin-stat-num">£{totalRevenue.toLocaleString()}</div><div className="admin-stat-label">Total revenue</div></div>
          <div className="admin-stat"><div className="admin-stat-num">{properties.length}</div><div className="admin-stat-label">Properties</div></div>
        </div>

        {/* TABS */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab==='properties'?'active':''}`} onClick={()=>setActiveTab('properties')}>Properties</button>
          <button className={`admin-tab ${activeTab==='bookings'?'active':''}`} onClick={()=>setActiveTab('bookings')}>
            Bookings {bookings.filter(b=>b.status==='pending').length > 0 && <span className="dash-badge">{bookings.filter(b=>b.status==='pending').length}</span>}
          </button>
          <button className={`admin-tab ${activeTab==='reviews'?'active':''}`} onClick={()=>setActiveTab('reviews')}>
            Reviews {reviews.filter(r=>r.status==='pending').length > 0 && <span className="dash-badge">{reviews.filter(r=>r.status==='pending').length}</span>}
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div>
            <div className="dash-filters" style={{marginBottom:20}}>
              {['all','pending','confirmed','rejected'].map(s => (
                <button key={s} className={`dash-filter-btn ${bookingFilter===s?'active':''}`} onClick={()=>setBookingFilter(s)}>
                  {s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1)} ({s==='all'?bookings.length:bookings.filter(b=>b.status===s).length})
                </button>
              ))}
            </div>
            {filteredBookings.length === 0 ? (
              <div className="dashboard-empty"><div className="dashboard-empty-icon">📋</div><p>No {bookingFilter} bookings</p></div>
            ) : (
              <div className="dash-bookings-list">
                {filteredBookings.map(b => (
                  <div key={b.id} className="dash-booking-card">
                    <div className="dash-booking-header">
                      <div>
                        <div className="dash-booking-prop">{b.properties?.name}</div>
                        <div className="dash-booking-loc">📍 {b.properties?.city}, {b.properties?.country}</div>
                      </div>
                      <div className="dash-booking-status" style={{
                        background: b.status==='confirmed'?'rgba(74,124,89,0.1)':b.status==='rejected'?'rgba(192,57,43,0.1)':'rgba(196,98,45,0.1)',
                        color: b.status==='confirmed'?'var(--success)':b.status==='rejected'?'#c0392b':'var(--terra)',
                        fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20
                      }}>{b.status}</div>
                    </div>
                    <div className="dash-booking-details">
                      <div className="dash-booking-detail"><span>Guest</span><strong>{b.guest_name}</strong></div>
                      <div className="dash-booking-detail"><span>Email</span><strong>{b.guest_email}</strong></div>
                      <div className="dash-booking-detail"><span>Phone</span><strong>{b.guest_phone}</strong></div>
                      <div className="dash-booking-detail"><span>Check-in</span><strong>{fmt(b.checkin)}</strong></div>
                      <div className="dash-booking-detail"><span>Check-out</span><strong>{fmt(b.checkout)}</strong></div>
                      <div className="dash-booking-detail"><span>Guests</span><strong>{b.guests}</strong></div>
                      <div className="dash-booking-detail"><span>Total</span><strong style={{color:'var(--terra)'}}>£{b.total_price}</strong></div>
                      <div className="dash-booking-detail"><span>Booked</span><strong>{fmt(b.created_at)}</strong></div>
                    </div>
                    {b.stripe_session_id && (
                      <div style={{fontSize:11,color:'var(--ink-soft)',marginTop:8}}>
                        Stripe: {b.stripe_session_id}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="dash-filters" style={{marginBottom:20}}>
              {['pending','approved','rejected'].map(s => (
                <button key={s} className={`dash-filter-btn ${s==='pending'?'active':''}`}
                  onClick={e => {
                    document.querySelectorAll('.dash-filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                  }}>
                  {s.charAt(0).toUpperCase()+s.slice(1)} ({reviews.filter(r=>r.status===s).length})
                </button>
              ))}
            </div>
            <div className="dash-bookings-list">
              {reviews.filter(r => r.status === 'pending').map(r => (
                <div key={r.id} className="dash-booking-card">
                  <div className="dash-booking-header">
                    <div>
                      <div className="dash-booking-prop">{r.properties?.name}</div>
                      <div className="dash-booking-loc">by {r.guest_name}</div>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{color: s<=r.rating?'var(--gold)':'var(--sand-deep)',fontSize:18}}>★</span>)}
                    </div>
                  </div>
                  <p style={{fontSize:14,color:'var(--ink-mid)',margin:'0 0 14px',fontWeight:300,lineHeight:1.6}}>{r.comment}</p>
                  <div className="dash-booking-actions">
                    <button className="dash-btn-confirm" onClick={async () => {
                      await supabase.from('reviews').update({status:'approved'}).eq('id',r.id);
                      setReviews(prev => prev.map(x => x.id===r.id ? {...x,status:'approved'} : x));
                    }}>✓ Approve</button>
                    <button className="dash-btn-reject" onClick={async () => {
                      await supabase.from('reviews').update({status:'rejected'}).eq('id',r.id);
                      setReviews(prev => prev.map(x => x.id===r.id ? {...x,status:'rejected'} : x));
                    }}>✕ Reject</button>
                  </div>
                </div>
              ))}
              {reviews.filter(r=>r.status==='pending').length === 0 && (
                <div className="dashboard-empty"><div className="dashboard-empty-icon">⭐</div><p>No pending reviews</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div>
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
            {filtered.map(p => {
              const host = hostProfiles[p.host_id];
              const hostName = host?.display_name || host?.full_name || '—';
              const fee = Math.round(p.price * 0.08);
              const hostEarns = p.price - fee;
              return (
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
                    <div className="admin-detail"><span>Nightly rate</span><strong>£{p.price}</strong></div>
                    <div className="admin-detail"><span>Bedrooms</span><strong>{p.bedrooms}</strong></div>
                    <div className="admin-detail"><span>Max guests</span><strong>{p.max_guests}</strong></div>
                  </div>

                  {p.address && (
                    <div className="admin-address">📍 {p.address}</div>
                  )}

                  <div className="admin-section-label">Host</div>
                  <div className="admin-host-block">
                    <div className="admin-host-row"><span>Name</span><strong>{hostName}</strong></div>
                    {host?.email && <div className="admin-host-row"><span>Email</span><strong>{host.email}</strong></div>}
                    {host?.phone && <div className="admin-host-row"><span>Phone</span><strong>{host.phone}</strong></div>}
                    {host?.created_at && <div className="admin-host-row"><span>Member since</span><strong>{new Date(host.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</strong></div>}
                  </div>

                  <div className="admin-section-label">Revenue breakdown</div>
                  <div className="admin-revenue-block">
                    <div className="admin-revenue-row"><span>Nightly rate</span><span>£{p.price}</span></div>
                    <div className="admin-revenue-row admin-revenue-row--fee"><span>SunnaStays fee (8%)</span><span>+£{fee}</span></div>
                    <div className="admin-revenue-row"><span>Host receives</span><span>£{hostEarns}</span></div>
                    <div className="admin-revenue-row admin-revenue-row--total"><span>SunnaStays earns / night</span><span>£{fee}</span></div>
                  </div>

                  {p.photos && p.photos.length > 0 ? (
                    <div className="admin-photos">
                      {p.photos.map((url, i) => (
                        <img key={i} src={url} alt={`Property ${i+1}`} className="admin-photo"
                          onClick={() => setLightboxPhoto(url)} />
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
                      <button className="admin-btn-approve" onClick={() => updateStatus(p.id, 'approved')}>✓ Approve</button>
                      <button className="admin-btn-reject" onClick={() => updateStatus(p.id, 'rejected')}>✕ Reject</button>
                    </div>
                  )}
                  {p.status === 'approved' && (
                    <div className="admin-card-actions">
                      <button className="admin-btn-reject" onClick={() => updateStatus(p.id, 'rejected')}>✕ Revoke approval</button>
                    </div>
                  )}
                  {p.status === 'rejected' && (
                    <div className="admin-card-actions">
                      <button className="admin-btn-approve" onClick={() => updateStatus(p.id, 'approved')}>✓ Approve instead</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

          {lightboxPhoto && (
            <div className="admin-lightbox" onClick={() => setLightboxPhoto(null)}>
              <img src={lightboxPhoto} alt="Full size" className="admin-lightbox-img" />
              <button className="admin-lightbox-close" onClick={() => setLightboxPhoto(null)}>✕</button>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
