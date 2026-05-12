import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { propertyId, status, rejectionReason } = req.body;
  if (!propertyId || !status) return res.status(400).json({ error: 'Missing required fields' });

  const RESEND_KEY = process.env.RESEND_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' });

  // Load property + host profile
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

  const subject = isApproved
    ? `Your listing is live — ${propertyName}`
    : `Your listing needs some changes — ${propertyName}`;

  const rejectionItems = rejectionReason
    ? rejectionReason.split('\n').filter(Boolean)
    : [];

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

        <div style="text-align:center;font-size:48px;margin-bottom:16px;">${isApproved ? '🏡' : '📋'}</div>

        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;text-align:center;">
          ${isApproved ? 'Your listing is live!' : 'Your listing needs some changes'}
        </h1>
        <p style="margin:0 0 8px;font-size:14px;color:#888;text-align:center;">
          Hi ${hostName},
        </p>
        <p style="margin:0 0 28px;font-size:14px;color:#888;text-align:center;">
          ${isApproved
            ? 'Great news — your property has passed our halal review and is now live on SunnaStays.'
            : 'We\'ve reviewed your listing and need a few things updated before we can approve it.'}
        </p>

        <!-- Property pill -->
        <div style="background:#FAF8F4;border-radius:14px;padding:16px 20px;margin-bottom:24px;text-align:center;">
          <div style="font-size:16px;font-weight:700;color:#1a1a1a;">${propertyName}</div>
          ${property.city ? `<div style="font-size:13px;color:#888;margin-top:4px;">📍 ${property.city}${property.country ? ', ' + property.country : ''}</div>` : ''}
        </div>

        ${isApproved ? `
        <!-- Halal guarantee badge -->
        <div style="background:rgba(74,124,89,0.08);border:1px solid rgba(74,124,89,0.2);border-radius:10px;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#4A7C59;">🟢 Your property carries the SunnaStays Halal Guarantee</p>
        </div>

        <!-- CTA -->
        <a href="https://sunnastays.com/dashboard/host"
           style="display:block;background:#1a1a1a;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">
          View your listing →
        </a>
        ` : `
        <!-- Rejection reasons -->
        ${rejectionItems.length > 0 ? `
        <div style="margin-bottom:24px;">
          <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">Here's what needs updating:</div>
          ${rejectionItems.map(r => `
            <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f0ebe1;">
              <span style="color:#C8A96E;font-size:14px;flex-shrink:0;">•</span>
              <span style="font-size:14px;color:#444;line-height:1.5;">${r}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Edit CTA -->
        <a href="https://sunnastays.com/dashboard/host"
           style="display:block;background:#1a1a1a;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">
          Edit &amp; resubmit listing →
        </a>
        `}

      </div>

      <!-- Footer -->
      <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;line-height:1.6;">
        You received this because you submitted a property on SunnaStays.<br/>
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
        from: 'SunnaStays <listings@sunnastays.com>',
        to: [hostProfile.email],
        subject,
        html,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Listing status email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
