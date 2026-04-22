import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { getStay, getReviewsForProperty } from '../api';
import './Listing.css';
import SearchMap from '../components/SearchMap';

export default function Listing() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [stay, setStay]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [mosque, setMosque] = useState(null);
  const [searchParams] = useSearchParams();

  const fetchNearestMosque = useCallback(async function fetchNearestMosque(lat, lng) {
    try {
      const query = `[out:json][timeout:10];
        node[amenity=place_of_worship][religion=muslim](around:10000,${lat},${lng});
        out 5;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST', body: query,
      });
      const data = await res.json();
      if (!data.elements?.length) return;
      // Pick the closest one using Haversine
      const closest = data.elements
        .map(el => ({ ...el, dist: haversine(lat, lng, el.lat, el.lon) }))
        .sort((a, b) => a.dist - b.dist)[0];
      const name = closest.tags?.name || closest.tags?.['name:en'] || 'Local mosque';
      setMosque({ name, miles: closest.dist.toFixed(1) });
    } catch (_) {}
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
        if (data?.id) getReviewsForProperty(data.id).then(r => { setReviews(r); }).catch(() => {});
        if (data?.lat && data?.lng) {
          fetchNearestMosque(data.lat, data.lng);
        } else if (data?.location) {
          // Geocode city/country via Nominatim as fallback
          fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.location)}&format=json&limit=1`)
            .then(r => r.json())
            .then(results => {
              if (results?.[0]) fetchNearestMosque(parseFloat(results[0].lat), parseFloat(results[0].lon));
            })
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [slug, fetchNearestMosque]);

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

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

  const nights = selectedCheckin && selectedCheckout
    ? Math.round((selectedCheckout - selectedCheckin) / (1000 * 60 * 60 * 24))
    : 0;
  const serviceFee = nights > 0 ? Math.round(stay.price * nights * 0.10) : 0;
  const total = nights > 0 ? stay.price * nights + serviceFee : 0;

  return (
    <div className="listing-page">
      {/* PHOTO HERO */}
      <div className="listing-hero">
        {stay.photos && stay.photos.length > 0 ? (
          <>
            <div className="listing-img-main" onClick={() => setLightbox({ photos: stay.photos, index: 0 })}>
              <img src={stay.photos[0]} alt={stay.name} />
            </div>
            <div className="listing-img-grid">
              {[stay.photos[1] || stay.photos[0], stay.photos[2] || stay.photos[0]].map((url, i) => (
                <div key={i} className="listing-img-sub" onClick={() => setLightbox({ photos: stay.photos, index: i + 1 < stay.photos.length ? i + 1 : 0 })}>
                  <img src={url} alt={stay.name} />
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
            {reviews.length > 0 ? (
              <>
                <span>★ <strong>{(reviews.reduce((sum,r) => sum+r.rating,0)/reviews.length).toFixed(1)}</strong> · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                <span className="listing-dot">·</span>
              </>
            ) : (
              <>
                <span className="listing-no-reviews">No reviews yet</span>
                <span className="listing-dot">·</span>
              </>
            )}
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
            <p className="cp-desc">
              {stay.cancellationPolicy === 'flexible' && 'Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable.'}
              {stay.cancellationPolicy === 'moderate' && 'Free cancellation up to 5 days before check-in. After that, the first night and service fee are non-refundable.'}
              {stay.cancellationPolicy === 'strict' && '50% refund up to 7 days before check-in. No refund after that.'}
            </p>
          </div>

          <hr className="listing-divider" />

          {(() => {
            const RULE_LABELS = {
              noSmoking:   { icon: '🚭', label: 'No smoking' },
              noParties:   { icon: '🎉', label: 'No parties or events' },
              noPets:      { icon: '🐾', label: 'No pets' },
              quietHours:  { icon: '🌙', label: 'Quiet hours after 10 pm' },
              noUnmahrems: { icon: '🤝', label: 'No unrelated mixed-gender gatherings' },
              shoesOff:    { icon: '👟', label: 'Shoes off indoors' },
            };
            const active = Object.entries(stay.houseRules || {})
              .filter(([k, v]) => k !== 'custom' && v === true);
            const custom = stay.houseRules?.custom;
            if (!active.length && !custom) return null;
            return (
              <>
                <div className="house-rules-section">
                  <h4 className="house-rules-title">🏠 House rules</h4>
                  <div className="house-rules-list">
                    {active.map(([key]) => (
                      <div key={key} className="house-rule-item">
                        <span className="house-rule-icon">{RULE_LABELS[key]?.icon}</span>
                        <span>{RULE_LABELS[key]?.label || key}</span>
                      </div>
                    ))}
                    {custom && (
                      <div className="house-rule-item house-rule-custom">
                        <span className="house-rule-icon">📋</span>
                        <span>{custom}</span>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="listing-divider" />
              </>
            );
          })()}

          {stay.amenities?.length > 0 && (
            <>
              <div className="amenities-title">What this place offers</div>
              <div className="amenity-grid">
                {stay.amenities.map(a => (
                  <div key={a.label} className="amenity">
                    <span className="amenity-icon">{a.icon}</span> {a.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* BOOKING CARD */}
        <div className="listing-right">
          <div className="booking-card">
            <div className="booking-price">£{stay.price} <span>per night</span></div>
            {reviews.length > 0 && (
              <div className="booking-rating">
                <span style={{ color: 'var(--gold)' }}>★</span> {(reviews.reduce((sum,r) => sum+r.rating,0)/reviews.length).toFixed(1)} · <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="halal-cert-badge">🟢 SunnaStays Halal Guarantee included</div>

            <div className="date-inputs" onClick={async e => {
                e.preventDefault();
                e.stopPropagation();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { navigate('/signin?redirect=' + encodeURIComponent('/stays/' + stay.slug + '?booking=true')); return; }
                if (!user.email_confirmed_at) {
                  alert('Please verify your email address before booking. Check your inbox for a verification link.');
                  return;
                }
                setShowBooking(true);
              }} style={{cursor:'pointer'}}>
              <div className="date-row">
                <div className="date-cell">
                  <div className="date-label">Check-in</div>
                  <div className={`date-value ${selectedCheckin ? '' : 'date-value--empty'}`}>
                    {selectedCheckin ? selectedCheckin.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : 'Add date'}
                  </div>
                </div>
                <div className="date-cell">
                  <div className="date-label">Check-out</div>
                  <div className={`date-value ${selectedCheckout ? '' : 'date-value--empty'}`}>
                    {selectedCheckout ? selectedCheckout.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : 'Add date'}
                  </div>
                </div>
              </div>
              <div className="guests-cell">
                <div className="date-label">Guests</div>
                <div className={`date-value ${selectedGuests >= 1 ? '' : 'date-value--empty'}`}>
                  {selectedGuests >= 1 ? `${selectedGuests} guest${selectedGuests !== 1 ? 's' : ''}` : 'Add guests'}
                </div>
              </div>
            </div>

            {nights > 0 && (
            <div className="booking-total">
              <div className="booking-line">
                <span>£{stay.price} × {nights} night{nights !== 1 ? 's' : ''}</span>
                <span>£{stay.price * nights}</span>
              </div>
              <div className="booking-line">
                <span>SunnaStays service fee (10%)</span>
                <span>£{serviceFee}</span>
              </div>
              <div className="booking-line booking-line--total">
                <span>Total (GBP)</span>
                <span>£{total}</span>
              </div>
            </div>
            )}

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
                if (!user.email_confirmed_at) {
                  alert('Please verify your email address before booking. Check your inbox for a verification link.');
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

      {((stay.lat && stay.lng) || mosque) && (
        <div className="listing-map-section">
          <div className="container">
            <hr className="listing-divider" />
            <h3 className="listing-section-title">Where you'll be</h3>
            <div className="listing-address-line">📍 {stay.location}</div>
            {mosque && (
              <div className="listing-mosque-line">🕌 Nearest mosque: <strong>{mosque.name}</strong> — {mosque.miles} miles away</div>
            )}
          </div>
          {stay.lat && stay.lng && (
            <div className="listing-map-wrap">
              <SearchMap stays={[stay]} onHover={() => {}} hoveredId={null} />
            </div>
          )}
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

      {lightbox && (
        <div className="listing-lightbox" onClick={() => setLightbox(null)}>
          <button className="listing-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          {lightbox.index > 0 && (
            <button className="listing-lightbox-prev" onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index - 1 })); }}>‹</button>
          )}
          <img src={lightbox.photos[lightbox.index]} alt="" className="listing-lightbox-img" onClick={e => e.stopPropagation()} />
          {lightbox.index < lightbox.photos.length - 1 && (
            <button className="listing-lightbox-next" onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index + 1 })); }}>›</button>
          )}
          <div className="listing-lightbox-counter">{lightbox.index + 1} / {lightbox.photos.length}</div>
        </div>
      )}

      {showBooking && (
        <BookingModal
          stay={stay}
          initialCheckin={selectedCheckin}
          initialCheckout={selectedCheckout}
          initialGuests={selectedGuests}
          onClose={(checkin, checkout, guests) => {
            if (checkin) setSelectedCheckin(checkin);
            if (checkout) setSelectedCheckout(checkout);
            if (guests) setSelectedGuests(guests);
            setShowBooking(false);
          }}
        />
      )}
    </div>
  );
}
