import { useEffect } from 'react';

const SITE = 'SunnaStays';
const DEFAULT_DESC = 'Halal-certified short stays for the modern Muslim traveller. Alcohol-free, halal-kitchen properties verified by SunnaStays.';

export function useMeta(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} – Halal-Certified Short Stays`;
    const desc = description || DEFAULT_DESC;

    document.title = fullTitle;

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
  }, [title, description]);
}

function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
