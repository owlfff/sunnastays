import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

import './BookingModal.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function isDateUnavailable(dt, unavailableRanges) {
  return unavailableRanges.some(({ checkin, checkout }) => {
    return dt >= checkin && dt < checkout;
  });
}

function CalendarMonth({ year, month, checkin, checkout, onSelectDay, unavailableRanges }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="bm-cal-month">
      <div className="bm-cal-title">{MONTHS[month]} {year}</div>
      <div className="bm-cal-grid">
        {DAYS.map(d => <div key={d} className="bm-cal-dow">{d}</div>)}
        {cells.map((dt, i) => {
          if (!dt) return <div key={'e'+i} />;
          const isPast = dt < today;
          const isUnavail = isDateUnavailable(dt, unavailableRanges);
          const isCI = checkin && dt.toDateString() === checkin.toDateString();
          const isCO = checkout && dt.toDateString() === checkout.toDateString();
          const inRange = checkin && checkout && dt > checkin && dt < checkout;
          let cls = 'bm-cal-day';
          if (isPast || isUnavail) cls += ' disabled';
          if (isUnavail && !isPast) cls += ' unavailable';
          if (isCI || isCO) cls += ' selected';
          if (inRange) cls += ' in-range';
          return (
            <div key={i} className={cls}
              onClick={() => !isPast && !isUnavail && onSelectDay(dt)}
              title={isUnavail ? 'Already booked' : ''}>
              {dt.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  return msg ? <div className="bm-field-error">{msg}</div> : null;
}

export default function BookingModal({ stay, onClose }) {
  const [step, setStep] = useState(1);
  const [checkin, setCheckin] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const maxGuests = stay.maxGuests || stay.max_guests || 2;
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [confirmed] = useState(false);
  const [error, setError] = useState(null);
  
  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [attempted, setAttempted] = useState(false);

  // Fetch booked dates
  useEffect(() => {
    supabase
      .from('bookings')
      .select('checkin, checkout, status')
      .eq('property_id', stay.id)
      .not('status', 'eq', 'rejected')
      .then(({ data }) => {
        if (!data) return;
        const ranges = data.map(b => ({
          checkin:  new Date(b.checkin),
          checkout: new Date(b.checkout),
        }));
        setUnavailableRanges(ranges);
      });
  }, [stay.id]);

  const now = new Date();


  const handleDayClick = (dt) => {
    if (!checkin || (checkin && checkout) || dt <= checkin) {
      setCheckin(dt); setCheckout(null);
    } else {
      // Check if any unavailable date falls in the range
      const rangeHasUnavail = unavailableRanges.some(({ checkin: uc, checkout: uo }) => {
        return uc < dt && uo > checkin;
      });
      if (rangeHasUnavail) {
        setError('Your selected range includes unavailable dates. Please choose different dates.');
        return;
      }
      setError(null);
      setCheckout(dt);
    }
  };

  const fmt = d => d ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` : '—';
  const nights = checkin && checkout ? Math.round((checkout - checkin) / (1000*60*60*24)) : 0;
  const subtotal = nights * stay.price;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const validateStep2 = () => {
    const errors = {};
    if (!form.name.trim())  errors.name  = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Please enter a valid email';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep2Continue = () => {
    setAttempted(true);
    if (validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const checkinStr  = checkin.toISOString().split('T')[0];
      const checkoutStr = checkout.toISOString().split('T')[0];

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            propertyId:     stay.id,
            guestName:      form.name,
            guestEmail:     form.email,
            guestPhone:     form.phone,
            checkin:        checkinStr,
            checkout:       checkoutStr,
            nights,
            guests,
            totalPrice:     total,
            instantBooking: stay.instantBooking,
            message,
          },
          property: {
            name:  stay.name,
            photo: stay.photos?.[0] || null,
          },
          successUrl: `${window.location.origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl:  window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not create checkout session. Please try again.');
      }
    } catch(e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const updateField = (field, value) => {
    setForm(f => ({...f, [field]: value}));
    if (attempted) {
      setFieldErrors(prev => {
        const next = {...prev};
        if (value.trim()) delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="bm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bm-modal">
        <div className="bm-header">
          <div className="bm-title">
            {confirmed ? ('Booking confirmed') :
             step === 1 ? 'Choose your dates' :
             step === 2 ? 'Your details' : 'Review & confirm'}
          </div>
          <button className="bm-close" onClick={onClose}>✕</button>
        </div>

        {confirmed ? (
          <div className="bm-success">
            <div className="bm-success-arabic">{'مبروك'}</div>
            <div className="bm-success-icon-wrap">
              <div className="bm-success-icon">{stay.instantBooking ? '✓' : '📋'}</div>
            </div>
            <h3 className="bm-success-title">
              {stay.instantBooking ? undefined : 'Request sent!'}
            </h3>
            <p className="bm-success-sub">
              {stay.instantBooking
                ? 'Your halal-certified stay is confirmed. We look forward to welcoming you.'
                : 'Your request has been sent to the host. They will respond within 24 hours.'}
            </p>
            <div className="bm-success-card">
              <div className="bm-success-property">
                <div className="bm-success-property-name">{stay.name}</div>
                <div className="bm-success-property-loc">📍 {stay.location}</div>
              </div>
              <div className="bm-success-details">
                <div className="bm-success-row">
                  <div className="bm-success-col"><span>Check-in</span><strong>{fmt(checkin)}</strong></div>
                  <div className="bm-success-divider">→</div>
                  <div className="bm-success-col"><span>Check-out</span><strong>{fmt(checkout)}</strong></div>
                </div>
                <div className="bm-success-meta">
                  <div className="bm-success-meta-item"><span>Nights</span><strong>{nights}</strong></div>
                  <div className="bm-success-meta-item"><span>Guests</span><strong>{guests}</strong></div>
                  <div className="bm-success-meta-item"><span>Total</span><strong>£{total}</strong></div>
                </div>
              </div>
              <div className="bm-success-halal">🟢 SunnaStays Halal Guarantee applies to this booking</div>
            </div>
            <button className="btn-primary bm-done-btn" onClick={onClose}>
              {'View booking details'}
            </button>
          </div>
        ) : (
          <>
            <div className="bm-steps">
              {['Dates','Details','Confirm'].map((s,i) => (
                <div key={s} className={'bm-step'+(step===i+1?' active':'')+(step>i+1?' done':'')}>
                  <div className="bm-step-dot">{step>i+1 ? '✓' : i+1}</div>
                  <div className="bm-step-label">{s}</div>
                </div>
              ))}
            </div>

            <div className="bm-body">
              {step === 1 && (
                <div className="bm-step-content">
                  <div className="bm-calendars-scroll">
                    {Array.from({length: 12}, (_, i) => {
                      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
                      return { year: d.getFullYear(), month: d.getMonth() };
                    }).map(({year, month}) => (
                      <CalendarMonth key={year+'-'+month} year={year} month={month}
                        checkin={checkin} checkout={checkout}
                        onSelectDay={handleDayClick}
                        unavailableRanges={unavailableRanges} />
                    ))}
                  </div>

                  <div className="bm-legend">
                    <div className="bm-legend-item"><div className="bm-legend-dot bm-legend-unavail" />Unavailable</div>
                    <div className="bm-legend-item"><div className="bm-legend-dot bm-legend-selected" />Selected</div>
                  </div>

                  <div className="bm-date-summary">
                    <div className="bm-date-pill"><span>Check-in</span><strong>{fmt(checkin)}</strong></div>
                    <div className="bm-date-arrow">→</div>
                    <div className="bm-date-pill"><span>Check-out</span><strong>{fmt(checkout)}</strong></div>
                  </div>

                  <div className="bm-guests-row">
                    <div>
                      <div className="bm-guests-label">Guests <span className="bm-required">*</span></div>
                      <div className="bm-guests-sub">Max {maxGuests}</div>
                    </div>
                    <div className="bm-counter">
                      <button className="counter-btn" disabled={guests<=1} onClick={() => setGuests(g=>g-1)}>−</button>
                      <span className="counter-val">{guests}</span>
                      <button className="counter-btn" disabled={guests>=maxGuests} onClick={() => setGuests(g=>g+1)}>+</button>
                    </div>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  {nights > 0 && (
                    <div className="bm-price-preview">
                      <div className="bm-price-row"><span>£{stay.price} × {nights} night{nights>1?'s':''}</span><span>£{subtotal}</span></div>
                      <div className="bm-price-row"><span>Service fee (12%)</span><span>£{serviceFee}</span></div>
                      <div className="bm-price-row bm-price-total"><span>Total</span><span>£{total}</span></div>
                    </div>
                  )}

                  {(!checkin || !checkout) && (
                    <div className="bm-dates-hint">Please select check-in and check-out dates to continue</div>
                  )}

                  <button className="btn-primary bm-next-btn"
                    disabled={!checkin || !checkout}
                    onClick={() => setStep(2)}>
                    Continue →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="bm-step-content">
                  <div className="bm-booking-summary">
                    <div className="bm-summary-prop">{stay.name}</div>
                    <div className="bm-summary-dates">{fmt(checkin)} – {fmt(checkout)} · {nights} night{nights>1?'s':''} · {guests} guest{guests>1?'s':''}</div>
                    <div className="bm-summary-price">Total: £{total}</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full name <span className="bm-required">*</span></label>
                    <input
                      className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
                      type="text" placeholder="As on your ID"
                      value={form.name} onChange={e => updateField('name', e.target.value)} />
                    <FieldError msg={fieldErrors.name} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email address <span className="bm-required">*</span></label>
                    <input
                      className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                      type="email" placeholder="you@example.com"
                      value={form.email} onChange={e => updateField('email', e.target.value)} />
                    <FieldError msg={fieldErrors.email} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone number <span className="bm-required">*</span></label>
                    <input
                      className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`}
                      type="tel" placeholder="+44 7700 000000"
                      value={form.phone} onChange={e => updateField('phone', e.target.value)} />
                    <FieldError msg={fieldErrors.phone} />
                  </div>

                  {false && (
                    <div className="form-group">
                      <label className="form-label">Message to host <span className="bm-optional">(optional)</span></label>
                      <textarea className="form-input form-textarea"
                        placeholder="Tell the host about yourself and your trip..."
                        value={message} onChange={e => setMessage(e.target.value)} />
                    </div>
                  )}

                  <div className="bm-nav">
                    <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn-primary" onClick={handleStep2Continue}>Continue →</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bm-step-content">
                  <div className={stay.instantBooking ? 'bm-instant-badge' : 'bm-request-badge'}>
                    {'⚡ Instant booking — confirmed immediately'}
                  </div>
                  <div className="bm-confirm-summary">
                    <div className="bm-confirm-row"><span>Property</span><strong>{stay.name}</strong></div>
                    <div className="bm-confirm-row"><span>Check-in</span><strong>{fmt(checkin)}</strong></div>
                    <div className="bm-confirm-row"><span>Check-out</span><strong>{fmt(checkout)}</strong></div>
                    <div className="bm-confirm-row"><span>Nights</span><strong>{nights}</strong></div>
                    <div className="bm-confirm-row"><span>Guests</span><strong>{guests}</strong></div>
                    <div className="bm-confirm-row"><span>Name</span><strong>{form.name}</strong></div>
                    <div className="bm-confirm-row"><span>Email</span><strong>{form.email}</strong></div>
                    <div className="bm-confirm-row bm-confirm-total"><span>Total</span><strong>£{total}</strong></div>
                  </div>
                  <div className="bm-cancellation-notice">
                    {stay.cancellationPolicy === 'flexible' && <span>🟢 <strong>Flexible:</strong> Free cancellation up to 24hrs before check-in.</span>}
                    {stay.cancellationPolicy === 'moderate' && <span>🟡 <strong>Moderate:</strong> Free cancellation up to 5 days before check-in.</span>}
                    {stay.cancellationPolicy === 'strict' && <span>🔴 <strong>Strict:</strong> 50% refund up to 7 days before check-in.</span>}
                    {!stay.cancellationPolicy && <span>🟡 <strong>Moderate:</strong> Free cancellation up to 5 days before check-in.</span>}
                  </div>
                  <div className="bm-terms">By confirming you agree to SunnaStays guest policies. Payment will be collected after confirmation.</div>
                  {error && <div className="auth-error">{error}</div>}
                  <div className="bm-nav">
                    <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                    <button className="btn-primary bm-confirm-btn" onClick={handleSubmit} disabled={loading}>
                      {loading ? 'Confirming…' : '⚡ Confirm booking'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
