const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Host receives 97% of the base nightly total (excluding the 10% service fee)
// total_price = base * 1.1, so base = total_price / 1.1
// host_receives = base * 0.97
function calcHostPayout(totalPrice) {
  const base = totalPrice / 1.1;
  return Math.round(base * 0.97 * 100); // return in pence
}

export default async function handler(req, res) {
  // Allow Vercel cron (GET) or manual trigger (POST)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Find confirmed bookings that have checked out and haven't been paid out yet
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, properties(host_id)')
      .eq('status', 'confirmed')
      .eq('payout_transferred', false)
      .lte('checkout', yesterdayStr);

    if (error) throw error;
    if (!bookings?.length) {
      return res.status(200).json({ message: 'No payouts due', processed: 0 });
    }

    const results = [];

    for (const booking of bookings) {
      try {
        const hostId = booking.properties?.host_id;
        if (!hostId) {
          results.push({ bookingId: booking.id, status: 'skipped', reason: 'No host_id' });
          continue;
        }

        // Get host's Stripe account
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_account_id, stripe_account_status')
          .eq('user_id', hostId)
          .single();

        if (!profile?.stripe_account_id || profile.stripe_account_status !== 'active') {
          results.push({ bookingId: booking.id, status: 'skipped', reason: 'Host Stripe account not active' });
          continue;
        }

        if (!booking.stripe_payment_intent_id) {
          results.push({ bookingId: booking.id, status: 'skipped', reason: 'No payment intent ID' });
          continue;
        }

        const payoutAmountPence = calcHostPayout(booking.total_price);

        // Create transfer to host
        const transfer = await stripe.transfers.create({
          amount: payoutAmountPence,
          currency: 'gbp',
          destination: profile.stripe_account_id,
          transfer_group: `booking_${booking.id}`,
          metadata: {
            bookingId: String(booking.id),
            guestName: booking.guest_name,
            checkin: booking.checkin,
            checkout: booking.checkout,
          },
        });

        // Mark as transferred
        await supabase
          .from('bookings')
          .update({ payout_transferred: true, stripe_transfer_id: transfer.id })
          .eq('id', booking.id);

        results.push({ bookingId: booking.id, status: 'paid', transferId: transfer.id, amount: payoutAmountPence / 100 });
      } catch (bookingErr) {
        console.error(`Payout error for booking ${booking.id}:`, bookingErr);
        results.push({ bookingId: booking.id, status: 'error', reason: bookingErr.message });
      }
    }

    console.log('Payout cron results:', results);
    return res.status(200).json({ processed: bookings.length, results });
  } catch (err) {
    console.error('Release payouts cron error:', err);
    return res.status(500).json({ error: err.message });
  }
}
