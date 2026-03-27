import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingSuccess.css';

export default function BookingSuccess() {
  const navigate = useNavigate();
  
  
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); navigate('/dashboard/guest'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-arabic">مبروك</div>
        <div className="success-icon-wrap">
          <div className="success-check">✓</div>
        </div>
        <h1 className="success-title">Payment confirmed!</h1>
        <p className="success-sub">
          Your booking has been paid and confirmed. You'll receive a confirmation email shortly.
        </p>
        <div className="success-halal">
          🟢 SunnaStays Halal Guarantee applies to your booking
        </div>
        <p className="success-redirect">
          Redirecting to your trips in {countdown} seconds…
        </p>
        <button className="btn-primary success-btn" onClick={() => navigate('/dashboard/guest')}>
          View my trips →
        </button>
      </div>
    </div>
  );
}
