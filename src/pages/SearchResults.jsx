import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import StayCard from '../components/StayCard';
import SearchMap from '../components/SearchMap';
import Footer from '../components/Footer';
import { searchStays } from '../api';
import './SearchResults.css';

const FILTERS = [
  { label: '💰 Price range' },
  { label: '🏠 Property type' },
  { label: '🕌 Near mosque' },
  { label: '⭐ Top rated' },
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const destination = searchParams.get('destination') || '';
  const checkin     = searchParams.get('checkin') || '';
  const checkout    = searchParams.get('checkout') || '';
  const guests      = searchParams.get('guests') || '';

  const [stays, setStays]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState('rating');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    setLoading(true);
    searchStays({ destination, checkin, checkout, guests })
      .then(results => { setStays(results); setLoading(false); })
      .catch(() => setLoading(false));
  }, [destination, checkin, checkout, guests]);

  const sorted = [...stays].sort((a, b) => {
    if (sort === 'rating')     return b.rating - a.rating;
    if (sort === 'price_asc')  return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return 0;
  });

  const destLabel  = destination || 'Anywhere';
  const dateLabel  = checkin && checkout ? `${checkin} – ${checkout}` : 'Any week';
  const guestLabel = guests ? `${guests} guest${guests > 1 ? 's' : ''}` : 'Any guests';

  return (
    <div className="sr-page">
      {/* FILTER BAR */}
      <div className="sr-filter-bar">
        <button className="filter-chip active" onClick={() => navigate('/')}>
          🗺️ {destLabel}
        </button>
        <button className="filter-chip active">📅 {dateLabel}</button>
        <button className="filter-chip active">👥 {guestLabel}</button>
        {FILTERS.map(f => (
          <button key={f.label} className="filter-chip">{f.label}</button>
        ))}
      </div>

      <div className="sr-layout" style={{minHeight: Math.max(sorted.length * 320, 400) + "px"}}>
        {/* RESULTS */}
        <div className="sr-results">
          <div className="sr-results-header">
            <div className="sr-count">
              {loading
                ? 'Searching…'
                : <><strong>{sorted.length}</strong> <span>halal stays found</span></>
              }
            </div>
            <select className="sr-sort" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="rating">Sort: Top rated</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
            </select>
          </div>

          {loading ? (
            <div className="sr-loading-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="sr-skeleton" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="sr-empty">
              <div className="sr-empty-icon">🔍</div>
              <h3>No halal stays found</h3>
              <p>Try a different destination or browse all stays</p>
              <button className="btn-primary" onClick={() => navigate('/search')}>Browse all stays</button>
            </div>
          ) : (
            <div className="sr-grid">
              {sorted.map(stay => (
                <div
                  key={stay.id}
                  className={`sr-card-wrap ${hoveredId === stay.id ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredId(stay.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <StayCard stay={stay} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MAP */}
        <div className="sr-map-panel">
          <SearchMap stays={sorted} onHover={setHoveredId} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
