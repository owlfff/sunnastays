const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Only allow cron or manual trigger
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  // Find confirmed bookings that checked out yesterday and haven't been sent a review email
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, properties(name, city, country)')
    .eq('status', 'confirmed')
    .eq('checkout', dateStr)
    .is('review_token', null);

  if (!bookings || bookings.length === 0) {
    return res.status(200).json({ message: 'No bookings to review', count: 0 });
  }

  let sent = 0;
  for (const booking of bookings) {
    const token = crypto.randomBytes(32).toString('hex');

    // Save token to booking
    await supabase.from('bookings').update({ review_token: token }).eq('id', booking.id);

    // Send email
    try {
      await fetch('https://www.sunnastays.com/api/send-review-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            guestEmail: booking.guest_email,
            guestName:  booking.guest_name,
            reviewToken: token,
          },
          property: {
            name:     booking.properties?.name,
            location: `${booking.properties?.city}, ${booking.properties?.country}`,
          },
        }),
      });
      sent++;
    } catch (e) {
      console.error('Failed to send review email for booking', booking.id, e);
    }
  }

  return res.status(200).json({ message: `Sent ${sent} review emails`, count: sent });
}
