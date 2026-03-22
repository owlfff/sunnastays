import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SearchBar.css';

const DESTINATIONS = [
  { emoji: '🕌', label: 'Istanbul', value: 'Istanbul, Turkey' },
  { emoji: '🌴', label: 'Dubai',    value: 'Dubai, UAE' },
  { emoji: '🏰', label: 'Marrakech', value: 'Marrakech, Morocco' },
  { emoji: '🏙️', label: 'Kuala Lumpur', value: 'Kuala Lumpur' },
  { emoji: '🌊', label: 'Maldives', value: 'Maldives' },
  { emoji: '🇬🇧', label: 'London',  value: 'London, UK' },
  { emoji: '🌿', label: 'Granada',  value: 'Granada, Spain' },
  { emoji: '🏛️', label: 'Amman',   value: 'Amman, Jordan' },
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
          return (
            <div key={i} className={cls} onClick={() => !isPast && onSelectDay(dt)}>
              {dt.getDate()}
            </div>
          );
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

  const [open, setOpen]       = useState(null); // 'dest' | 'cal' | 'guests'
  const [destInput, setDestInput] = useState('');
  const wrapRef = useRef(null);

  const fmt = d => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null;

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
  }, []);

  const selectDest = useCallback(value => {
    setDest(value);
    setDestInput('');
    setOpen('cal');
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

  const filtered = destInput
    ? DESTINATIONS.filter(d => d.label.toLowerCase().includes(destInput.toLowerCase()))
    : DESTINATIONS;

  return (
    <div className="sb-outer" ref={wrapRef}>
      <div className="sb-wrap">
        {/* WHERE */}
        <div className={`sb-field ${open === 'dest' ? 'active' : ''}`} onClick={() => toggle('dest')}>
          <div className="sb-label">Where</div>
          <div className={`sb-value ${dest ? '' : 'ph'}`}>{dest || 'Search destinations'}</div>
        </div>

        {/* CHECK-IN */}
        <div className={`sb-field ${open === 'cal' ? 'active' : ''}`} onClick={() => toggle('cal')}>
          <div className="sb-label">Check-in</div>
          <div className={`sb-value ${checkin ? '' : 'ph'}`}>{fmt(checkin) || 'Add dates'}</div>
        </div>

        {/* CHECK-OUT */}
        <div className={`sb-field sb-field--no-border ${open === 'cal' ? 'active' : ''}`} onClick={() => toggle('cal')}>
          <div className="sb-label">Check-out</div>
          <div className={`sb-value ${checkout ? '' : 'ph'}`}>{fmt(checkout) || 'Add dates'}</div>
        </div>

        {/* GUESTS */}
        <div className={`sb-field sb-field--no-border ${open === 'guests' ? 'active' : ''}`} onClick={() => toggle('guests')}>
          <div className="sb-label">Guests</div>
          <div className={`sb-value ${guests.adults + guests.children > 0 ? '' : 'ph'}`}>{guestLabel}</div>
        </div>

        <button className="sb-search-btn" onClick={runSearch}>🔍</button>
      </div>

      {/* DEST DROPDOWN */}
      {open === 'dest' && (
        <div className="sb-dropdown sb-dropdown--dest">
          <div className="sb-dd-label">Popular destinations</div>
          <input
            className="dest-input"
            placeholder="Type a city…"
            value={destInput}
            onChange={e => setDestInput(e.target.value)}
            autoFocus
          />
          <div className="dest-grid">
            {filtered.map(d => (
              <button key={d.value} className={`dest-chip ${dest === d.value ? 'selected' : ''}`} onClick={() => selectDest(d.value)}>
                {d.emoji} {d.label}
              </button>
            ))}
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
