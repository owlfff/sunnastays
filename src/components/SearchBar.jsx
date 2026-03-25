import React, { useState, useRef, useEffect, useCallback } from 'react';
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
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

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
          if (!dt) return <div key={`e${i}`} />;
          const isPast = dt < today;
          const isCI   = checkin  && dt.toDateString() === checkin.toDateString();
          const isCO   = checkout && dt.toDateString() === checkout.toDateString();
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
  const {
    dest, setDest, checkin, setCheckin, checkout, setCheckout,
    guests, adjustGuest, guestLabel, runSearch,
  } = search;

  const [open, setOpen]           = useState(null);
  const [destInput, setDestInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingGmaps, setLoadingGmaps] = useState(false);
  const wrapRef     = useRef(null);
  const inputRef    = useRef(null);
  const acRef       = useRef(null);

  const fmt = d => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null;

  // Load Google Maps if not already loaded
  useEffect(() => {
    if (window.google) return;
    if (document.querySelector('script[data-gmaps]')) return;
    setLoadingGmaps(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.dataset.gmaps = true;
    script.onload = () => setLoadingGmaps(false);
    document.head.appendChild(script);
  }, []);

  // Init autocomplete service when dropdown opens
  useEffect(() => {
    if (open !== 'dest' || !window.google) return;
    if (!acRef.current) {
      acRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [open]);

  // Get predictions as user types
  useEffect(() => {
    if (!destInput || !acRef.current) { setSuggestions([]); return; }
    acRef.current.getPlacePredictions(
      { input: destInput, types: ['(cities)'] },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(results.slice(0, 5));
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [destInput]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null);
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
    const val = e.target.value;
    setDestInput(val);
    setDest(val);
  }, [setDest]);

  const handleDayClick = useCallback(dt => {
    if (!checkin || (checkin && checkout) || dt <= checkin) {
      setCheckin(dt); setCheckout(null);
    } else {
      setCheckout(dt);
      setTimeout(() => setOpen('guests'), 300);
    }
  }, [checkin, checkout, setCheckin, setCheckout]);

  const now = new Date();
  const calBase = [
    { year: now.getFullYear(), month: now.getMonth() },
    { year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), month: (now.getMonth() + 1) % 12 },
  ];

  const clearDest = () => { setDestInput(''); setDest(''); setSuggestions([]); inputRef.current?.focus(); };

  return (
    <div className="sb-outer" ref={wrapRef}>
      <div className="sb-wrap">
        <div className={`sb-field ${open === 'dest' ? 'active' : ''}`} onClick={() => toggle('dest')}>
          <div className="sb-label">Where</div>
          <div className={`sb-value ${dest ? '' : 'ph'}`}>{dest || 'Search destinations'}</div>
        </div>
        <div className={`sb-field ${open === 'cal' ? 'active' : ''}`} onClick={() => toggle('cal')}>
          <div className="sb-label">Check-in</div>
          <div className={`sb-value ${checkin ? '' : 'ph'}`}>{fmt(checkin) || 'Add dates'}</div>
        </div>
        <div className={`sb-field sb-field--no-border ${open === 'cal' ? 'active' : ''}`} onClick={() => toggle('cal')}>
          <div className="sb-label">Check-out</div>
          <div className={`sb-value ${checkout ? '' : 'ph'}`}>{fmt(checkout) || 'Add dates'}</div>
        </div>
        <div className={`sb-field sb-field--no-border ${open === 'guests' ? 'active' : ''}`} onClick={() => toggle('guests')}>
          <div className="sb-label">Guests</div>
          <div className={`sb-value ${guests.adults + guests.children > 0 ? '' : 'ph'}`}>{guestLabel}</div>
        </div>
        <button className="sb-search-btn" onClick={runSearch}>🔍</button>
      </div>

      {/* DEST DROPDOWN */}
      {open === 'dest' && (
        <div className="sb-dropdown sb-dropdown--dest">
          <div className="sb-dest-input-wrap">
            <span className="sb-dest-icon">🔍</span>
            <input
              ref={inputRef}
              className="sb-dest-input"
              placeholder="Search destinations"
              value={destInput}
              onChange={handleDestInput}
              onKeyDown={e => { if (e.key === 'Enter' && dest) { setOpen(null); runSearch(); } }}
              autoFocus
            />
            {destInput && (
              <button className="sb-dest-clear" onClick={clearDest}>✕</button>
            )}
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
            ) : destInput && suggestions.length === 0 && !loadingGmaps ? (
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

      {/* CALENDAR DROPDOWN */}
      {open === 'cal' && (
        <div className="sb-dropdown sb-dropdown--cal">
          <div className="sb-dd-label">Select your dates</div>
          <div className="cal-months">
            {calBase.map(({ year, month }) => (
              <CalendarMonth key={`${year}-${month}`} year={year} month={month}
                checkin={checkin} checkout={checkout} onSelectDay={handleDayClick} />
            ))}
          </div>
        </div>
      )}

      {/* GUESTS DROPDOWN */}
      {open === 'guests' && (
        <div className="sb-dropdown sb-dropdown--guests">
          <div className="sb-dd-label">Who's coming?</div>
          {[
            { key: 'adults',   label: 'Adults',   sub: 'Ages 13+' },
            { key: 'children', label: 'Children', sub: 'Ages 2–12' },
            { key: 'infants',  label: 'Infants',  sub: 'Under 2' },
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
    </div>
  );
}
