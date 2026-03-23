import { supabase } from '../supabase';

const MOCK_STAYS = [
  { id:'1', slug:'ottoman-terrace-suite', name:'Ottoman Terrace Suite', emoji:'🕌', location:'Sultanahmet, Istanbul', country:'Turkey', price:180, rating:4.97, reviewCount:124, gradient:'linear-gradient(135deg, #D4C4A0, #E8A87C)', halalCertified:true },
  { id:'2', slug:'bosphorus-waterfront-villa', name:'Bosphorus Waterfront Villa', emoji:'🌊', location:'Bebek, Istanbul', country:'Turkey', price:340, rating:4.89, reviewCount:87, gradient:'linear-gradient(135deg, #c8b89a, #b87045)', halalCertified:true },
  { id:'3', slug:'marina-view-penthouse', name:'Marina View Penthouse', emoji:'🌴', location:'Dubai Marina, UAE', country:'UAE', price:290, rating:5.0, reviewCount:43, gradient:'linear-gradient(135deg, #a8c4b8, #4a7c59)', halalCertified:true },
  { id:'4', slug:'riad-al-noor', name:'Riad al-Noor', emoji:'🏰', location:'Medina, Marrakech', country:'Morocco', price:95, rating:4.95, reviewCount:211, gradient:'linear-gradient(135deg, #d4bfa0, #8B6914)', halalCertified:true },
  { id:'5', slug:'andalusian-garden-house', name:'Andalusian Garden House', emoji:'🌿', location:'Granada, Spain', country:'Spain', price:130, rating:4.93, reviewCount:67, gradient:'linear-gradient(135deg, #b8d4c8, #4a7c59)', halalCertified:true },
  { id:'6', slug:'medina-heritage-apartment', name:'Medina Heritage Apartment', emoji:'🏡', location:'Fez, Morocco', country:'Morocco', price:75, rating:4.88, reviewCount:134, gradient:'linear-gradient(135deg, #d4c0a0, #8B6040)', halalCertified:true },
];

const MOCK_LISTING = {
  ...MOCK_STAYS[0],
  description: 'A beautifully restored Ottoman-era apartment above the rooftops of Sultanahmet, with sweeping views across to the Blue Mosque and Hagia Sophia. Fully halal-certified — no alcohol on premises, halal kitchen, and a prayer room with Qibla compass.',
  host: { name:'Mehmet Yilmaz', since:2021, languages:['English','Turkish','Arabic'], isSuperhost:true, emoji:'👨' },
  amenities: [
    { icon:'🌅', label:'Bosphorus view' }, { icon:'📶', label:'Fast wifi' },
    { icon:'❄️', label:'Air conditioning' }, { icon:'🍳', label:'Full kitchen' },
    { icon:'🧺', label:'Washer & dryer' }, { icon:'🅿️', label:'Free parking' },
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

export async function searchStays(params = {}) {
  const { destination } = params;
  if (!destination) return MOCK_STAYS;
  const q = destination.toLowerCase();
  return MOCK_STAYS.filter(
    s => s.location.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
  );
}

export async function getStay(slug) {
  return MOCK_LISTING;
}

export async function submitListing(payload) {
  const { error } = await supabase
    .from('properties')
    .insert([{
      name:        payload.name,
      type:        payload.type,
      city:        payload.city,
      country:     payload.country,
      description: payload.description,
      price:       parseFloat(payload.price) || 0,
      bedrooms:    parseInt(payload.bedrooms) || 1,
      max_guests:  parseInt(payload.maxGuests) || 2,
      status:      'pending',
    }]);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
