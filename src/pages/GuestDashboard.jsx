import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './GuestDashboard.css';
import MessageThread from '../components/MessageThread';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = d => { const dt = new Date(d); return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`; };

const STATUS_STYLES = {
  pending:   { bg: 'rgba(196,98,45,0.1)',  color: '#C4622D', label: '⏳ Pending' },
  confirmed: { bg: 'rgba(74,124,89,0.1)',  color: '#4A7C59', label: '✓ Confirmed' },
  rejected:  { bg: 'rgba(192,57,43,0.1)', color: '#C0392B', label: '✕ Declined' },
};

export default function GuestDashboard() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [openThread, setOpenThread] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/signin'); return; }
      setUser(user);
      loadBookings(user.id);
    });
  }, [navigate]);

  const loadBookings = async (userId) => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, properties(name, city, country, photos, address, lat, lng)')
      .eq('guest_id', userId)
      .order('created_at', { ascending: false });
    const bookingData = data || [];
    setBookings(bookingData);
    setLoading(false);

    // Fetch unread counts for each booking
    if (bookingData.length > 0) {
      const threadIds = bookingData.map(b => `booking-${b.id}`);
      supabase.from('messages')
        .select('thread_id')
        .in('thread_id', threadIds)
        .eq('read_by_guest', false)
        .neq('sender_type', 'guest')
        .then(({ data: unread }) => {
          const counts = {};
          (unread || []).forEach(m => {
            counts[m.thread_id] = (counts[m.thread_id] || 0) + 1;
          });
          setUnreadCounts(counts);
        });
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.checkin) >= new Date());
  const past     = bookings.filter(b => b.status === 'confirmed' && new Date(b.checkin) < new Date());

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-logo" onClick={() => navigate('/')}>
            <div className="nav-logo-mark">س</div>
            <span className="dashboard-logo-text">SunnaStays</span>
          </div>
          <span className="dashboard-tag">My Trips</span>
        </div>
        <div className="dashboard-header-right">
          <button className="dashboard-nav-btn" onClick={() => navigate('/search')}>Find a stay</button>
          <button className="dashboard-nav-btn" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>Sign out</button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-welcome">
          <p className="guest-arabic">رحلات مباركة</p>
          <h1 className="dashboard-title">My trips</h1>
          <p className="dashboard-sub">{user?.email}</p>
        </div>

        {/* STATS */}
        <div className="dashboard-stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
          <div className="dash-stat">
            <div className="dash-stat-num">{bookings.length}</div>
            <div className="dash-stat-label">Total bookings</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num" style={{color:'var(--success)'}}>{upcoming.length}</div>
            <div className="dash-stat-label">Upcoming trips</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num">{past.length}</div>
            <div className="dash-stat-label">Past trips</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="dash-filters">
          {['all','pending','confirmed','rejected'].map(s => (
            <button key={s} className={`dash-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}>
              {s === 'all' ? 'All trips' : s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading your trips…</div>
        ) : filtered.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">✈️</div>
            <p>{filter === 'all' ? "You haven't made any bookings yet" : `No ${filter} bookings`}</p>
            {filter === 'all' && <button className="btn-primary" onClick={() => navigate('/search')}>Find a halal stay</button>}
          </div>
        ) : (
          <div className="guest-bookings-list">
            {filtered.map(b => {
              const ss = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
              const isUpcoming = b.status === 'confirmed' && new Date(b.checkin) >= new Date();
              const nights = Math.round((new Date(b.checkout) - new Date(b.checkin)) / (1000*60*60*24));
              return (
                <div key={b.id} className={`guest-booking-card ${isUpcoming ? 'guest-booking-card--upcoming' : ''}`}>
                  <div className="guest-booking-img">
                    {b.properties?.photos?.[0]
                      ? <img src={b.properties.photos[0]} alt={b.properties?.name} />
                      : <span>🏠</span>
                    }
                    {isUpcoming && <div className="guest-upcoming-badge">Upcoming trip</div>}
                  </div>
                  <div className="guest-booking-body">
                    <div className="guest-booking-header">
                      <div>
                        <div className="guest-booking-prop">{b.properties?.name}</div>
                        <div className="guest-booking-loc">📍 {b.properties?.city}, {b.properties?.country}</div>
                      </div>
                      <div className="guest-booking-status" style={{background: ss.bg, color: ss.color}}>
                        {ss.label}
                      </div>
                    </div>

                    <div className="guest-booking-dates">
                      <div className="guest-date-block">
                        <span>Check-in</span>
                        <strong>{fmt(b.checkin)}</strong>
                      </div>
                      <div className="guest-date-arrow">→</div>
                      <div className="guest-date-block">
                        <span>Check-out</span>
                        <strong>{fmt(b.checkout)}</strong>
                      </div>
                      <div className="guest-date-block">
                        <span>Nights</span>
                        <strong>{nights}</strong>
                      </div>
                      <div className="guest-date-block">
                        <span>Guests</span>
                        <strong>{b.guests}</strong>
                      </div>
                      <div className="guest-date-block">
                        <span>Total paid</span>
                        <strong style={{color:'var(--terra)'}}>£{b.total_price}</strong>
                      </div>
                    </div>

                    {b.status === 'confirmed' && b.properties?.address && (
                      <div className="guest-address-reveal">
                        <div className="guest-address-label">🏠 Property address</div>
                        <div className="guest-address-value">{b.properties.address}</div>
                      </div>
                    )}

                    {b.status === 'pending' && (
                      <div className="guest-pending-note">
                        Your request is waiting for the host to respond. You'll receive an email when they do.
                      </div>
                    )}

                    <div className="guest-halal-badge">🟢 SunnaStays Halal Guarantee applies</div>
                    <button
                      className="guest-message-btn"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setOpenThread(openThread === b.id ? null : b.id); }}
                    >
                      💬 {openThread === b.id ? 'Close messages' : 'Message host'}
                      {unreadCounts[`booking-${b.id}`] > 0 && openThread !== b.id && (
                        <span className="msg-badge">{unreadCounts[`booking-${b.id}`]}</span>
                      )}
                    </button>
                    {openThread === b.id && user && (
                      <div style={{marginTop:14}}>
                        <MessageThread
                          bookingId={b.id}
                          threadId={`booking-${b.id}`}
                          propertyId={b.property_id}
                          currentUserId={user.id}
                          currentUserName={b.guest_name || user.email}
                          senderType="guest"
                          otherName="Host"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
