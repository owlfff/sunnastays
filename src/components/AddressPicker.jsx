import React, { useEffect, useRef, useState } from 'react';
import './AddressPicker.css';

export default function AddressPicker({ value, onChange }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.google) { setLoaded(true); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current || !mapRef.current) return;

    // Init map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 51.5074, lng: -0.1278 },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // Init marker
    const marker = new window.google.maps.Marker({
      map,
      draggable: true,
      position: { lat: 51.5074, lng: -0.1278 },
    });
    markerRef.current = marker;

    // Update when marker dragged
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      onChange({ ...value, lat: pos.lat(), lng: pos.lng() });
    });

    // Autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address;

      // Extract city and country from address components
      let city = '';
      let country = '';
      if (place.address_components) {
        place.address_components.forEach(component => {
          if (component.types.includes('postal_town') || component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        });
      }

      map.setCenter({ lat, lng });
      map.setZoom(16);
      marker.setPosition({ lat, lng });
      onChange({ address, lat, lng, city, country });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <div className="address-picker">
      <div className="form-group">
        <label className="form-label">Full property address</label>
        <input
          ref={inputRef}
          className="form-input"
          type="text"
          placeholder="Start typing your address…"
          defaultValue={value?.address || ''}
        />
        <p className="address-note">Only the city will be shown to guests. The full address is shared after booking.</p>
      </div>
      <div ref={mapRef} className="address-map" />
      {value?.lat && (
        <div className="address-confirmed">
          📍 Pin confirmed — drag it on the map to adjust if needed
        </div>
      )}
    </div>
  );
}
