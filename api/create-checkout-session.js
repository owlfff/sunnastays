const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { booking, property, successUrl, cancelUrl } = req.body;

  try {
    // Look up property for cancellation policy
    const { data: prop } = await supabase
      .from('properties')
      .select('cancellation_policy')
      .eq('id', booking.propertyId)
      .single();

    const cancellationPolicy = prop?.cancellation_policy || booking.cancellationPolicy || 'moderate';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${property.name}`,
              description: `${booking.checkin} – ${booking.checkout} · ${booking.nights} night${booking.nights > 1 ? 's' : ''} · ${booking.guests} guest${booking.guests > 1 ? 's' : ''}`,
              images: property.photo ? [property.photo] : [],
            },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId:         String(booking.propertyId),
        guestName:          booking.guestName,
        guestEmail:         booking.guestEmail,
        guestPhone:         booking.guestPhone,
        checkin:            booking.checkin,
        checkout:           booking.checkout,
        guests:             String(booking.guests),
        totalPrice:         String(booking.totalPrice),
        instantBooking:     String(booking.instantBooking),
        message:            booking.message || '',
        propertyName:       property.name || '',
        propertyLocation:   property.location || '',
        cancellationPolicy: cancellationPolicy,
        guestId:            booking.guestId || '',
      },
      customer_email: booking.guestEmail,
      success_url: successUrl,
      cancel_url:  cancelUrl,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
