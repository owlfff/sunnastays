import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CookieBanner.css';

export default function CookieBanner({ onConsent }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
    onConsent(true);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
    onConsent(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <p>
          We use cookies to keep you signed in and, with your consent, to understand how visitors use SunnaStays via anonymous analytics.{' '}
          <button className="cookie-link" onClick={() => navigate('/cookies')}>Cookie Policy</button>
        </p>
        <div className="cookie-banner-actions">
          <button className="cookie-btn cookie-btn--decline" onClick={handleDecline}>Decline</button>
          <button className="cookie-btn cookie-btn--accept" onClick={handleAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
}
