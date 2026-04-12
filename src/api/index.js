import { supabase } from '../supabase';

const MOCK_LISTING = {
  id:'1', slug:'ottoman-terrace-suite',
  name:'Ottoman Terrace Suite', emoji:'🕌',
  location:'Sultanahmet, Istanbul', country:'Turkey',
  price:180, rating:4.97, reviewCount:124,
  gradient:'linear-gradient(135deg, #D4C4A0, #E8A87C)',
  halalCertified:true,
  description: 'A beautifully restored Ottoman-era apartment above the rooftops of Sultanahmet, with sweeping views across to the Blue Mosque and Hagia Sophia.',
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
    photos:         p.photos || [],
    lat:            p.lat,
    lng:            p.lng,
    address:        p.address,
    instantBooking: p.instant_booking,
    cancellationPolicy: p.cancellation_policy || 'moderate',
  };
}

export async function searchStays(params = {}) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'approved');

  if (params.destination && params.destination.trim() !== '') {
    query = query.or(
      `city.ilike.%${params.destination}%,country.ilike.%${params.destination}%,name.ilike.%${params.destination}%`
    );
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('Search error:', error); return []; }
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
    images: data.photos?.length > 0 ? data.photos : ['🕌', '🌅', '🛏️'],
  };
}

export async function submitListing(payload) {
  const photoUrls = payload.photos.map(p => p.url);
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
      address:     payload.address || null,
      instant_booking: payload.instantBooking || false,
      cancellation_policy: payload.cancellationPolicy || 'moderate',
      host_id: payload.hostId || null,
      lat:         payload.lat || null,
      lng:         payload.lng || null,
      photos:      photoUrls,
      house_rules: {
        ...payload.houseRules,
        custom: payload.customRules || '',
      },
    }]);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function checkExistingBooking(propertyId, checkin, checkout) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, status, checkin, checkout')
    .eq('property_id', propertyId)
    .not('status', 'eq', 'rejected')
    .or(`and(checkin.lte.${checkout},checkout.gte.${checkin})`);

  if (error) return false;
  return data && data.length > 0;
}

export async function createBooking(payload) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      property_id:  payload.propertyId,
      guest_id:     payload.guestId,
      checkin:      payload.checkin,
      checkout:     payload.checkout,
      guests:       payload.guests,
      total_price:  payload.totalPrice,
      status:       payload.instantBooking ? 'confirmed' : 'pending',
      message:      payload.message || '',
      guest_name:   payload.guestName,
      guest_email:  payload.guestEmail,
      guest_phone:  payload.guestPhone,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getBookingsForProperty(propertyId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getBookingsForGuest(guestId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties(name, city, country, photos)')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateBookingStatus(bookingId, status) {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getReviewsForProperty(propertyId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
