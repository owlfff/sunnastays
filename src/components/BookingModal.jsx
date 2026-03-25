import React, { useState } from 'react';
import { supabase } from '../supabase';
import { createBooking, checkExistingBooking } from '../api';
import './BookingModal.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function CalendarMonth({ year, month, checkin, checkout, onSelectDay }) {
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
          const isCI = checkin && dt.toDateString() === checkin.toDateString();
          const isCO = checkout && dt.toDateString() === checkout.toDateString();
          const inRange = checkin && checkout && dt > checkin && dt < checkout;
          let cls = 'bm-cal-day';
          if (isPast) cls += ' disabled';
          if (isCI || isCO) cls += ' selected';
          if (inRange) cls += ' in-range';
          return <div key={i} className={cls} onClick={() => !isPast && onSelectDay(dt)}>{dt.getDate()}</div>;
        })}
      </div>
    </div>
  );
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
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [calOffset, setCalOffset] = useState(0);

  const now = new Date();
  const calMonths = [0, 1].map(i => {
    const d = new Date(now.getFullYear(), now.getMonth() + calOffset + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const handleDayClick = (dt) => {
    if (!checkin || (checkin && checkout) || dt <= checkin) {
      setCheckin(dt); setCheckout(null);
    } else {
      setCheckout(dt);
    }
  };

  const fmt = d => d ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` : '—';
  const nights = checkin && checkout ? Math.round((checkout - checkin) / (1000*60*60*24)) : 0;
  const subtotal = nights * stay.price;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const checkinStr = checkin.toISOString().split('T')[0];
      const checkoutStr = checkout.toISOString().split('T')[0];
      const alreadyBooked = await checkExistingBooking(stay.id, checkinStr, checkoutStr);
      if (alreadyBooked) {
        setError('These dates are already booked or have a pending request. Please choose different dates.');
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      await createBooking({
        propertyId:     stay.id,
        guestId:        user ? user.id : null,
        checkin:        checkin.toISOString().split('T')[0],
        checkout:       checkout.toISOString().split('T')[0],
        guests,
        totalPrice:     total,
        instantBooking: stay.instantBooking,
        message,
        guestName:      form.name,
        guestEmail:     form.email,
        guestPhone:     form.phone,
      });
      setConfirmed(true);
    } catch(e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bm-modal">
        <div className="bm-header">
          <div className="bm-title">
            {confirmed ? (stay.instantBooking ? 'Booking confirmed' : 'Request sent') :
             step === 1 ? 'Choose your dates' :
             step === 2 ? 'Your details' : 'Review & confirm'}
          </div>
          <button className="bm-close" onClick={onClose}>✕</button>
        </div>

        {confirmed ? (
          <div className="bm-success">
            <div className="bm-success-arabic">{stay.instantBooking ? 'مبروك' : 'شكراً'}</div>
            <div className="bm-success-icon-wrap">
              <div className="bm-success-icon">{stay.instantBooking ? '✓' : '📋'}</div>
            </div>
            <h3 className="bm-success-title">
              {stay.instantBooking ? "You're booked!" : 'Request sent!'}
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
                  <div className="bm-success-col">
                    <span>Check-in</span>
                    <strong>{fmt(checkin)}</strong>
                  </div>
                  <div className="bm-success-divider">→</div>
                  <div className="bm-success-col">
                    <span>Check-out</span>
                    <strong>{fmt(checkout)}</strong>
                  </div>
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
              {stay.instantBooking ? 'View booking details' : 'Got it'}
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
                  <div className="bm-cal-nav">
                    <button className="bm-cal-nav-btn" onClick={() => setCalOffset(o => Math.max(0, o-1))} disabled={calOffset === 0}>←</button>
                    <span className="bm-cal-nav-label">{MONTHS[calMonths[0].month]} {calMonths[0].year} – {MONTHS[calMonths[1].month]} {calMonths[1].year}</span>
                    <button className="bm-cal-nav-btn" onClick={() => setCalOffset(o => Math.min(10, o+1))}>→</button>
                  </div>
                  <div className="bm-calendars">
                    {calMonths.map(({year,month}) => (
                      <CalendarMonth key={year+'-'+month} year={year} month={month}
                        checkin={checkin} checkout={checkout} onSelectDay={handleDayClick} />
                    ))}
                  </div>
                  <div className="bm-date-summary">
                    <div className="bm-date-pill"><span>Check-in</span><strong>{fmt(checkin)}</strong></div>
                    <div className="bm-date-arrow">→</div>
                    <div className="bm-date-pill"><span>Check-out</span><strong>{fmt(checkout)}</strong></div>
                  </div>
                  <div className="bm-guests-row">
                    <div>
                      <div className="bm-guests-label">Guests</div>
                      <div className="bm-guests-sub">Max {maxGuests}</div>
                    </div>
                    <div className="bm-counter">
                      <button className="counter-btn" disabled={guests<=1} onClick={() => setGuests(g=>g-1)}>−</button>
                      <span className="counter-val">{guests}</span>
                      <button className="counter-btn" disabled={guests>=maxGuests} onClick={() => setGuests(g=>g+1)}>+</button>
                    </div>
                  </div>
                  {nights > 0 && (
                    <div className="bm-price-preview">
                      <div className="bm-price-row"><span>£{stay.price} × {nights} night{nights>1?'s':''}</span><span>£{subtotal}</span></div>
                      <div className="bm-price-row"><span>Service fee</span><span>£{serviceFee}</span></div>
                      <div className="bm-price-row bm-price-total"><span>Total</span><span>£{total}</span></div>
                    </div>
                  )}
                  <button className="btn-primary bm-next-btn" disabled={!checkin || !checkout} onClick={() => setStep(2)}>Continue →</button>
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
                    <label className="form-label">Full name</label>
                    <input className="form-input" type="text" placeholder="As on your ID"
                      value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input className="form-input" type="email" placeholder="you@example.com"
                      value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone number</label>
                    <input className="form-input" type="tel" placeholder="+44 7700 000000"
                      value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
                  </div>
                  {!stay.instantBooking && (
                    <div className="form-group">
                      <label className="form-label">Message to host <span style={{fontWeight:300,color:'var(--ink-soft)'}}>(optional)</span></label>
                      <textarea className="form-input form-textarea"
                        placeholder="Tell the host about yourself and your trip..."
                        value={message} onChange={e => setMessage(e.target.value)} />
                    </div>
                  )}
                  <div className="bm-nav">
                    <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn-primary" disabled={!form.name||!form.email||!form.phone} onClick={() => setStep(3)}>Continue →</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bm-step-content">
                  <div className={stay.instantBooking ? 'bm-instant-badge' : 'bm-request-badge'}>
                    {stay.instantBooking ? '⚡ Instant booking — confirmed immediately' : '📋 Request to book — host responds within 24 hours'}
                  </div>
                  <div className="bm-confirm-summary">
                    <div className="bm-confirm-row"><span>Property</span><strong>{stay.name}</strong></div>
                    <div className="bm-confirm-row"><span>Check-in</span><strong>{fmt(checkin)}</strong></div>
                    <div className="bm-confirm-row"><span>Check-out</span><strong>{fmt(checkout)}</strong></div>
                    <div className="bm-confirm-row"><span>Nights</span><strong>{nights}</strong></div>
                    <div className="bm-confirm-row"><span>Guests</span><strong>{guests}</strong></div>
                    <div className="bm-confirm-row"><span>Name</span><strong>{form.name}</strong></div>
                    <div className="bm-confirm-row bm-confirm-total"><span>Total</span><strong>£{total}</strong></div>
                  </div>
                  <div className="bm-terms">By confirming you agree to SunnaStays guest policies. Payment will be collected after confirmation.</div>
                  {error && <div className="auth-error">{error}</div>}
                  <div className="bm-nav">
                    <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                    <button className="btn-primary bm-confirm-btn" onClick={handleSubmit} disabled={loading}>
                      {loading ? 'Confirming…' : stay.instantBooking ? '⚡ Confirm booking' : '📋 Send request'}
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
