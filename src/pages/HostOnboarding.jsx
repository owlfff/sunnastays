import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useOnboarding } from '../hooks/useOnboarding';
import AddressPicker from '../components/AddressPicker';
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

const HALAL_CHECKS = [
  { key: 'alcoholFree',          required: true,  title: 'Alcohol-free property',      desc: 'No alcohol is stored, consumed, or served on the property at any time.' },
  { key: 'noNonHalalMeat',       required: true,  title: 'No non-halal meat',           desc: 'Pork and non-halal meat products are not present or permitted on the property.' },
  { key: 'petFree',              required: true,  title: 'Pet-free property',           desc: 'No pets reside in or visit the property.' },
  { key: 'halalKitchen',         required: false, title: 'Halal-only kitchen',          desc: 'Kitchen utensils and appliances have only been used with halal-compliant food.' },
  { key: 'prayerSpace',          required: false, title: 'Prayer space or mat available', desc: 'A clean prayer mat is available and the Qibla direction is indicated.' },
  { key: 'mosqueInfo',           required: false, title: 'Nearby mosque information',   desc: 'You can provide guests with details of the nearest mosque.' },
  { key: 'noInappropriateDecor', required: false, title: 'No inappropriate décor',      desc: 'The property contains no explicit imagery or alcohol advertising.' },
];

// ── Step 1 ────────────────────────────────────────────────────
function StepProperty({ form, update, goStep, navigate }) {
  return (
    <>
      <div className="step-title">Property details</div>
      <div className="step-subtitle">Tell us about your property.</div>
      <div className="form-group">
        <label className="form-label">Property name</label>
        <input className="form-input" type="text" placeholder="e.g. Sultana Suite…"
          value={form.name} onChange={e => update('name', e.target.value)} />
      </div>
      <AddressPicker
        value={{ address: form.address, lat: form.lat, lng: form.lng }}
        onChange={({ address, lat, lng, city, country }) => {
          update('address', address);
          update('lat', lat);
          update('lng', lng);
          if (city) update('city', city);
          if (country) update('country', country);
        }}
      />
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
          placeholder="Describe your property…"
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
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) {
        setUploadError('Failed to upload ' + file.name);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      addPhoto({ url: publicUrl, name: file.name });
    }
    setUploading(false);
  };

  return (
    <>
      <div className="step-title">Add photos</div>
      <div className="step-subtitle">Great photos get more bookings. Add at least 5 — the first will be your cover image.</div>

      <div className="photo-drop" onClick={() => fileInputRef.current.click()}>
        <div style={{ fontSize: 44 }}>📸</div>
        <h4>{uploading ? 'Uploading…' : 'Click to upload photos'}</h4>
        <p>JPG, PNG or HEIC · Minimum 1024px wide · Up to 20 photos</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {uploadError && <div className="form-error">{uploadError}</div>}

      {form.photos.length > 0 && (
        <div className="photo-grid">
          {form.photos.map((p, i) => (
            <div key={i} className="photo-thumb-real">
              <img src={p.url} alt={p.name} />
              <button className="photo-remove" onClick={() => removePhoto(i)}>✕</button>
              {i === 0 && <span className="photo-cover-badge">Cover</span>}
            </div>
          ))}
        </div>
      )}

      <div className="photo-tip">
        📌 <strong>Tip:</strong> Photos showing prayer spaces, halal kitchens, and the local mosque tend to get more bookings.
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
  return (
    <>
      <div className="step-title">Set your price</div>
      <div className="step-subtitle">Set your nightly rate — we'll show you what you earn after our 8% host fee.</div>
      <div className="form-group">
        <label className="form-label">Nightly price (GBP)</label>
        <div className="price-input-wrap">
          <span className="price-symbol">£</span>
          <input className="form-input price-input" type="number" placeholder="0" min="0"
            value={form.price} onChange={e => update('price', e.target.value)} />
        </div>
        <div className="price-suggestion">
          {QUICK_PRICES.map(p => (
            <button key={p} className={`price-tag ${form.price === String(p) ? 'selected' : ''}`}
              onClick={() => update('price', String(p))}>£{p}</button>
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
      <div className="form-group" style={{marginTop:8}}>
        <label className="form-label">Booking type</label>
        <div style={{display:'flex',gap:12,marginTop:4}}>
          <div
            className={form.instantBooking ? 'type-tile' : 'type-tile selected'}
            onClick={() => update('instantBooking', false)}
            style={{flex:1,padding:'16px 12px'}}
          >
            <div className="ti">📋</div>
            <div className="tn">Request to book</div>
            <div style={{fontSize:11,color:'var(--ink-soft)',marginTop:4,fontWeight:300}}>You approve each guest</div>
          </div>
          <div
            className={form.instantBooking ? 'type-tile selected' : 'type-tile'}
            onClick={() => update('instantBooking', true)}
            style={{flex:1,padding:'16px 12px'}}
          >
            <div className="ti">⚡</div>
            <div className="tn">Instant booking</div>
            <div style={{fontSize:11,color:'var(--ink-soft)',marginTop:4,fontWeight:300}}>Guests book immediately</div>
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

// ── Step 4: Halal ─────────────────────────────────────────────
function StepHalal({ form, toggleHalalCheck, goStep }) {
  return (
    <>
      <div className="step-title">Halal standards</div>
      <div className="step-subtitle">Required items must be confirmed to list.</div>
      <div className="halal-check-list">
        {HALAL_CHECKS.map(({ key, required, title, desc }) => {
          const checked = form.halalChecks[key];
          return (
            <div key={key} className={`halal-check-item ${checked ? 'checked' : ''} ${required ? 'required' : ''}`}
              onClick={() => toggleHalalCheck(key)}>
              <div className="check-box">{checked ? '✓' : ''}</div>
              <div className="check-text">
                <h4>{title}{required && <span className="required-badge">Required</span>}</h4>
                <p>{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="halal-note">🟢 Our team verifies your property before your listing goes live.</div>
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
      <div className="step-subtitle">Check your listing summary then submit for review.</div>
      <div className="submit-summary">
        {[
          ['Property name', form.name || '—'],
          ['Location', loc],
          ['Property type', form.type || '—'],
          ['Nightly rate', form.price ? `£${form.price} / night` : '—'],
          ['Photos', `${form.photos.length} uploaded`],
          ['Halal standards', `${checkedCount} / ${totalChecks} items confirmed`],
        ].map(([k, v]) => (
          <div key={k} className="summary-row">
            <span className="summary-key">{k}</span>
            <span className={`summary-val ${k === 'Halal standards' ? 'summary-val--halal' : ''}`}>{v}</span>
          </div>
        ))}
      </div>
      <div className="terms-box">
        <p>By submitting, you confirm all information is accurate and your property meets the SunnaStays Halal Charter.</p>
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

// ── Success ───────────────────────────────────────────────────
function SuccessState({ navigate }) {
  return (
    <div className="success-state">
      <div className="success-icon">🎉</div>
      <h3>Listing submitted!</h3>
      <p>Jazakallah khair. Your property has been received and our halal verification team will review it within <strong>48 hours</strong>.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>← Back to SunnaStays</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
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

        <div className="step-card">
          {ob.submitted ? <SuccessState navigate={navigate} /> : (
            <>
              {ob.step === 1 && <StepProperty  form={ob.form} update={ob.update} goStep={ob.goStep} navigate={navigate} />}
              {ob.step === 2 && <StepPhotos    form={ob.form} addPhoto={ob.addPhoto} removePhoto={ob.removePhoto} goStep={ob.goStep} />}
              {ob.step === 3 && <StepPricing   form={ob.form} update={ob.update} goStep={ob.goStep} hostFee={ob.hostFee} hostEarns={ob.hostEarns} />}
              {ob.step === 4 && <StepHalal     form={ob.form} toggleHalalCheck={ob.toggleHalalCheck} goStep={ob.goStep} />}
              {ob.step === 5 && <StepSubmit    form={ob.form} update={ob.update} checkedCount={ob.checkedCount} totalChecks={ob.totalChecks} submitting={ob.submitting} error={ob.error} handleSubmit={ob.handleSubmit} goStep={ob.goStep} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
