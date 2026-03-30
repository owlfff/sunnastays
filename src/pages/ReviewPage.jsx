import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './ReviewPage.css';

export default function ReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!token) { setError('Invalid review link.'); setLoading(false); return; }

    // Check if token already used
    supabase.from('reviews').select('id').eq('token', token).single()
      .then(({ data }) => {
        if (data) { setAlreadyReviewed(true); setLoading(false); return; }

        // Find booking by token (stored in bookings table)
        supabase.from('bookings')
          .select('*, properties(name, city, country, photos)')
          .eq('review_token', token)
          .single()
          .then(({ data: bookingData, error: bookingError }) => {
            if (bookingError || !bookingData) {
              setError('Review link not found or expired.');
              setLoading(false);
              return;
            }
            setBooking(bookingData);
            setProperty(bookingData.properties);
            setLoading(false);
          });
      });
  }, [token]);

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a comment.'); return; }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('reviews').insert([{
      booking_id:  booking.id,
      property_id: booking.property_id,
      guest_id:    booking.guest_id,
      guest_name:  booking.guest_name,
      rating,
      comment:     comment.trim(),
      status:      'pending',
      token,
    }]);

    if (insertError) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = d => { const dt = new Date(d); return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`; };

  if (loading) return (
    <div className="review-page">
      <div className="review-card">
        <div className="review-loading">Loading…</div>
      </div>
    </div>
  );

  if (alreadyReviewed) return (
    <div className="review-page">
      <div className="review-card">
        <div className="review-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="review-logo-text">Sunna<span>Stays</span></span>
        </div>
        <div className="review-success-icon">✓</div>
        <h2 className="review-title">Already reviewed</h2>
        <p className="review-sub">You've already submitted a review for this stay. Thank you!</p>
        <button className="btn-primary review-btn" onClick={() => navigate('/')}>Back to SunnaStays</button>
      </div>
    </div>
  );

  if (error && !booking) return (
    <div className="review-page">
      <div className="review-card">
        <div className="review-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="review-logo-text">Sunna<span>Stays</span></span>
        </div>
        <h2 className="review-title">Link not found</h2>
        <p className="review-sub">{error}</p>
        <button className="btn-primary review-btn" onClick={() => navigate('/')}>Back to SunnaStays</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="review-page">
      <div className="review-card">
        <div className="review-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="review-logo-text">Sunna<span>Stays</span></span>
        </div>
        <div className="review-arabic">شكراً</div>
        <div className="review-success-wrap">
          <div className="review-success-icon">✓</div>
        </div>
        <h2 className="review-title">Thank you for your review!</h2>
        <p className="review-sub">Your review has been submitted and will appear on the listing once approved. We appreciate your feedback.</p>
        <button className="btn-primary review-btn" onClick={() => navigate('/')}>Back to SunnaStays</button>
      </div>
    </div>
  );

  return (
    <div className="review-page">
      <div className="review-card">
        <div className="review-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-mark">س</div>
          <span className="review-logo-text">Sunna<span>Stays</span></span>
        </div>

        <div className="review-property">
          {property?.photos?.[0] && (
            <div className="review-property-img">
              <img src={property.photos[0]} alt={property.name} />
            </div>
          )}
          <div className="review-property-info">
            <div className="review-property-name">{property?.name}</div>
            <div className="review-property-loc">📍 {property?.city}, {property?.country}</div>
            {booking && (
              <div className="review-property-dates">{fmt(booking.checkin)} – {fmt(booking.checkout)}</div>
            )}
          </div>
        </div>

        <h2 className="review-title">How was your stay?</h2>
        <p className="review-sub">Your honest feedback helps other Muslim travellers find the perfect halal stay.</p>

        <div className="review-stars">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              className={`review-star ${star <= (hovered || rating) ? 'active' : ''}`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span className="review-rating-label">
              {['','Poor','Fair','Good','Great','Excellent'][rating]}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Your review <span style={{color:'var(--terra)'}}>*</span></label>
          <textarea
            className="form-input form-textarea"
            placeholder="Tell us about your experience — the property, the host, the halal standards…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={5}
          />
          <div className="review-char-count">{comment.length}/500</div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-primary review-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}
