import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { getStay, getReviewsForProperty } from '../api';
import MessageThread from '../components/MessageThread';
import './Listing.css';
import SearchMap from '../components/SearchMap';

export default function Listing() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [stay, setStay]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (searchParams.get('booking') === 'true') {
      setShowBooking(true);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getStay(slug)
      .then(data => {
        setStay(data);
        setLoading(false);
        if (data?.id) getReviewsForProperty(data.id).then(r => { console.log('reviews:', r); setReviews(r); }).catch(e => console.error('reviews error:', e));
      })
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
            <span>★ <strong>{reviews.length > 0 ? (reviews.reduce((sum,r) => sum+r.rating,0)/reviews.length).toFixed(1) : stay.rating}</strong> · {reviews.length > 0 ? reviews.length : stay.reviewCount} review{(reviews.length > 0 ? reviews.length : stay.reviewCount) !== 1 ? "s" : ""}</span>
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

          <div className="cancellation-section">
            <h4 className="cancellation-title">Cancellation policy</h4>
            {stay.cancellationPolicy === 'flexible' && (
              <div className="cancellation-policy cancellation-policy--flexible">
                <div className="cp-icon">🟢</div>
                <div>
                  <div className="cp-name">Flexible</div>
                  <div className="cp-desc">Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable.</div>
                </div>
              </div>
            )}
            {stay.cancellationPolicy === 'moderate' && (
              <div className="cancellation-policy cancellation-policy--moderate">
                <div className="cp-icon">🟡</div>
                <div>
                  <div className="cp-name">Moderate</div>
                  <div className="cp-desc">Free cancellation up to 5 days before check-in. After that, the first night and service fee are non-refundable.</div>
                </div>
              </div>
            )}
            {stay.cancellationPolicy === 'strict' && (
              <div className="cancellation-policy cancellation-policy--strict">
                <div className="cp-icon">🔴</div>
                <div>
                  <div className="cp-name">Strict</div>
                  <div className="cp-desc">50% refund up to 7 days before check-in. No refund after that.</div>
                </div>
              </div>
            )}
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
              <span style={{ color: 'var(--gold)' }}>★</span> {reviews.length > 0 ? (reviews.reduce((sum,r) => sum+r.rating,0)/reviews.length).toFixed(1) : stay.rating} · <span>{reviews.length > 0 ? reviews.length : stay.reviewCount} review{(reviews.length > 0 ? reviews.length : stay.reviewCount) !== 1 ? 's' : ''}</span>
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
                  navigate('/signin?redirect=' + encodeURIComponent('/stays/' + stay.slug + '?booking=true'));
                  return;
                }
                setShowBooking(true);
              }}
            >
              ⚡ Book instantly
            </button>
            <p className="booking-note">You won't be charged yet</p>
            <button
              className="btn-secondary message-host-btn"
              onClick={async e => {
                e.preventDefault();
                e.stopPropagation();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { navigate('/signin?redirect=' + encodeURIComponent('/stays/' + stay.slug + '?message=true')); return; }
                setShowMessages(m => !m);
              }}
            >
              💬 Message host
            </button>
          </div>

          {showMessages && currentUser && (
            <div className="listing-messages">
              <MessageThread
                bookingId={null}
                threadId={`property-${stay.id}-user-${currentUser.id}`}
                propertyId={stay.id}
                currentUserId={currentUser.id}
                currentUserName={currentUser.email}
                senderType="guest"
                otherName={stay.host?.name || 'Host'}
              />
            </div>
          )}

          <button
            className="wishlist-btn"
            onClick={() => setWishlisted(w => !w)}
          >
            {wishlisted ? '❤️ Saved' : '🤍 Save to wishlist'}
          </button>
        </div>
      </div>

      {stay.lat && stay.lng && (
        <div className="listing-map-section">
          <div className="container">
            <hr className="listing-divider" />
            <h3 className="listing-section-title">Where you'll be</h3>
            <div className="listing-address-line">📍 {stay.address || stay.location}</div>
          </div>
          <div className="listing-map-wrap">
            <SearchMap stays={[stay]} onHover={() => {}} hoveredId={null} />
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="container listing-reviews">
          <hr className="listing-divider" />
          <h3 className="reviews-title">
            ★ {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} review{reviews.length > 1 ? 's' : ''}
          </h3>
          <div className="reviews-grid">
            {reviews.map(r => (
              <div key={r.id} className="review-card-item">
                <div className="review-card-header">
                  <div className="review-avatar">{r.guest_name?.[0] || '?'}</div>
                  <div>
                    <div className="review-guest-name">{r.guest_name}</div>
                    <div className="review-stars-small">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{color: s <= r.rating ? 'var(--gold)' : 'var(--sand-deep)'}}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
