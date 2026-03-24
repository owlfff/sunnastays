import { supabase } from '../supabase';

const MOCK_LISTING = {
  id:'1', slug:'ottoman-terrace-suite',
  name:'Ottoman Terrace Suite', emoji:'🕌',
  location:'Sultanahmet, Istanbul', country:'Turkey',
  price:180, rating:4.97, reviewCount:124,
  gradient:'linear-gradient(135deg, #D4C4A0, #E8A87C)',
  halalCertified:true,
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

const GRADIENTS = [
  'linear-gradient(135deg, #D4C4A0, #E8A87C)',
  'linear-gradient(135deg, #c8b89a, #b87045)',
  'linear-gradient(135deg, #a8c4b8, #4a7c59)',
  'linear-gradient(135deg, #d4bfa0, #8B6914)',
  'linear-gradient(135deg, #b8d4c8, #4a7c59)',
  'linear-gradient(135deg, #d4c0a0, #8B6040)',
];

const EMOJIS = ['🕌','🌴','🏰','🌊','🌿','🏡','🏖️','🏔️'];

function formatProperty(p, index) {
  return {
    id:             p.id,
    slug:           p.id,
    name:           p.name,
    emoji:          EMOJIS[index % EMOJIS.length],
    location:       `${p.city}, ${p.country}`,
    country:        p.country,
    price:          p.price,
    rating:         4.9,
    reviewCount:    0,
    gradient:       GRADIENTS[index % GRADIENTS.length],
    halalCertified: true,
    description:    p.description,
    bedrooms:       p.bedrooms,
    maxGuests:      p.max_guests,
    type:           p.type,
  };
}

export async function searchStays(params = {}) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'approved');

  if (params.destination) {
    query = query.or(
      `city.ilike.%${params.destination}%,country.ilike.%${params.destination}%,name.ilike.%${params.destination}%`
    );
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Search error:', error);
    return [];
  }

  return data.map((p, i) => formatProperty(p, i));
}

export async function getStay(slug) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', slug)
    .single();

  if (error || !data) return MOCK_LISTING;

  return {
    ...formatProperty(data, 0),
    host: { name:'Host', since: new Date(data.created_at).getFullYear(), languages:['English'], isSuperhost:false, emoji:'👤' },
    amenities: [
      { icon:'📶', label:'Fast wifi' },
      { icon:'❄️', label:'Air conditioning' },
      { icon:'🍳', label:'Full kitchen' },
    ],
    halalStandards: [
      'Alcohol-free — no alcohol stored or served',
      'Halal kitchen — certified utensils and appliances',
      'No non-halal meat permitted',
      'Pet-free — professionally cleaned and certified',
    ],
    images: ['🕌', '🌅', '🛏️'],
  };
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
