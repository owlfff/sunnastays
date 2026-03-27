import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { getStay } from '../api';
import './Listing.css';

export default function Listing() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [stay, setStay]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStay(slug)
      .then(data => { setStay(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="listing-page">
      <div className="listing-loading">
        <div className="listing-hero-skeleton" />
        <div className="container listing-content-skeleton">
          <div className="skel-line skel-title" />
          <div className="skel-line skel-sub" />
          <div className="skel-line" />
        </div>
      </div>
    </div>
  );

  if (!stay) return (
    <div className="listing-page listing-not-found">
      <h2>Stay not found</h2>
      <button className="btn-primary" onClick={() => navigate('/search')}>Browse all stays</button>
    </div>
  );

  const nights = 5;
  const serviceFee = Math.round(stay.price * nights * 0.08);
  const total = stay.price * nights + serviceFee;

  return (
    <div className="listing-page">
      {/* PHOTO HERO */}
      <div className="listing-hero">
        {stay.photos && stay.photos.length > 0 ? (
          <>
            <div className="listing-img-main">
              <img src={stay.photos[0]} alt={stay.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'20px 0 0 20px' }} />
            </div>
            <div className="listing-img-grid">
              {[stay.photos[1] || stay.photos[0], stay.photos[2] || stay.photos[0]].map((url, i) => (
                <div key={i} className="listing-img-sub">
                  <img src={url} alt={stay.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius: i === 0 ? '0 20px 0 0' : '0 0 20px 0' }} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="listing-img-main" style={{ background: stay.gradient || 'linear-gradient(135deg,var(--terra-muted),var(--terra))' }}>
              <span className="listing-img-emoji">{stay.emoji || '🏠'}</span>
            </div>
            <div className="listing-img-grid">
              {['🌅', '🛏️'].map((img, i) => (
                <div key={i} className="listing-img-sub" style={{ background: i === 0 ? 'linear-gradient(135deg,var(--sand-deep),#c0a070)' : 'linear-gradient(135deg,#a8c4b8,#4a7c59)' }}>
                  <span>{img}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="container listing-content">
        <div className="listing-left">
          <h1 className="listing-title">{stay.name}</h1>
          <div className="listing-meta-row">
            <span>★ <strong>{stay.rating}</strong> · {stay.reviewCount} reviews</span>
            <span className="listing-dot">·</span>
            <span>📍 {stay.location}</span>
            <span className="halal-tick listing-halal">✓ Halal certified</span>
          </div>

          <hr className="listing-divider" />

          <div className="host-row">
            <div className="host-avatar">{stay.host?.emoji || '👤'}</div>
            <div>
              <div className="host-name">Hosted by {stay.host?.name}</div>
              <div className="host-meta">
                {stay.host?.isSuperhost && 'Superhost · '}
                Joined {stay.host?.since} · {stay.host?.languages?.join(', ')}
              </div>
            </div>
          </div>

          <hr className="listing-divider" />

          <p className="listing-desc">{stay.description}</p>

          <hr className="listing-divider" />

          <div className="halal-standards">
            <h4>🟢 SunnaStays Halal Standards</h4>
            <ul className="halal-list">
              {stay.halalStandards?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <hr className="listing-divider" />

          <div className="amenities-title">What this place offers</div>
          <div className="amenity-grid">
            {stay.amenities?.map(a => (
              <div key={a.label} className="amenity">
                <span className="amenity-icon">{a.icon}</span> {a.label}
              </div>
            ))}
          </div>
        </div>

        {/* BOOKING CARD */}
        <div className="listing-right">
          <div className="booking-card">
            <div className="booking-price">£{stay.price} <span>per night</span></div>
            <div className="booking-rating">
              <span style={{ color: 'var(--gold)' }}>★</span> {stay.rating} · <span>{stay.reviewCount} reviews</span>
            </div>

            <div className="halal-cert-badge">🟢 SunnaStays Halal Guarantee included</div>

            <div className="date-inputs">
              <div className="date-row">
                <div className="date-cell">
                  <div className="date-label">Check-in</div>
                  <div className="date-value">Add date</div>
                </div>
                <div className="date-cell">
                  <div className="date-label">Check-out</div>
                  <div className="date-value">Add date</div>
                </div>
              </div>
              <div className="guests-cell">
                <div className="date-label">Guests</div>
                <div className="date-value">Add guests</div>
              </div>
            </div>

            <div className="booking-total">
              <div className="booking-line">
                <span>£{stay.price} × {nights} nights</span>
                <span>£{stay.price * nights}</span>
              </div>
              <div className="booking-line">
                <span>SunnaStays service fee</span>
                <span>£{serviceFee}</span>
              </div>
              <div className="booking-line booking-line--total">
                <span>Total (GBP)</span>
                <span>£{total}</span>
              </div>
            </div>

            <button
              className="btn-primary booking-btn"
              onClick={async e => {
                e.preventDefault();
                e.stopPropagation();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  navigate('/signin?redirect=/stays/' + stay.slug);
                  return;
                }
                setShowBooking(true);
              }}
            >
              ⚡ Book instantly
            </button>
            <p className="booking-note">You won't be charged yet</p>
          </div>

          <button
            className="wishlist-btn"
            onClick={() => setWishlisted(w => !w)}
          >
            {wishlisted ? '❤️ Saved' : '🤍 Save to wishlist'}
          </button>
        </div>
      </div>

      <Footer />

      {showBooking && (
        <BookingModal
          stay={stay}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
