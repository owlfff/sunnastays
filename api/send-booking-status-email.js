import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bookingId, status } = req.body;
  if (!bookingId || !status) return res.status(400).json({ error: 'Missing required fields' });

  const RESEND_KEY = process.env.RESEND_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' });

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, properties(name, city, country)')
    .eq('id', bookingId)
    .single();

  if (error || !booking) return res.status(404).json({ error: 'Booking not found' });
  if (!booking.guest_email) return res.status(200).json({ skipped: 'No guest email' });

  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = d => { const dt = new Date(d); return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`; };

  const propertyName = booking.properties?.name || 'your stay';
  const city = booking.properties?.city || '';
  const country = booking.properties?.country || '';
  const isConfirmed = status === 'confirmed';

  const subject = isConfirmed
    ? `Booking confirmed — ${propertyName}`
    : `Booking request declined — ${propertyName}`;

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF8F4;padding:40px 20px;">

      <!-- Logo -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#1a1a1a;border-radius:12px;padding:10px 18px;">
          <span style="color:#C8A96E;font-size:18px;font-weight:700;">س</span>
          <span style="color:#ffffff;font-size:16px;font-weight:600;margin-left:6px;">Sunna<span style="color:#C8A96E;">Stays</span></span>
        </div>
      </div>

      <!-- Card -->
      <div style="background:#ffffff;border-radius:20px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

        <div style="text-align:center;font-size:48px;margin-bottom:16px;">${isConfirmed ? '✅' : '❌'}</div>

        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;text-align:center;">
          ${isConfirmed ? 'Your booking is confirmed!' : 'Booking request declined'}
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#888;text-align:center;">
          ${isConfirmed
            ? 'Great news — the host has confirmed your stay.'
            : 'Unfortunately the host was unable to accept your request this time.'}
        </p>

        <!-- Booking details -->
        <div style="background:#FAF8F4;border-radius:14px;padding:20px;margin-bottom:24px;">
          <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:14px;">${propertyName}</div>
          ${city ? `<div style="font-size:13px;color:#888;margin-bottom:14px;">📍 ${city}${country ? ', ' + country : ''}</div>` : ''}
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:13px;color:#888;padding:6px 0;">Check-in</td>
              <td style="font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${fmt(booking.checkin)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888;padding:6px 0;">Check-out</td>
              <td style="font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${fmt(booking.checkout)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888;padding:6px 0;">Guests</td>
              <td style="font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${booking.guests}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888;padding:6px 0;">Total paid</td>
              <td style="font-size:14px;color:#C8A96E;font-weight:700;text-align:right;">£${booking.total_price}</td>
            </tr>
          </table>
        </div>

        ${isConfirmed ? `
        <!-- Halal guarantee -->
        <div style="background:rgba(74,124,89,0.08);border:1px solid rgba(74,124,89,0.2);border-radius:10px;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#4A7C59;">🟢 SunnaStays Halal Guarantee applies to this booking</p>
        </div>

        <!-- CTA -->
        <a href="https://sunnastays.com/dashboard/guest"
           style="display:block;background:#1a1a1a;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">
          View booking details →
        </a>
        ` : `
        <!-- Search again CTA -->
        <a href="https://sunnastays.com"
           style="display:block;background:#1a1a1a;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">
          Find another stay →
        </a>
        `}

      </div>

      <!-- Footer -->
      <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;line-height:1.6;">
        You received this because you have a booking on SunnaStays.<br/>
        SunnaStays Ltd · Registered in England and Wales
      </p>

    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SunnaStays <bookings@sunnastays.com>',
        to: [booking.guest_email],
        subject,
        html,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Booking status email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
