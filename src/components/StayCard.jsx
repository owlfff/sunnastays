import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StayCard.css';

export default function StayCard({ stay }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="stay-card" onClick={() => navigate(`/stays/${stay.slug}`)}>
      <div className="stay-card-img" style={{ background: stay.gradient }}>
        <span className="stay-card-emoji">{stay.emoji}</span>
        <button
          className="stay-wishlist"
          onClick={e => { e.stopPropagation(); setWishlisted(w => !w); }}
          aria-label="Save to wishlist"
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="stay-card-body">
        <span className="halal-tick">✓ Halal certified</span>
        <div className="stay-meta">
          <div className="stay-name">{stay.name}</div>
          <div className="stay-rating">★ {stay.rating}</div>
        </div>
        <div className="stay-loc">{stay.location}</div>
        <div className="stay-price">£{stay.price} <span>/ night</span></div>
      </div>
    </div>
  );
}
