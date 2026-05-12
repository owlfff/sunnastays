import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bookingId, senderType, senderName, messagePreview } = req.body;
  if (!bookingId || !senderType || !messagePreview) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const RESEND_KEY = process.env.RESEND_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' });

  // Load booking + property
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, properties(name, city, country, host_id)')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const propertyName = booking.properties?.name || 'your property';
  const dashboardUrl = senderType === 'guest'
    ? 'https://sunnastays.com/dashboard/host'
    : 'https://sunnastays.com/dashboard/guest';

  let recipientEmail = null;
  let recipientName = null;

  if (senderType === 'guest') {
    // Guest sent message — notify the host
    const hostId = booking.properties?.host_id;
    if (!hostId) return res.status(200).json({ skipped: 'No host ID' });

    const { data: hostProfile } = await supabase
      .from('profiles')
      .select('email, full_name, display_name')
      .eq('user_id', hostId)
      .single();

    recipientEmail = hostProfile?.email;
    recipientName = hostProfile?.display_name || hostProfile?.full_name || 'Host';
  } else {
    // Host sent message — notify the guest
    recipientEmail = booking.guest_email;
    recipientName = booking.guest_name || 'Guest';
  }

  if (!recipientEmail) {
    return res.status(200).json({ skipped: 'No recipient email found' });
  }

  const subject = `New message from ${senderName} — ${propertyName}`;

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

        <!-- Icon -->
        <div style="text-align:center;font-size:40px;margin-bottom:16px;">💬</div>

        <!-- Heading -->
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;text-align:center;">
          New message from ${senderName}
        </h1>
        <p style="margin:0 0 24px;font-size:14px;color:#888;text-align:center;">
          Re: ${propertyName}
        </p>

        <!-- Message preview -->
        <div style="background:#FAF8F4;border-left:3px solid #C8A96E;border-radius:0 10px 10px 0;padding:14px 16px;margin-bottom:28px;">
          <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.6;">${messagePreview}</p>
        </div>

        <!-- CTA -->
        <a href="${dashboardUrl}"
           style="display:block;background:#1a1a1a;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">
          Reply to ${senderName} →
        </a>

      </div>

      <!-- Footer -->
      <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;line-height:1.6;">
        You received this because you have an active booking on SunnaStays.<br/>
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
        from: 'SunnaStays <noreply@sunnastays.com>',
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Message notification error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
