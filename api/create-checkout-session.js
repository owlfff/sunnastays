const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { booking, property, successUrl, cancelUrl } = req.body;

  try {
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
            unit_amount: Math.round(booking.totalPrice * 100), // Stripe uses pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId:   String(booking.propertyId),
        guestName:    booking.guestName,
        guestEmail:   booking.guestEmail,
        guestPhone:   booking.guestPhone,
        checkin:      booking.checkin,
        checkout:     booking.checkout,
        guests:       String(booking.guests),
        totalPrice:   String(booking.totalPrice),
        instantBooking: String(booking.instantBooking),
        message:      booking.message || '',
        propertyName: property.name || '',
        propertyLocation: property.location || '',
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
