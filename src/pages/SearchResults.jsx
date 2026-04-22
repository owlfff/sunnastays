import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import StayCard from '../components/StayCard';
import SearchMap from '../components/SearchMap';
import Footer from '../components/Footer';
import { searchStays } from '../api';
import './SearchResults.css';

const PRICE_OPTIONS = [
  { label: 'Any price',   min: null, max: null },
  { label: 'Under £100',  min: null, max: 100 },
  { label: '£100–£200',   min: 100,  max: 200 },
  { label: '£200–£350',   min: 200,  max: 350 },
  { label: '£350+',       min: 350,  max: null },
];

const TYPE_OPTIONS = ['Apartment', 'House', 'Riad / Dar', 'Boutique hotel', 'Villa', 'Unique stay'];

const BEDROOM_OPTIONS = [
  { label: 'Any', min: null },
  { label: '1+',  min: 1 },
  { label: '2+',  min: 2 },
  { label: '3+',  min: 3 },
  { label: '4+',  min: 4 },
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const destination = searchParams.get('destination') || '';
  const checkin     = searchParams.get('checkin') || '';
  const checkout    = searchParams.get('checkout') || '';
  const guests      = searchParams.get('guests') || '';

  const [stays, setStays]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sort, setSort]           = useState('rating');
  const [hoveredId, setHoveredId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [priceFilter, setPriceFilter]   = useState(PRICE_OPTIONS[0]);
  const [typeFilter, setTypeFilter]     = useState(null);
  const [bedsFilter, setBedsFilter]     = useState(BEDROOM_OPTIONS[0]);
  const handleHover = useCallback((id) => setHoveredId(id), []);

  const toggleDropdown = (name) => setOpenDropdown(o => o === name ? null : name);

  useEffect(() => {
    setLoading(true);
    searchStays({ destination, checkin, checkout, guests })
      .then(results => { setStays(results); setLoading(false); })
      .catch(() => setLoading(false));
  }, [destination, checkin, checkout, guests]);

  const sorted = useMemo(() => {
    let results = [...stays];
    if (priceFilter.min != null) results = results.filter(s => s.price >= priceFilter.min);
    if (priceFilter.max != null) results = results.filter(s => s.price <= priceFilter.max);
    if (typeFilter)              results = results.filter(s => s.type === typeFilter);
    if (bedsFilter.min != null)  results = results.filter(s => parseInt(s.bedrooms) >= bedsFilter.min);
    results.sort((a, b) => {
      if (sort === 'price_asc')  return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return 0;
    });
    return results;
  }, [stays, sort, priceFilter, typeFilter, bedsFilter]);

  const destLabel  = destination || 'Anywhere';
  const dateLabel  = checkin && checkout ? `${checkin} – ${checkout}` : 'Any week';
  const guestLabel = guests ? `${guests} guest${guests > 1 ? 's' : ''}` : 'Any guests';

  return (
    <div className="sr-page">
      {/* FILTER BAR */}
      <div className="sr-filter-bar" onClick={() => setOpenDropdown(null)}>
        <button className="filter-chip active" onClick={e => { e.stopPropagation(); navigate('/'); }}>
          🗺️ {destLabel}
        </button>
        <button className="filter-chip active">📅 {dateLabel}</button>
        <button className="filter-chip active">👥 {guestLabel}</button>

        <div className="filter-dropdown-wrap" onClick={e => e.stopPropagation()}>
          <button className={`filter-chip ${priceFilter.min != null || priceFilter.max != null ? 'active' : ''}`}
            onClick={() => toggleDropdown('price')}>
            💰 {priceFilter.label}
          </button>
          {openDropdown === 'price' && (
            <div className="filter-dropdown">
              {PRICE_OPTIONS.map(o => (
                <button key={o.label} className={`filter-dropdown-item ${priceFilter.label === o.label ? 'selected' : ''}`}
                  onClick={() => { setPriceFilter(o); setOpenDropdown(null); }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-dropdown-wrap" onClick={e => e.stopPropagation()}>
          <button className={`filter-chip ${typeFilter ? 'active' : ''}`}
            onClick={() => toggleDropdown('type')}>
            🏠 {typeFilter || 'Property type'}
          </button>
          {openDropdown === 'type' && (
            <div className="filter-dropdown">
              <button className={`filter-dropdown-item ${!typeFilter ? 'selected' : ''}`}
                onClick={() => { setTypeFilter(null); setOpenDropdown(null); }}>
                Any type
              </button>
              {TYPE_OPTIONS.map(t => (
                <button key={t} className={`filter-dropdown-item ${typeFilter === t ? 'selected' : ''}`}
                  onClick={() => { setTypeFilter(t); setOpenDropdown(null); }}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-dropdown-wrap" onClick={e => e.stopPropagation()}>
          <button className={`filter-chip ${bedsFilter.min != null ? 'active' : ''}`}
            onClick={() => toggleDropdown('beds')}>
            🛏️ {bedsFilter.min != null ? `${bedsFilter.label} bedrooms` : 'Bedrooms'}
          </button>
          {openDropdown === 'beds' && (
            <div className="filter-dropdown">
              {BEDROOM_OPTIONS.map(o => (
                <button key={o.label} className={`filter-dropdown-item ${bedsFilter.label === o.label ? 'selected' : ''}`}
                  onClick={() => { setBedsFilter(o); setOpenDropdown(null); }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {(priceFilter.min != null || priceFilter.max != null || typeFilter || bedsFilter.min != null) && (
          <button className="filter-chip filter-chip--clear" onClick={() => {
            setPriceFilter(PRICE_OPTIONS[0]);
            setTypeFilter(null);
            setBedsFilter(BEDROOM_OPTIONS[0]);
          }}>
            ✕ Clear filters
          </button>
        )}
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
          <SearchMap stays={sorted} onHover={handleHover} hoveredId={hoveredId} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
