import React, { useState } from 'react';
import { supabase } from '../supabase';
import './PhoneVerify.css';

export default function PhoneVerify({ onVerified, onSkip }) {
  const [step, setStep] = useState(1); // 1=enter phone, 2=enter code
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendCode = async () => {
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send code. Check the number and try again.');
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
        body: JSON.stringify({ phone, code, userId: user?.id }),
      });
      const data = await res.json();
      if (data.verified) {
        onVerified(phone);
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
          <p className="pv-sub">We'll send you a 6-digit code to verify your number. This helps keep SunnaStays safe for everyone.</p>
          <div className="form-group">
            <label className="form-label">Phone number <span style={{color:'var(--terra)'}}>*</span></label>
            <input
              className="form-input"
              type="tel"
              placeholder="+44 7700 000000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendCode()}
            />
            <div style={{fontSize:12,color:'var(--ink-soft)',marginTop:4}}>Include country code e.g. +44 for UK</div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn-primary pv-btn" onClick={sendCode} disabled={loading}>
            {loading ? 'Sending…' : 'Send verification code →'}
          </button>
          {onSkip && (
            <button className="pv-skip" onClick={onSkip}>Skip for now</button>
          )}
        </>
      ) : (
        <>
          <div className="pv-icon">🔐</div>
          <h3 className="pv-title">Enter the code</h3>
          <p className="pv-sub">We sent a 6-digit code to <strong>{phone}</strong>. It expires in 10 minutes.</p>
          <div className="form-group">
            <label className="form-label">Verification code <span style={{color:'var(--terra)'}}>*</span></label>
            <input
              className="form-input pv-code-input"
              type="number"
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
              maxLength={6}
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
