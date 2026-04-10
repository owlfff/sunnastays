import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { updateBookingStatus } from '../api';
import './HostDashboard.css';
import MessageThread from '../components/MessageThread';

const STATUS_COLOURS = {
  pending:   { bg: 'rgba(196,98,45,0.1)',  color: '#C4622D' },
  confirmed: { bg: 'rgba(74,124,89,0.1)',  color: '#4A7C59' },
  rejected:  { bg: 'rgba(192,57,43,0.1)', color: '#C0392B' },
};

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = d => { const dt = new Date(d); return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`; };

export default function HostDashboard() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [listings, setListings]       = useState([]);
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('bookings');
  const [bookingFilter, setBookingFilter] = useState('pending');
  const [openThread, setOpenThread] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/signin'); return; }
      setUser(user);
      loadData(user.id);
    });
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    const { data: props } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    const { data: books } = await supabase
      .from('bookings')
      .select('*, properties(name, city, country, photos)')
      .order('created_at', { ascending: false });
    setListings(props || []);
    setBookings(books || []);
    setLoading(false);
  };

  const handleBookingAction = async (bookingId, status) => {
    await updateBookingStatus(bookingId, status);
    if (user) loadData(user.id);
  };

  const filteredBookings = bookings.filter(b => b.status === bookingFilter);
  const counts = {
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    rejected:  bookings.filter(b => b.status === 'rejected').length,
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-logo" onClick={() => navigate('/')}>
            <div className="nav-logo-mark">س</div>
            <span className="dashboard-logo-text">SunnaStays</span>
          </div>
          <span className="dashboard-tag">Host Dashboard</span>
        </div>
        <div className="dashboard-header-right">
          <button className="dashboard-nav-btn" onClick={() => navigate('/host')}>+ New listing</button>
          <button className="dashboard-nav-btn" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>Sign out</button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">Host dashboard</h1>
          <p className="dashboard-sub">{user?.email}</p>
        </div>

        <div className="dashboard-stats">
          <div className="dash-stat">
            <div className="dash-stat-num">{listings.length}</div>
            <div className="dash-stat-label">Total listings</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num" style={{color:'var(--terra)'}}>{counts.pending}</div>
            <div className="dash-stat-label">Pending requests</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num" style={{color:'var(--success)'}}>{counts.confirmed}</div>
            <div className="dash-stat-label">Confirmed bookings</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num">
              £{bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}
            </div>
            <div className="dash-stat-label">Total revenue</div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button className={`dash-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            Booking requests {counts.pending > 0 && <span className="dash-badge">{counts.pending}</span>}
          </button>
          <button className={`dash-tab ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
            My listings
          </button>
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'bookings' && (
              <div>
                <div className="dash-filters">
                  {['pending','confirmed','rejected'].map(s => (
                    <button key={s} className={`dash-filter-btn ${bookingFilter === s ? 'active' : ''}`}
                      onClick={() => setBookingFilter(s)}>
                      {s.charAt(0).toUpperCase()+s.slice(1)} ({counts[s]})
                    </button>
                  ))}
                </div>
                {filteredBookings.length === 0 ? (
                  <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">📋</div>
                    <p>No {bookingFilter} bookings</p>
                  </div>
                ) : (
                  <div className="dash-bookings-list">
                    {filteredBookings.map(b => (
                      <div key={b.id} className="dash-booking-card">
                        <div className="dash-booking-header">
                          <div>
                            <div className="dash-booking-prop">{b.properties?.name}</div>
                            <div className="dash-booking-loc">📍 {b.properties?.city}, {b.properties?.country}</div>
                          </div>
                          <div className="dash-booking-status" style={STATUS_COLOURS[b.status]}>
                            {b.status}
                          </div>
                        </div>
                        <div className="dash-booking-details">
                          <div className="dash-booking-detail"><span>Guest</span><strong>{b.guest_name}</strong></div>
                          <div className="dash-booking-detail"><span>Email</span><strong>{b.guest_email}</strong></div>
                          <div className="dash-booking-detail"><span>Phone</span><strong>{b.guest_phone}</strong></div>
                          <div className="dash-booking-detail"><span>Check-in</span><strong>{fmt(b.checkin)}</strong></div>
                          <div className="dash-booking-detail"><span>Check-out</span><strong>{fmt(b.checkout)}</strong></div>
                          <div className="dash-booking-detail"><span>Guests</span><strong>{b.guests}</strong></div>
                          <div className="dash-booking-detail"><span>Total</span><strong style={{color:'var(--terra)'}}>£{b.total_price}</strong></div>
                          <div className="dash-booking-detail"><span>Requested</span><strong>{fmt(b.created_at)}</strong></div>
                        </div>
                        {b.message && (
                          <div className="dash-booking-message">
                            <span>Message from guest:</span>
                            <p>{b.message}</p>
                          </div>
                        )}
                        {b.status === 'pending' && (
                          <div className="dash-booking-actions">
                            <button className="dash-btn-confirm" onClick={() => handleBookingAction(b.id, 'confirmed')}>✓ Confirm booking</button>
                            <button className="dash-btn-reject" onClick={() => handleBookingAction(b.id, 'rejected')}>✕ Decline</button>
                          </div>
                        )}
                        <button
                          className="guest-message-btn"
                          style={{marginBottom:10}}
                          onClick={() => setOpenThread(openThread === b.id ? null : b.id)}
                        >
                          💬 {openThread === b.id ? 'Close messages' : 'Message guest'}
                        </button>
                        {openThread === b.id && user && (
                          <div style={{marginBottom:14}}>
                            <MessageThread
                              bookingId={b.id}
                              threadId={`booking-${b.id}`}
                              propertyId={b.properties?.id}
                              currentUserId={user.id}
                              currentUserName="Host"
                              senderType="host"
                              otherName={b.guest_name}
                            />
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <div className="dash-booking-actions">
                            <button className="dash-btn-reject" onClick={() => handleBookingAction(b.id, 'rejected')}>Cancel booking</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                {listings.length === 0 ? (
                  <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">🏠</div>
                    <p>No listings yet</p>
                    <button className="btn-primary" onClick={() => navigate('/host')}>List your first property</button>
                  </div>
                ) : (
                  <div className="dash-listings-grid">
                    {listings.map(l => (
                      <div key={l.id} className="dash-listing-card">
                        <div className="dash-listing-img">
                          {l.photos?.[0] ? <img src={l.photos[0]} alt={l.name} /> : <span>🏠</span>}
                        </div>
                        <div className="dash-listing-body">
                          <div className="dash-listing-name">{l.name}</div>
                          <div className="dash-listing-loc">📍 {l.city}, {l.country}</div>
                          <div className="dash-listing-meta">
                            <span>£{l.price}/night</span>
                            <span>{l.bedrooms} bed · {l.max_guests} guests</span>
                          </div>
                          <div className={`dash-listing-status dash-listing-status--${l.status}`}>
                            {l.status === 'approved' ? '✓ Live' : l.status === 'pending' ? '⏳ Pending review' : '✕ Rejected'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
