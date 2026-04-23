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

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Guest payment confirmed — create the booking record
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata;

    const { error } = await supabase.from('bookings').insert([{
      property_id:              parseInt(meta.propertyId),
      guest_id:                 meta.guestId || null,
      checkin:                  meta.checkin,
      checkout:                 meta.checkout,
      guests:                   parseInt(meta.guests),
      total_price:              parseFloat(meta.totalPrice),
      status:                   meta.instantBooking === 'true' ? 'confirmed' : 'pending',
      guest_name:               meta.guestName,
      guest_email:              meta.guestEmail,
      guest_phone:              meta.guestPhone,
      message:                  meta.message,
      cancellation_policy:      meta.cancellationPolicy || 'moderate',
      stripe_session_id:        session.id,
      stripe_payment_intent_id: session.payment_intent,
      payout_transferred:       false,
    }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save booking' });
    }

    // Send booking email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://sunnastays.com'}/api/send-booking-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'host',
          booking: {
            guestName:          meta.guestName,
            guestEmail:         meta.guestEmail,
            guestPhone:         meta.guestPhone,
            checkin:            meta.checkin,
            checkout:           meta.checkout,
            guests:             meta.guests,
            totalPrice:         meta.totalPrice,
            instantBooking:     meta.instantBooking === 'true',
            message:            meta.message,
          },
          property: { name: meta.propertyName || 'Property' },
        }),
      });
    } catch (e) {
      console.error('Email error:', e);
    }
  }

  // Host completed Stripe Connect onboarding — mark their account as active
  if (event.type === 'account.updated') {
    const account = event.data.object;
    if (account.charges_enabled && account.payouts_enabled) {
      await supabase
        .from('profiles')
        .update({ stripe_account_status: 'active' })
        .eq('stripe_account_id', account.id);
    }
  }

  return res.status(200).json({ received: true });
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}
