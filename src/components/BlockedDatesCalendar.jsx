import React, { useState, useEffect } from 'react';
import { getBlockedRanges, addBlockedRange, deleteBlockedRange } from '../api';
import './BlockedDatesCalendar.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const toStr = d => d.toISOString().split('T')[0];
const fmtRange = (s, e) => {
  const sd = new Date(s), ed = new Date(e);
  return `${sd.getDate()} ${MONTHS_SHORT[sd.getMonth()]} – ${ed.getDate()} ${MONTHS_SHORT[ed.getMonth()]} ${ed.getFullYear()}`;
};

function isInRange(dt, ranges) {
  return ranges.some(r => dt >= new Date(r.start_date) && dt <= new Date(r.end_date));
}

function findRange(dt, ranges) {
  return ranges.find(r => dt >= new Date(r.start_date) && dt <= new Date(r.end_date));
}

function CalendarMonth({ year, month, blockedRanges, selectionStart, hoverDate, onDayClick, onDayHover }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="bdc-cal-month">
      <div className="bdc-cal-title">{MONTHS[month]} {year}</div>
      <div className="bdc-cal-grid">
        {DAYS.map(d => <div key={d} className="bdc-cal-dow">{d}</div>)}
        {cells.map((dt, i) => {
          if (!dt) return <div key={'e' + i} />;
          const isPast = dt < today;
          const isBlocked = isInRange(dt, blockedRanges);

          // Selection preview
          let isSelStart = selectionStart && dt.toDateString() === selectionStart.toDateString();
          let inSelection = false;
          if (selectionStart && hoverDate && !isPast) {
            const lo = selectionStart < hoverDate ? selectionStart : hoverDate;
            const hi = selectionStart < hoverDate ? hoverDate : selectionStart;
            inSelection = dt >= lo && dt <= hi;
          }

          let cls = 'bdc-cal-day';
          if (isPast) cls += ' past';
          if (isBlocked) cls += ' blocked';
          if (isSelStart) cls += ' sel-start';
          if (inSelection && !isBlocked) cls += ' in-selection';

          return (
            <div
              key={i}
              className={cls}
              onClick={() => !isPast && onDayClick(dt)}
              onMouseEnter={() => !isPast && onDayHover(dt)}
            >
              {dt.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BlockedDatesCalendar({ propertyId, propertyName, onClose }) {
  const [blockedRanges, setBlockedRanges] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const now = new Date();

  useEffect(() => {
    getBlockedRanges(propertyId)
      .then(setBlockedRanges)
      .catch(() => setError('Failed to load blocked dates'));
  }, [propertyId]);

  const handleDayClick = async (dt) => {
    setError(null);

    // If clicking inside an existing blocked range — delete it
    const existing = findRange(dt, blockedRanges);
    if (existing) {
      try {
        await deleteBlockedRange(existing.id);
        setBlockedRanges(prev => prev.filter(r => r.id !== existing.id));
        setSelectionStart(null);
      } catch {
        setError('Failed to remove blocked range');
      }
      return;
    }

    if (!selectionStart) {
      setSelectionStart(dt);
      return;
    }

    // Second click — save range
    const start = selectionStart < dt ? selectionStart : dt;
    const end   = selectionStart < dt ? dt : selectionStart;

    // Overlap check against existing blocked ranges
    const overlaps = blockedRanges.some(r =>
      start <= new Date(r.end_date) && end >= new Date(r.start_date)
    );
    if (overlaps) {
      setError('Selected range overlaps an existing blocked period. Click a blocked date to remove it first.');
      setSelectionStart(null);
      return;
    }

    setSaving(true);
    try {
      const saved = await addBlockedRange(propertyId, toStr(start), toStr(end));
      setBlockedRanges(prev => [...prev, saved].sort((a, b) => a.start_date.localeCompare(b.start_date)));
      setSelectionStart(null);
    } catch {
      setError('Failed to save blocked range');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlockedRange(id);
      setBlockedRanges(prev => prev.filter(r => r.id !== id));
    } catch {
      setError('Failed to remove blocked range');
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Filter to future blocked ranges for the list
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const futureRanges = blockedRanges.filter(r => new Date(r.end_date) >= today);

  return (
    <div className="bdc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bdc-modal">
        <div className="bdc-header">
          <div>
            <div className="bdc-title">Manage availability</div>
            <div className="bdc-sub">{propertyName}</div>
          </div>
          <button className="bdc-close" onClick={onClose}>✕</button>
        </div>

        <div className="bdc-instructions">
          {selectionStart
            ? `Check-in selected: ${selectionStart.getDate()} ${MONTHS_SHORT[selectionStart.getMonth()]} — now click the last date to block`
            : 'Click a date to start blocking a range. Click a blocked date (red) to remove it.'}
        </div>

        {error && <div className="bdc-error">{error}</div>}

        <div className="bdc-calendar-scroll" onMouseLeave={() => setHoverDate(null)}>
          {months.map(({ year, month }) => (
            <CalendarMonth
              key={`${year}-${month}`}
              year={year}
              month={month}
              blockedRanges={blockedRanges}
              selectionStart={selectionStart}
              hoverDate={hoverDate}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
            />
          ))}
        </div>

        {saving && <div className="bdc-saving">Saving…</div>}

        {futureRanges.length > 0 && (
          <div className="bdc-ranges-section">
            <div className="bdc-ranges-title">Blocked periods</div>
            <div className="bdc-ranges-list">
              {futureRanges.map(r => (
                <div key={r.id} className="bdc-range-pill">
                  <span>{fmtRange(r.start_date, r.end_date)}</span>
                  <button className="bdc-range-delete" onClick={() => handleDelete(r.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
