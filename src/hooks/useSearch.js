import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSearch() {
  const navigate = useNavigate();
  const [dest, setDest]         = useState('');
  const [checkin, setCheckin]   = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [guests, setGuests]     = useState({ adults: 0, children: 0, infants: 0 });

  const totalGuests = guests.adults + guests.children;

  const adjustGuest = useCallback((type, delta) => {
    setGuests(g => ({ ...g, [type]: Math.max(0, g[type] + delta) }));
  }, []);

  const guestLabel = totalGuests === 0
    ? 'Add guests'
    : `${totalGuests} guest${totalGuests > 1 ? 's' : ''}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : ''}`;

  const fmt = d => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null;

  const dateLabel = (checkin && checkout)
    ? `${fmt(checkin)} – ${fmt(checkout)}`
    : 'Any week';

  const runSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (dest && dest.trim() !== '')    params.set('destination', dest.trim());
    if (checkin)  params.set('checkin',  checkin.toISOString().split('T')[0]);
    if (checkout) params.set('checkout', checkout.toISOString().split('T')[0]);
    if (totalGuests > 0) params.set('guests', totalGuests);
    navigate(`/search?${params.toString()}`);
  }, [dest, checkin, checkout, totalGuests, navigate]);

  return {
    dest, setDest,
    checkin, setCheckin,
    checkout, setCheckout,
    guests, adjustGuest,
    totalGuests, guestLabel, dateLabel,
    runSearch,
  };
}
