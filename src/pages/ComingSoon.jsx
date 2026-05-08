import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './LegalPage.css';
import './ComingSoon.css';

export default function ComingSoon() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="coming-soon-body">
        <div className="coming-soon-inner">
          <div className="coming-soon-mark">س</div>
          <h1>Coming soon</h1>
          <p>We're working on something. Check back shortly.</p>
          <button className="coming-soon-btn" onClick={() => navigate('/')}>← Back to home</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
