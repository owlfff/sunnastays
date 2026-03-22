import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import StayCard from '../components/StayCard';
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

  const [stays, setStays]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort]       = useState('rating');

  useEffect(() => {
    setLoading(true);
    searchStays({ destination, checkin, checkout, guests })
      .then(results => { setStays(results); setLoading(false); })
      .catch(() => setLoading(false));
  }, [destination, checkin, checkout, guests]);

  const sorted = [...stays].sort((a, b) => {
    if (sort === 'rating')    return b.rating - a.rating;
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return 0;
  });

  const destLabel   = destination || 'Anywhere';
  const dateLabel   = checkin && checkout ? `${checkin} – ${checkout}` : 'Any week';
  const guestLabel  = guests ? `${guests} guest${guests > 1 ? 's' : ''}` : 'Any guests';

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

      <div className="sr-layout">
        {/* RESULTS PANEL */}
        <div className="sr-results">
          <div className="sr-results-header">
            <div className="sr-count">
              {loading ? 'Searching…' : <><strong>{sorted.length}</strong> <span>halal stays found</span></>}
            </div>
            <select
              className="sr-sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="rating">Sort: Top rated</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
            </select>
          </div>

          {loading ? (
            <div className="sr-loading">
              <div className="sr-loading-grid">
                {[...Array(6)].map((_, i) => <div key={i} className="sr-skeleton" />)}
              </div>
            </div>
          ) : (
            <div className="sr-grid">
              {sorted.map(stay => <StayCard key={stay.id} stay={stay} />)}
            </div>
          )}
        </div>

        {/* MAP PANEL */}
        <div className="sr-map">
          <div className="sr-map-inner">
            <div className="map-pins">
              {sorted.slice(0, 5).map((stay, i) => {
                const positions = [
                  { top: '20%', left: '22%' },
                  { top: '44%', left: '58%' },
                  { top: '64%', left: '28%' },
                  { top: '28%', left: '70%' },
                  { top: '70%', left: '55%' },
                ];
                return (
                  <div
                    key={stay.id}
                    className="map-pin"
                    style={positions[i]}
                    onClick={() => navigate(`/stays/${stay.slug}`)}
                  >
                    £{stay.price}
                  </div>
                );
              })}
            </div>
            <div className="map-placeholder">
              <h3>Map view</h3>
              <p>Coming soon — interactive map</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
