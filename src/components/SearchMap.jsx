import React, { useEffect, useRef, useState } from 'react';
import './SearchMap.css';

export default function SearchMap({ stays, onHover }) {

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [loaded, setLoaded] = useState(!!window.google);

  useEffect(() => {
    if (window.google) { setLoaded(true); return; }
    if (document.querySelector('script[data-gmaps]')) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=places,marker`;
    script.async = true;
    script.dataset.gmaps = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const staysWithCoords = stays.filter(s => s.lat && s.lng);

    // Default center — London
    let center = { lat: 51.5074, lng: -0.1278 };
    if (staysWithCoords.length > 0) {
      const avgLat = staysWithCoords.reduce((sum, s) => sum + parseFloat(s.lat), 0) / staysWithCoords.length;
      const avgLng = staysWithCoords.reduce((sum, s) => sum + parseFloat(s.lng), 0) / staysWithCoords.length;
      center = { lat: avgLat, lng: avgLng };
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: staysWithCoords.length > 0 ? 12 : 5,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstanceRef.current = map;

    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add markers
    staysWithCoords.forEach(stay => {
      const marker = new window.google.maps.Marker({
        map,
        position: { lat: parseFloat(stay.lat), lng: parseFloat(stay.lng) },
        title: stay.name,
        label: {
          text: `£${stay.price}`,
          color: 'white',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: '700',
          fontSize: '12px',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#C4622D',
          fillOpacity: 1,
          strokeWeight: 0,
        },
      });

      marker.addListener('click', () => {
        const content = `
          <div class="map-info-window">
            <div class="map-info-img" style="background:${stay.gradient}">
              ${stay.photos?.[0]
                ? `<img src="${stay.photos[0]}" alt="${stay.name}" />`
                : `<span>${stay.emoji}</span>`}
            </div>
            <div class="map-info-body">
              <div class="map-info-name">${stay.name}</div>
              <div class="map-info-loc">📍 ${stay.location}</div>
              <div class="map-info-price">£${stay.price} <span>/ night</span></div>
              <a href="/stays/${stay.slug}" class="map-info-btn">View listing →</a>
            </div>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
        if (onHover) onHover(stay.id);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple stays
    if (staysWithCoords.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      staysWithCoords.forEach(s => bounds.extend({ lat: parseFloat(s.lat), lng: parseFloat(s.lng) }));
      map.fitBounds(bounds, { padding: 60 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, stays]);

  // Highlight hovered marker without rebuilding map
  useEffect(() => {
    const staysWithCoords = stays.filter(s => s.lat && s.lng);
    markersRef.current.forEach((marker, i) => {
      const stay = staysWithCoords[i];
      const isHovered = stay.id === onHover || String(stay.id) === String(onHover);
      marker.setIcon({
        path: window.google && window.google.maps.SymbolPath.CIRCLE,
        scale: isHovered ? 24 : 20,
        fillColor: isHovered ? '#1A1208' : '#C4622D',
        fillOpacity: 1,
        strokeWeight: 0,
      });
      marker.setLabel({
        text: `£${stay.price}`,
        color: 'white',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: '700',
        fontSize: isHovered ? '13px' : '12px',
      });
      marker.setZIndex(isHovered ? 10 : 1);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHover]);

  return (
    <div className="search-map-wrap">
      <div ref={mapRef} className="search-map-canvas" />
      {!loaded && (
        <div className="search-map-loading">Loading map…</div>
      )}
    </div>
  );
}
