import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../hooks/useOnboarding';
import './HostOnboarding.css';

const STEPS = ['Property', 'Photos', 'Pricing', 'Halal', 'Submit'];

const PROPERTY_TYPES = [
  { icon: '🏢', label: 'Apartment' },
  { icon: '🏡', label: 'House' },
  { icon: '🏰', label: 'Riad / Dar' },
  { icon: '🏨', label: 'Boutique hotel' },
  { icon: '🛖', label: 'Villa' },
  { icon: '🏕️', label: 'Unique stay' },
];

const COUNTRIES = [
  'Turkey','United Arab Emirates','Morocco','Malaysia','Jordan',
  'Indonesia','United Kingdom','Spain','Maldives','Saudi Arabia','Egypt','Other',
];

const HALAL_CHECKS = [
  { key: 'alcoholFree',        required: true,  title: 'Alcohol-free property', desc: 'No alcohol is stored, consumed, or served on the property at any time, including by you as a host.' },
  { key: 'noNonHalalMeat',     required: true,  title: 'No non-halal meat', desc: 'Pork and non-halal meat products are not present or permitted on the property at any time.' },
  { key: 'petFree',            required: true,  title: 'Pet-free property', desc: 'No pets reside in or visit the property. If previously pet-occupied, it has been professionally deep-cleaned.' },
  { key: 'halalKitchen',       required: false, title: 'Halal-only kitchen', desc: 'Kitchen utensils, cookware, and appliances have only been used with halal-compliant food.' },
  { key: 'prayerSpace',        required: false, title: 'Prayer space or mat available', desc: 'A clean prayer mat is available and the Qibla direction is indicated or can be provided on request.' },
  { key: 'mosqueInfo',         required: false, title: 'Nearby mosque information', desc: 'You can provide guests with details of the nearest mosque, including prayer times if possible.' },
  { key: 'noInappropriateDecor', required: false, title: 'No inappropriate décor', desc: 'The property contains no explicit imagery, alcohol advertising, or content conflicting with Islamic values.' },
];

const PHOTO_PLACEHOLDERS = [
  { gradient: 'linear-gradient(135deg,var(--terra-muted),var(--terra))', emoji: '🕌' },
  { gradient: 'linear-gradient(135deg,var(--sand-deep),#a07040)', emoji: '🛏️' },
  { gradient: 'linear-gradient(135deg,#a8c4b8,#4a7c59)', emoji: '🍳' },
];

// ── Step 1: Property Details ──────────────────────────────────
function StepProperty({ form, update, goStep, navigate }) {
  return (
    <>
      <div className="step-title">Property details</div>
      <div className="step-subtitle">Tell us about your property. Accuracy here builds guest trust.</div>

      <div className="form-group">
        <label className="form-label">Property name</label>
        <input className="form-input" type="text" placeholder="e.g. Sultana Suite, Riad al-Fajr…"
          value={form.name} onChange={e => update('name', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Property type</label>
        <div className="type-grid">
          {PROPERTY_TYPES.map(t => (
            <div key={t.label} className={`type-tile ${form.type === t.label ? 'selected' : ''}`}
              onClick={() => update('type', t.label)}>
              <div className="ti">{t.icon}</div>
              <div className="tn">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" type="text" placeholder="Istanbul"
            value={form.city} onChange={e => update('city', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Country</label>
          <select className="form-input form-select" value={form.country} onChange={e => update('country', e.target.value)}>
            <option value="">Select country…</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Bedrooms</label>
          <select className="form-input form-select" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)}>
            {['1','2','3','4','5+'].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Max guests</label>
          <select className="form-input form-select" value={form.maxGuests} onChange={e => update('maxGuests', e.target.value)}>
            {['2','4','6','8','10+'].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Property description</label>
        <textarea className="form-input form-textarea"
          placeholder="Describe your property — its character, location highlights, and what makes it special for Muslim guests…"
          value={form.description} onChange={e => update('description', e.target.value)} />
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={() => navigate('/')}>← Back to home</button>
        <button className="btn-next" onClick={() => goStep(2)}>Continue →</button>
      </div>
    </>
  );
}

// ── Step 2: Photos ────────────────────────────────────────────
function StepPhotos({ form, addPhoto, removePhoto, goStep }) {
  const photos = form.photos.length > 0 ? form.photos : PHOTO_PLACEHOLDERS;

  return (
    <>
      <div className="step-title">Add photos</div>
      <div className="step-subtitle">Great photos get more bookings. Add at least 5 — the first will be your cover image.</div>

      <div className="photo-drop" onClick={() => addPhoto({ gradient: 'linear-gradient(135deg,#D4C4A0,#C4622D)', emoji: ['🌅','🛁','🌿','🏙️','☀️','🌙'][Math.floor(Math.random()*6)] })}>
        <div style={{ fontSize: 44 }}>📸</div>
        <h4>Drag photos here or click to upload</h4>
        <p>JPG, PNG or HEIC · Minimum 1024px wide · Up to 20 photos</p>
      </div>

      <div className="photo-grid">
        {photos.map((p, i) => (
          <div key={i} className="photo-thumb" style={{ background: p.gradient }}>
            <div className="photo-thumb-bg">{p.emoji}</div>
            {form.photos.length > 0 && (
              <button className="photo-remove" onClick={() => removePhoto(i)}>✕</button>
            )}
          </div>
        ))}
      </div>

      <div className="photo-tip">
        📌 <strong>Tip:</strong> Photos showing prayer spaces, halal kitchens, and the local mosque tend to get more bookings on SunnaStays.
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={() => goStep(1)}>← Back</button>
        <button className="btn-next" onClick={() => goStep(3)}>Continue →</button>
      </div>
    </>
  );
}

// ── Step 3: Pricing ───────────────────────────────────────────
function StepPricing({ form, update, goStep, hostFee, hostEarns }) {
  const QUICK_PRICES = [75, 120, 180, 250, 400];

  const setPrice = (val) => {
    update('price', String(val));
  };

  return (
    <>
      <div className="step-title">Set your price</div>
      <div className="step-subtitle">You're in full control. Set your nightly rate — we'll show you what you earn after our 8% host fee.</div>

      <div className="form-group">
        <label className="form-label">Nightly price (GBP)</label>
        <div className="price-input-wrap">
          <span className="price-symbol">£</span>
          <input className="form-input price-input" type="number" placeholder="0" min="0"
            value={form.price} onChange={e => update('price', e.target.value)} />
        </div>
        <div className="price-suggestion">
          {QUICK_PRICES.map(p => (
            <button key={p} className={`price-tag ${form.price === String(p) ? 'selected' : ''}`} onClick={() => setPrice(p)}>
              £{p}
            </button>
          ))}
        </div>
      </div>

      <div className="price-breakdown">
        <div className="price-row"><span>Your nightly rate</span><span>{form.price ? `£${form.price}` : '£—'}</span></div>
        <div className="price-row"><span>SunnaStays host fee (8%)</span><span>{form.price ? `−£${hostFee}` : '−£—'}</span></div>
        <div className="price-row price-row--total"><span>You receive per night</span><span>{form.price ? `£${hostEarns}` : '£—'}</span></div>
      </div>

      <div className="form-row" style={{ marginTop: 22 }}>
        <div className="form-group">
          <label className="form-label">Minimum stay</label>
          <select className="form-input form-select" value={form.minStay} onChange={e => update('minStay', e.target.value)}>
            {['1 night','2 nights','3 nights','7 nights'].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cleaning fee (optional)</label>
          <div className="price-input-wrap">
            <span className="price-symbol">£</span>
            <input className="form-input" type="number" placeholder="0" style={{ paddingLeft: 28 }}
              value={form.cleaningFee} onChange={e => update('cleaningFee', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={() => goStep(2)}>← Back</button>
        <button className="btn-next" onClick={() => goStep(4)}>Continue →</button>
      </div>
    </>
  );
}

// ── Step 4: Halal Checklist ───────────────────────────────────
function StepHalal({ form, toggleHalalCheck, goStep, checkedCount, totalChecks }) {
  return (
    <>
      <div className="step-title">Halal standards</div>
      <div className="step-subtitle">SunnaStays only accepts properties that meet our Halal Charter. Required items must be confirmed to list.</div>

      <div className="halal-check-list">
        {HALAL_CHECKS.map(({ key, required, title, desc }) => {
          const checked = form.halalChecks[key];
          return (
            <div key={key} className={`halal-check-item ${checked ? 'checked' : ''} ${required ? 'required' : ''}`}
              onClick={() => toggleHalalCheck(key)}>
              <div className="check-box">{checked ? '✓' : ''}</div>
              <div className="check-text">
                <h4>
                  {title}
                  {required && <span className="required-badge">Required</span>}
                </h4>
                <p>{desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="halal-note">
        🟢 Our team verifies your property against these standards before your listing goes live.
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={() => goStep(3)}>← Back</button>
        <button className="btn-next" onClick={() => goStep(5)}>Continue →</button>
      </div>
    </>
  );
}

// ── Step 5: Submit ────────────────────────────────────────────
function StepSubmit({ form, update, checkedCount, totalChecks, submitting, error, handleSubmit, goStep }) {
  const loc = [form.city, form.country].filter(Boolean).join(', ') || '—';

  return (
    <>
      <div className="step-title">Review & submit</div>
      <div className="step-subtitle">Check your listing summary, accept the Host Agreement, then submit for review.</div>

      <div className="submit-summary">
        {[
          ['Property name', form.name || '—'],
          ['Location', loc],
          ['Property type', form.type || '—'],
          ['Nightly rate', form.price ? `£${form.price} / night` : '—'],
          ['Halal standards', `${checkedCount} / ${totalChecks} items confirmed`],
        ].map(([k, v]) => (
          <div key={k} className="summary-row">
            <span className="summary-key">{k}</span>
            <span className={`summary-val ${k === 'Halal standards' ? 'summary-val--halal' : ''}`}>{v}</span>
          </div>
        ))}
      </div>

      <div className="terms-box">
        <p>By submitting, you confirm all information is accurate, your property meets the SunnaStays Halal Charter, and you agree to our Host Terms & Conditions. Misrepresentation of halal standards may result in immediate removal from the platform.</p>
        <label className="terms-check">
          <input type="checkbox" checked={form.termsAccepted} onChange={e => update('termsAccepted', e.target.checked)} />
          I agree to the SunnaStays Host Agreement and Halal Property Charter
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Your full name</label>
        <input className="form-input" type="text" placeholder="As it appears on your ID"
          value={form.fullName} onChange={e => update('fullName', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => update('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone number</label>
          <input className="form-input" type="tel" placeholder="+44 7700 000000"
            value={form.phone} onChange={e => update('phone', e.target.value)} />
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="step-nav">
        <button className="btn-back" onClick={() => goStep(4)}>← Back</button>
        <button className="btn-next btn-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit listing ✓'}
        </button>
      </div>
    </>
  );
}

// ── Success State ─────────────────────────────────────────────
function SuccessState({ navigate }) {
  return (
    <div className="success-state">
      <div className="success-icon">🎉</div>
      <h3>Listing submitted!</h3>
      <p>Jazakallah khair. Your property has been received and our halal verification team will review it within <strong>48 hours</strong>. We'll be in touch at the email you provided.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>← Back to SunnaStays</button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function HostOnboarding() {
  const navigate = useNavigate();
  const ob = useOnboarding();

  return (
    <div className="onboard-page">
      <div className="onboard-wrap">
        <div className="onboard-header">
          <p className="onboard-arabic">كن مضيفاً معنا</p>
          <h2>List your <em>property</em></h2>
          <p>Join SunnaStays in 5 simple steps. Our team reviews every listing within 48 hours.</p>
        </div>

        {/* PROGRESS */}
        <div className="progress-track">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const isDone   = n < ob.step;
            const isActive = n === ob.step;
            return (
              <div key={label} className={`progress-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                <div className="step-dot">{isDone ? '✓' : n}</div>
                <div className="step-label">{label}</div>
              </div>
            );
          })}
        </div>

        {/* STEP CARD */}
        <div className="step-card">
          {ob.submitted ? (
            <SuccessState navigate={navigate} />
          ) : (
            <>
              {ob.step === 1 && <StepProperty    form={ob.form} update={ob.update} goStep={ob.goStep} navigate={navigate} />}
              {ob.step === 2 && <StepPhotos      form={ob.form} addPhoto={ob.addPhoto} removePhoto={ob.removePhoto} goStep={ob.goStep} />}
              {ob.step === 3 && <StepPricing     form={ob.form} update={ob.update} goStep={ob.goStep} hostFee={ob.hostFee} hostEarns={ob.hostEarns} />}
              {ob.step === 4 && <StepHalal       form={ob.form} toggleHalalCheck={ob.toggleHalalCheck} goStep={ob.goStep} checkedCount={ob.checkedCount} totalChecks={ob.totalChecks} />}
              {ob.step === 5 && <StepSubmit      form={ob.form} update={ob.update} checkedCount={ob.checkedCount} totalChecks={ob.totalChecks} submitting={ob.submitting} error={ob.error} handleSubmit={ob.handleSubmit} goStep={ob.goStep} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
