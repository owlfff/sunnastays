import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './SearchBar.css';

const SUGGESTED = [
  { emoji: '🕌', label: 'Istanbul', sublabel: 'Historic city of two continents', value: 'Istanbul' },
  { emoji: '🌴', label: 'Dubai', sublabel: 'City of modern wonders', value: 'Dubai' },
  { emoji: '🏰', label: 'Marrakech', sublabel: 'For its vibrant medina', value: 'Marrakech' },
  { emoji: '🌊', label: 'Maldives', sublabel: 'Crystal clear waters', value: 'Maldives' },
  { emoji: '🇬🇧', label: 'London', sublabel: 'Vibrant multicultural city', value: 'London' },
  { emoji: '🌿', label: 'Granada', sublabel: 'Home of the Alhambra', value: 'Granada' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function CalendarMonth({ year, month, checkin, checkout, onSelectDay }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return (
    <div className="cal-month">
      <div className="cal-month-title">{MONTHS[month]} {year}</div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((dt, i) => {
          if (!dt) return <div key={'e'+i} />;
          const isPast = dt < today;
          const isCI = checkin && dt.toDateString() === checkin.toDateString();
          const isCO = checkout && dt.toDateString() === checkout.toDateString();
          const inRange = checkin && checkout && dt > checkin && dt < checkout;
          let cls = 'cal-day';
          if (isPast) cls += ' disabled';
          if (isCI || isCO) cls += ' selected';
          if (inRange) cls += ' in-range';
          return <div key={i} className={cls} onClick={() => !isPast && onSelectDay(dt)}>{dt.getDate()}</div>;
        })}
      </div>
    </div>
  );
}

export default function SearchBar({ search }) {
  const { dest, setDest, checkin, setCheckin, checkout, setCheckout, guests, adjustGuest, guestLabel, runSearch } = search;

  const [open, setOpen] = useState(null);
  const [calOffset, setCalOffset] = useState(0);
  const [destInput, setDestInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const acRef = useRef(null);

  const fmt = d => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null;

  // Load Google Maps
  useEffect(() => {
    if (window.google) return;
    if (document.querySelector('script[data-gmaps]')) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.dataset.gmaps = true;
    document.head.appendChild(script);
  }, []);

  // Init autocomplete
  useEffect(() => {
    if (open !== 'dest' || !window.google) return;
    if (!acRef.current) acRef.current = new window.google.maps.places.AutocompleteService();
  }, [open]);

  // Get suggestions
  useEffect(() => {
    if (!destInput || !acRef.current) { setSuggestions([]); return; }
    acRef.current.getPlacePredictions({ input: destInput, types: ['(cities)'] }, (results, status) => {
      if (status === window.google?.maps.places.PlacesServiceStatus.OK) {
        setSuggestions(results.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    });
  }, [destInput]);

  // Update dropdown position only when open changes
  useEffect(() => {
    if (!open || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      const portal = document.getElementById('sb-portal');
      if (wrapRef.current && !wrapRef.current.contains(e.target) && !portal?.contains(e.target)) {
        setOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = useCallback(panel => {
    setOpen(o => o === panel ? null : panel);
    if (panel === 'dest') setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const selectDest = useCallback((value, label) => {
    setDest(value);
    setDestInput(label || value);
    setSuggestions([]);
    setOpen('cal');
  }, [setDest]);

  const handleDestInput = useCallback(e => {
    setDestInput(e.target.value);
  }, []);

  const handleDayClick = useCallback(dt => {
    if (!checkin || (checkin && checkout) || dt <= checkin) {
      setCheckin(dt); setCheckout(null);
    } else {
      setCheckout(dt);
      setTimeout(() => setOpen('guests'), 300);
    }
  }, [checkin, checkout, setCheckin, setCheckout]);

  const clearDest = useCallback(() => {
    setDestInput(''); setDest(''); setSuggestions([]);
    inputRef.current?.focus();
  }, [setDest]);

  const now = new Date();
  const calBase = useMemo(() => [0, 1].map(i => {
    const d = new Date(now.getFullYear(), now.getMonth() + calOffset + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }), [calOffset]); // eslint-disable-line

  const isMobile = window.innerWidth <= 768;

  const dropdownStyle = isMobile ? {} : {
    position: 'fixed',
    top: dropdownPos.top,
    left: dropdownPos.left,
    zIndex: 9999,
  };

  return (
    <div className="sb-outer" ref={wrapRef}>
      <div className="sb-wrap">
        <div className={`sb-field ${open === 'dest' ? 'active' : ''}`} onClick={() => toggle('dest')}>
          <div className="sb-label">Where</div>
          <div className={`sb-value ${dest ? '' : 'ph'}`}>{dest || 'Search destinations'}</div>
        </div>
        <div className={`sb-field ${open === 'cal' ? 'active' : ''}`} onClick={() => toggle('cal')}>
          <div className="sb-label">When</div>
          <div className={`sb-value ${checkin ? '' : 'ph'}`}>
            {checkin && checkout ? `${fmt(checkin)} – ${fmt(checkout)}` : checkin ? fmt(checkin) : 'Add dates'}
          </div>
        </div>
        <div className={`sb-field sb-field--no-border ${open === 'guests' ? 'active' : ''}`} onClick={() => toggle('guests')}>
          <div className="sb-label">Guests</div>
          <div className={`sb-value ${guests.adults + guests.children > 0 ? '' : 'ph'}`}>{guestLabel}</div>
        </div>
        <button className="sb-search-btn" onClick={runSearch}>🔍</button>
      </div>

      {open && createPortal(
        <div id="sb-portal">
      {/* Mobile close button */}
      <div className="sb-mobile-close" onClick={() => setOpen(null)}>
        <span>✕</span>
      </div>
          {open === 'dest' && (
            <div className="sb-dropdown sb-dropdown--dest" style={dropdownStyle}>
              <div className="sb-dest-input-wrap">
                <span className="sb-dest-icon">🔍</span>
                <input
                  ref={inputRef}
                  className="sb-dest-input"
                  placeholder="Search destinations"
                  value={destInput}
                  onChange={handleDestInput}
                  onKeyDown={e => { if (e.key === 'Enter' && destInput) { setDest(destInput); setOpen(null); setTimeout(runSearch, 50); } }}
                  autoFocus
                />
                {destInput && <button className="sb-dest-clear" onClick={clearDest}>✕</button>}
              </div>
              <div className="sb-dest-list">
                {destInput && suggestions.length > 0 ? (
                  <>
                    <div className="sb-dest-section-label">Suggestions</div>
                    {suggestions.map(s => (
                      <button key={s.place_id} className="sb-dest-item"
                        onClick={() => selectDest(s.structured_formatting.main_text, s.structured_formatting.main_text)}>
                        <div className="sb-dest-item-icon">📍</div>
                        <div className="sb-dest-item-text">
                          <div className="sb-dest-item-main">{s.structured_formatting.main_text}</div>
                          <div className="sb-dest-item-sub">{s.structured_formatting.secondary_text}</div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="sb-dest-section-label">Suggested destinations</div>
                    {SUGGESTED.map(d => (
                      <button key={d.value} className="sb-dest-item" onClick={() => selectDest(d.value, d.label)}>
                        <div className="sb-dest-item-icon sb-dest-item-icon--emoji">{d.emoji}</div>
                        <div className="sb-dest-item-text">
                          <div className="sb-dest-item-main">{d.label}</div>
                          <div className="sb-dest-item-sub">{d.sublabel}</div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {open === 'cal' && (
            <div className="sb-dropdown sb-dropdown--cal" style={dropdownStyle}>
              <div className="sb-cal-nav">
                <button className="sb-cal-nav-btn" onClick={() => setCalOffset(o => Math.max(0, o-1))} disabled={calOffset === 0}>←</button>
                <span className="sb-cal-nav-label">{MONTHS[calBase[0].month]} {calBase[0].year} – {MONTHS[calBase[1].month]} {calBase[1].year}</span>
                <button className="sb-cal-nav-btn" onClick={() => setCalOffset(o => Math.min(10, o+1))}>→</button>
              </div>
              <div className="cal-months">
                {calBase.map(({ year, month }) => (
                  <CalendarMonth key={`${year}-${month}`} year={year} month={month}
                    checkin={checkin} checkout={checkout} onSelectDay={handleDayClick} />
                ))}
              </div>
            </div>
          )}

          {open === 'guests' && (
            <div className="sb-dropdown sb-dropdown--guests" style={dropdownStyle}>
              <div className="sb-dd-label">Who's coming?</div>
              {[
                { key: 'adults', label: 'Adults', sub: 'Ages 13+' },
                { key: 'children', label: 'Children', sub: 'Ages 2–12' },
                { key: 'infants', label: 'Infants', sub: 'Under 2' },
              ].map(({ key, label, sub }) => (
                <div className="guest-row" key={key}>
                  <div>
                    <div className="guest-type">{label}</div>
                    <div className="guest-sub">{sub}</div>
                  </div>
                  <div className="guest-counter">
                    <button className="counter-btn" disabled={guests[key] === 0} onClick={() => adjustGuest(key, -1)}>−</button>
                    <span className="counter-val">{guests[key]}</span>
                    <button className="counter-btn" onClick={() => adjustGuest(key, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
