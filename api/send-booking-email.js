export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, booking, property } = req.body;

  const RESEND_KEY = process.env.RESEND_KEY;
  if (!RESEND_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Build email content based on type
  const isInstant = booking.instantBooking;
  const subject = type === 'host'
    ? `New ${isInstant ? 'booking' : 'booking request'} for ${property.name}`
    : `Your ${isInstant ? 'booking is confirmed' : 'request has been sent'} — ${property.name}`;

  const hostHtml = `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#FBF7EE;padding:40px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="background:#C4622D;width:48px;height:48px;border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:22px;font-family:'Noto Naskh Arabic',serif;">س</span>
        </div>
        <h1 style="font-size:28px;color:#1A1208;margin:0;">SunnaStays</h1>
      </div>

      <h2 style="font-size:22px;color:#1A1208;margin-bottom:8px;">
        ${isInstant ? '⚡ New instant booking!' : '📋 New booking request'}
      </h2>
      <p style="color:#7A6548;font-size:15px;margin-bottom:24px;">
        ${isInstant
          ? 'A guest has instantly booked your property.'
          : 'A guest has requested to book your property. Please respond within 24 hours.'}
      </p>

      <div style="background:#EDE0C4;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:16px;color:#1A1208;margin:0 0 14px;">${property.name}</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Guest name</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.guestName}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Email</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.guestEmail}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Phone</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.guestPhone}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Check-in</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.checkin}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Check-out</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.checkout}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Guests</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.guests}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Total</td><td style="color:#C4622D;font-size:15px;font-weight:700;text-align:right;">£${booking.totalPrice}</td></tr>
        </table>
        ${booking.message ? `<div style="margin-top:14px;padding:12px;background:#F5EDD8;border-radius:8px;"><p style="font-size:13px;color:#7A6548;margin:0 0 4px;">Message from guest:</p><p style="font-size:14px;color:#1A1208;margin:0;">${booking.message}</p></div>` : ''}
      </div>

      <div style="background:rgba(74,124,89,0.1);border:1px solid rgba(74,124,89,0.2);border-radius:10px;padding:14px;margin-bottom:24px;">
        <p style="color:#4A7C59;font-size:13px;margin:0;">🟢 SunnaStays Halal Guarantee applies to this booking</p>
      </div>

      <a href="https://sunnastays.com/admin" style="display:block;background:#C4622D;color:white;text-align:center;padding:14px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">
        ${isInstant ? 'View booking' : 'Review request'} →
      </a>

      <p style="text-align:center;font-size:12px;color:#7A6548;margin-top:24px;">SunnaStays · sunnastays.com</p>
    </div>
  `;

  const guestHtml = `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#FBF7EE;padding:40px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="background:#C4622D;width:48px;height:48px;border-radius:12px;margin:0 auto 12px;">
        </div>
        <h1 style="font-size:28px;color:#1A1208;margin:0;">SunnaStays</h1>
        <p style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:#C4622D;direction:rtl;margin:8px 0 0;">
          ${isInstant ? 'مبروك' : 'شكراً'}
        </p>
      </div>

      <h2 style="font-size:22px;color:#1A1208;margin-bottom:8px;">
        ${isInstant ? "You're booked!" : 'Request sent!'}
      </h2>
      <p style="color:#7A6548;font-size:15px;margin-bottom:24px;">
        ${isInstant
          ? 'Your halal-certified stay is confirmed. We look forward to welcoming you.'
          : 'Your booking request has been sent. The host will respond within 24 hours.'}
      </p>

      <div style="background:#EDE0C4;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:16px;color:#1A1208;margin:0 0 14px;">${property.name}</h3>
        <p style="font-size:13px;color:#7A6548;margin:0 0 14px;">📍 ${property.location}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Check-in</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.checkin}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Check-out</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.checkout}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Guests</td><td style="color:#1A1208;font-size:13px;font-weight:600;text-align:right;">${booking.guests}</td></tr>
          <tr><td style="color:#7A6548;font-size:13px;padding:6px 0;">Total</td><td style="color:#C4622D;font-size:15px;font-weight:700;text-align:right;">£${booking.totalPrice}</td></tr>
        </table>
      </div>

      <div style="background:rgba(74,124,89,0.1);border:1px solid rgba(74,124,89,0.2);border-radius:10px;padding:14px;margin-bottom:24px;">
        <p style="color:#4A7C59;font-size:13px;margin:0;">🟢 SunnaStays Halal Guarantee applies to this booking</p>
      </div>

      <p style="text-align:center;font-size:12px;color:#7A6548;margin-top:24px;">SunnaStays · sunnastays.com</p>
    </div>
  `;

  try {
    // Send to host
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SunnaStays <bookings@sunnastays.com>',
        to: ['fortyfourb@proton.me'], // Your admin email — replace with host email when host accounts are wired
        subject,
        html: type === 'host' ? hostHtml : guestHtml,
      }),
    });

    // Send confirmation to guest
    if (booking.guestEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SunnaStays <bookings@sunnastays.com>',
          to: [booking.guestEmail],
          subject: `Your ${isInstant ? 'booking is confirmed' : 'request has been sent'} — ${property.name}`,
          html: guestHtml,
        }),
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
