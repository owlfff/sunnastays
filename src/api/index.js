/**
 * SunnaStays API Layer
 * ─────────────────────────────────────────────────────────────
 * All data fetching lives here. Swap the mock implementations
 * for real fetch() calls when your backend is ready.
 *
 * Base URL is read from REACT_APP_API_URL env variable.
 * If not set, falls back to mock data.
 * ─────────────────────────────────────────────────────────────
 */

const API_BASE = process.env.REACT_APP_API_URL || null;

// ── Helpers ──────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  if (!API_BASE) throw new Error('No API_BASE configured');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Mock Data ─────────────────────────────────────────────────

const MOCK_STAYS = [
  {
    id: '1', slug: 'ottoman-terrace-suite',
    name: 'Ottoman Terrace Suite', emoji: '🕌',
    location: 'Sultanahmet, Istanbul', country: 'Turkey',
    price: 180, rating: 4.97, reviewCount: 124,
    gradient: 'linear-gradient(135deg, #D4C4A0, #E8A87C)',
    tags: ['City view', 'Halal kitchen', 'Prayer room'],
    halalCertified: true,
  },
  {
    id: '2', slug: 'bosphorus-waterfront-villa',
    name: 'Bosphorus Waterfront Villa', emoji: '🌊',
    location: 'Bebek, Istanbul', country: 'Turkey',
    price: 340, rating: 4.89, reviewCount: 87,
    gradient: 'linear-gradient(135deg, #c8b89a, #b87045)',
    tags: ['Waterfront', 'Private pool', 'Halal kitchen'],
    halalCertified: true,
  },
  {
    id: '3', slug: 'marina-view-penthouse',
    name: 'Marina View Penthouse', emoji: '🌴',
    location: 'Dubai Marina, UAE', country: 'UAE',
    price: 290, rating: 5.0, reviewCount: 43,
    gradient: 'linear-gradient(135deg, #a8c4b8, #4a7c59)',
    tags: ['Marina view', 'Gym access', 'Concierge'],
    halalCertified: true,
  },
  {
    id: '4', slug: 'riad-al-noor',
    name: 'Riad al-Noor', emoji: '🏰',
    location: 'Medina, Marrakech', country: 'Morocco',
    price: 95, rating: 4.95, reviewCount: 211,
    gradient: 'linear-gradient(135deg, #d4bfa0, #8B6914)',
    tags: ['Courtyard', 'Rooftop terrace', 'Traditional'],
    halalCertified: true,
  },
  {
    id: '5', slug: 'andalusian-garden-house',
    name: 'Andalusian Garden House', emoji: '🌿',
    location: 'Granada, Spain', country: 'Spain',
    price: 130, rating: 4.93, reviewCount: 67,
    gradient: 'linear-gradient(135deg, #b8d4c8, #4a7c59)',
    tags: ['Garden', 'Alhambra views', 'Historic'],
    halalCertified: true,
  },
  {
    id: '6', slug: 'medina-heritage-apartment',
    name: 'Medina Heritage Apartment', emoji: '🏡',
    location: 'Fez, Morocco', country: 'Morocco',
    price: 75, rating: 4.88, reviewCount: 134,
    gradient: 'linear-gradient(135deg, #d4c0a0, #8B6040)',
    tags: ['Medina walk', 'Authentic', 'Quiet'],
    halalCertified: true,
  },
];

const MOCK_LISTING = {
  ...MOCK_STAYS[0],
  description: `A beautifully restored Ottoman-era apartment above the rooftops of Sultanahmet, with sweeping views across to the Blue Mosque and Hagia Sophia. Fully halal-certified — no alcohol on premises, halal kitchen, and a prayer room with Qibla compass.`,
  host: { name: 'Mehmet Yilmaz', since: 2021, languages: ['English', 'Turkish', 'Arabic'], isSuperhost: true, emoji: '👨' },
  amenities: [
    { icon: '🌅', label: 'Bosphorus view' },
    { icon: '📶', label: 'Fast wifi' },
    { icon: '❄️', label: 'Air conditioning' },
    { icon: '🍳', label: 'Full kitchen' },
    { icon: '🧺', label: 'Washer & dryer' },
    { icon: '🅿️', label: 'Free parking' },
  ],
  halalStandards: [
    'Alcohol-free — no alcohol stored or served',
    'Halal kitchen — certified utensils and appliances',
    'No non-halal meat permitted',
    'Pet-free — professionally cleaned and certified',
    'Prayer room with Qibla compass and prayer mat',
    'Nearest mosque: Sultanahmet Mosque — 3 min walk',
  ],
  images: ['🕌', '🌅', '🛏️'],
};

// ── Stays API ─────────────────────────────────────────────────

/**
 * Search stays.
 * @param {{ destination?: string, checkin?: string, checkout?: string, guests?: number }} params
 * @returns {Promise<Array>}
 */
export async function searchStays(params = {}) {
  if (API_BASE) {
    return apiFetch(`/stays?${new URLSearchParams(params)}`);
  }
  // Mock: simple destination filter
  const { destination } = params;
  if (!destination) return MOCK_STAYS;
  const q = destination.toLowerCase();
  return MOCK_STAYS.filter(
    s => s.location.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
  );
}

/**
 * Get a single stay by slug.
 * @param {string} slug
 * @returns {Promise<Object>}
 */
export async function getStay(slug) {
  if (API_BASE) return apiFetch(`/stays/${slug}`);
  return MOCK_LISTING;
}

// ── Host Onboarding API ───────────────────────────────────────

/**
 * Submit a new host listing for review.
 * @param {Object} payload  Full form data from the 5-step onboarding
 * @returns {Promise<{ success: boolean, listingId: string }>}
 */
export async function submitListing(payload) {
  if (API_BASE) {
    return apiFetch('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  // Mock: simulate a 1s network delay then return success
  await new Promise(r => setTimeout(r, 1000));
  return { success: true, listingId: `mock-${Date.now()}` };
}

// ── User API ──────────────────────────────────────────────────

/**
 * Get the current authenticated user.
 * Returns null if not signed in.
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  if (API_BASE) {
    try { return await apiFetch('/me'); }
    catch { return null; }
  }
  return null; // Not authenticated in mock mode
}
