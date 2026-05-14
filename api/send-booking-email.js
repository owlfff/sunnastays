import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = d => { const dt = new Date(d); return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`; };

async function sendEmail(resendKey, to, subject, html, from = 'SunnaStays <bookings@sunnastays.com>') {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_KEY = process.env.RESEND_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' });

  const { type } = req.body;

  // ── Booking status update (host confirmed/rejected → notify guest) ──────────
  if (type === 'booking-status') {
    const { bookingId, status } = req.body;
    if (!bookingId || !status) return res.status(400).json({ error: 'Missing fields' });

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, properties(name, city, country)')
      .eq('id', bookingId)
      .single();
    if (error || !booking) return res.status(404).json({ error: 'Booking not found' });
    if (!booking.guest_email) return res.status(200).json({ skipped: 'No guest email' });

    const propertyName = booking.properties?.name || 'your stay';
    const isConfirmed = status === 'confirmed';
    const subject = isConfirmed
      ? `Booking confirmed — ${propertyName}`
      : `Booking request declined — ${propertyName}`;

    const html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF8F4;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:#1a1a1a;border-radius:12px;padding:10px 18px;">
            <span style="color:#C8A96E;font-size:18px;font-weight:700;">س</span>
            <span style="color:#fff;font-size:16px;font-weight:600;margin-left:6px;">Sunna<span style="color:#C8A96E;">Stays</span></span>
          </div>
        </div>
        <div style="background:#fff;border-radius:20px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
          <div style="text-align:center;font-size:48px;margin-bottom:16px;">${isConfirmed ? '✅' : '❌'}</div>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;text-align:center;">
            ${isConfirmed ? 'Your booking is confirmed!' : 'Booking request declined'}
          </h1>
          <p style="margin:0 0 28px;font-size:14px;color:#888;text-align:center;">
            ${isConfirmed ? 'Great news — the host has confirmed your stay.' : 'Unfortunately the host was unable to accept your request this time.'}
          </p>
          <div style="background:#FAF8F4;border-radius:14px;padding:20px;margin-bottom:24px;">
            <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">${propertyName}</div>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="font-size:13px;color:#888;padding:6px 0;">Check-in</td><td style="font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${fmtDate(booking.checkin)}</td></tr>
              <tr><td style="font-size:13px;color:#888;padding:6px 0;">Check-out</td><td style="font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${fmtDate(booking.checkout)}</td></tr>
              <tr><td style="font-size:13px;color:#888;padding:6px 0;">Guests</td><td style="font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${booking.guests}</td></tr>
              <tr><td style="font-size:13px;color:#888;padding:6px 0;">Total paid</td><td style="font-size:14px;color:#C8A96E;font-weight:700;text-align:right;">£${booking.total_price}</td></tr>
            </table>
          </div>
          ${isConfirmed
            ? `<div style="background:rgba(74,124,89,0.08);border:1px solid rgba(74,124,89,0.2);border-radius:10px;padding:12px 16px;margin-bottom:24px;"><p style="margin:0;font-size:13px;color:#4A7C59;">🟢 SunnaStays Halal Guarantee applies to this booking</p></div>
               <a href="https://sunnastays.com/dashboard/guest" style="display:block;background:#1a1a1a;color:#fff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">View booking details →</a>`
            : `<a href="https://sunnastays.com" style="display:block;background:#1a1a1a;color:#fff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">Find another stay →</a>`}
        </div>
        <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;line-height:1.6;">SunnaStays Ltd · Registered in England and Wales</p>
      </div>
    `;

    try {
      await sendEmail(RESEND_KEY, booking.guest_email, subject, html);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Booking status email error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  // ── Listing status update (admin approved/rejected → notify host) ────────────
  if (type === 'listing-status') {
    const { propertyId, status, rejectionReason } = req.body;
    if (!propertyId || !status) return res.status(400).json({ error: 'Missing fields' });

    const { data: property, error } = await supabase
      .from('properties')
      .select('name, city, country, host_id')
      .eq('id', propertyId)
      .single();
    if (error || !property) return res.status(404).json({ error: 'Property not found' });

    const { data: hostProfile } = await supabase
      .from('profiles')
      .select('email, display_name, full_name')
      .eq('user_id', property.host_id)
      .single();
    if (!hostProfile?.email) return res.status(200).json({ skipped: 'No host email' });

    const hostName = hostProfile.display_name || hostProfile.full_name || 'Host';
    const propertyName = property.name || 'your property';
    const isApproved = status === 'approved';
    const rejectionItems = rejectionReason ? rejectionReason.split('\n').filter(Boolean) : [];

    const subject = isApproved
      ? `Your listing is live — ${propertyName}`
      : `Your listing needs some changes — ${propertyName}`;

    const html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF8F4;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:#1a1a1a;border-radius:12px;padding:10px 18px;">
            <span style="color:#C8A96E;font-size:18px;font-weight:700;">س</span>
            <span style="color:#fff;font-size:16px;font-weight:600;margin-left:6px;">Sunna<span style="color:#C8A96E;">Stays</span></span>
          </div>
        </div>
        <div style="background:#fff;border-radius:20px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
          <div style="text-align:center;font-size:48px;margin-bottom:16px;">${isApproved ? '🏡' : '📋'}</div>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;text-align:center;">
            ${isApproved ? 'Your listing is live!' : 'Your listing needs some changes'}
          </h1>
          <p style="margin:0 0 4px;font-size:14px;color:#888;text-align:center;">Hi ${hostName},</p>
          <p style="margin:0 0 28px;font-size:14px;color:#888;text-align:center;">
            ${isApproved
              ? 'Your property has passed our halal review and is now live on SunnaStays.'
              : 'We\'ve reviewed your listing and need a few things updated before we can approve it.'}
          </p>
          <div style="background:#FAF8F4;border-radius:14px;padding:16px 20px;margin-bottom:24px;text-align:center;">
            <div style="font-size:16px;font-weight:700;color:#1a1a1a;">${propertyName}</div>
            ${property.city ? `<div style="font-size:13px;color:#888;margin-top:4px;">📍 ${property.city}${property.country ? ', ' + property.country : ''}</div>` : ''}
          </div>
          ${isApproved
            ? `<div style="background:rgba(74,124,89,0.08);border:1px solid rgba(74,124,89,0.2);border-radius:10px;padding:12px 16px;margin-bottom:24px;"><p style="margin:0;font-size:13px;color:#4A7C59;">🟢 Your property carries the SunnaStays Halal Guarantee</p></div>
               <a href="https://sunnastays.com/dashboard/host" style="display:block;background:#1a1a1a;color:#fff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">View your listing →</a>`
            : `${rejectionItems.length > 0
                ? `<div style="margin-bottom:24px;"><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">Here's what needs updating:</div>
                   ${rejectionItems.map(r => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f0ebe1;"><span style="color:#C8A96E;flex-shrink:0;">•</span><span style="font-size:14px;color:#444;line-height:1.5;">${r}</span></div>`).join('')}
                   </div>` : ''}
               <a href="https://sunnastays.com/dashboard/host" style="display:block;background:#1a1a1a;color:#fff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">Edit &amp; resubmit listing →</a>`}
        </div>
        <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;line-height:1.6;">SunnaStays Ltd · Registered in England and Wales</p>
      </div>
    `;

    try {
      await sendEmail(RESEND_KEY, hostProfile.email, subject, html, 'SunnaStays <listings@sunnastays.com>');
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Listing status email error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  // ── New booking (guest paid → notify host + guest) ───────────────────────────
  const { booking, property } = req.body;
  const isInstant = booking.instantBooking;

  const hostHtml = `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#FBF7EE;padding:40px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:28px;color:#1A1208;margin:0;">SunnaStays</h1>
      </div>
      <h2 style="font-size:22px;color:#1A1208;margin-bottom:8px;">${isInstant ? '⚡ New instant booking!' : '📋 New booking request'}</h2>
      <p style="color:#7A6548;font-size:15px;margin-bottom:24px;">
        ${isInstant ? 'A guest has instantly booked your property.' : 'A guest has requested to book your property. Please respond within 24 hours.'}
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
      <a href="https://sunnastays.com/dashboard/host" style="display:block;background:#C4622D;color:white;text-align:center;padding:14px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">
        ${isInstant ? 'View booking' : 'Review request'} →
      </a>
      <p style="text-align:center;font-size:12px;color:#7A6548;margin-top:24px;">SunnaStays · sunnastays.com</p>
    </div>
  `;

  const guestHtml = `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#FBF7EE;padding:40px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:28px;color:#1A1208;margin:0;">SunnaStays</h1>
      </div>
      <h2 style="font-size:22px;color:#1A1208;margin-bottom:8px;">${isInstant ? "You're booked!" : 'Request sent!'}</h2>
      <p style="color:#7A6548;font-size:15px;margin-bottom:24px;">
        ${isInstant ? 'Your halal-certified stay is confirmed. We look forward to welcoming you.' : 'Your booking request has been sent. The host will respond within 24 hours.'}
      </p>
      <div style="background:#EDE0C4;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:16px;color:#1A1208;margin:0 0 14px;">${property.name}</h3>
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

  // Look up host email from property
  let hostEmail = null;
  if (property.id) {
    const { data: prop } = await supabase.from('properties').select('host_id').eq('id', property.id).single();
    if (prop?.host_id) {
      const { data: hostProfile } = await supabase.from('profiles').select('email').eq('user_id', prop.host_id).single();
      hostEmail = hostProfile?.email;
    }
  }

  try {
    if (hostEmail) {
      await sendEmail(RESEND_KEY, hostEmail,
        `New ${isInstant ? 'booking' : 'booking request'} for ${property.name}`,
        hostHtml);
    }
    if (booking.guestEmail) {
      await sendEmail(RESEND_KEY, booking.guestEmail,
        `Your ${isInstant ? 'booking is confirmed' : 'request has been sent'} — ${property.name}`,
        guestHtml);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
