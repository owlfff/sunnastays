import React, { useState } from 'react';
import { supabase } from '../supabase';
import './PhoneVerify.css';

const COUNTRY_CODES = [
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
];

function formatLocalNumber(raw) {
  // Remove leading 0, spaces, dashes
  return raw.replace(/^0/, '').replace(/[\s\-]/g, '');
}

export default function PhoneVerify({ onVerified, onSkip, initialPhone }) {
  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+44');
  const [localNumber, setLocalNumber] = useState(() => {
    if (!initialPhone) return '';
    // Strip country code if present
    const cleaned = initialPhone.replace(/[\s\-]/g, '');
    for (const c of COUNTRY_CODES) {
      if (cleaned.startsWith(c.code)) return cleaned.slice(c.code.length);
    }
    return cleaned.replace(/^0/, '');
  });
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fullPhone = countryCode + formatLocalNumber(localNumber);

  const sendCode = async () => {
    if (!localNumber.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send code. Please try again.');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) { setError('Please enter the verification code'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code, userId: user?.id }),
      });
      const data = await res.json();
      if (data.verified) {
        onVerified(fullPhone);
      } else {
        setError(data.error || 'Incorrect code. Please try again.');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-verify">
      {step === 1 ? (
        <>
          <div className="pv-icon">📱</div>
          <h3 className="pv-title">Verify your phone</h3>
          <p className="pv-sub">We'll send you a 6-digit code to verify your number.</p>
          <div className="form-group">
            <label className="form-label">Phone number <span style={{color:'var(--terra)'}}>*</span></label>
            <div className="pv-phone-row">
              <select className="pv-country-select" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                className="form-input pv-number-input"
                type="tel"
                placeholder="7700 000000"
                value={localNumber}
                onChange={e => setLocalNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCode()}
              />
            </div>
            <div style={{fontSize:12,color:'var(--ink-soft)',marginTop:4}}>
              Full number: {fullPhone}
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn-primary pv-btn" onClick={sendCode} disabled={loading}>
            {loading ? 'Sending…' : 'Send verification code →'}
          </button>
          {onSkip && <button className="pv-skip" onClick={onSkip}>Skip for now</button>}
        </>
      ) : (
        <>
          <div className="pv-icon">🔐</div>
          <h3 className="pv-title">Enter the code</h3>
          <p className="pv-sub">We sent a 6-digit code to <strong>{fullPhone}</strong>. It expires in 10 minutes.</p>
          <div className="form-group">
            <label className="form-label">Verification code <span style={{color:'var(--terra)'}}>*</span></label>
            <input
              className="form-input pv-code-input"
              type="number"
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn-primary pv-btn" onClick={verifyCode} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify →'}
          </button>
          <button className="pv-skip" onClick={() => { setStep(1); setCode(''); setError(null); }}>
            ← Change number
          </button>
        </>
      )}
    </div>
  );
}
