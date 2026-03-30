export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { booking, property } = req.body;
  const RESEND_KEY = process.env.RESEND_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email not configured' });

  const reviewUrl = `https://www.sunnastays.com/review?token=${booking.reviewToken}`;

  const html = `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#FBF7EE;padding:40px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="background:#C4622D;width:48px;height:48px;border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:22px;font-family:'Noto Naskh Arabic',serif;">س</span>
        </div>
        <h1 style="font-size:28px;color:#1A1208;margin:0;">SunnaStays</h1>
      </div>
      <h2 style="font-size:22px;color:#1A1208;margin-bottom:8px;">How was your stay at ${property.name}?</h2>
      <p style="color:#7A6548;font-size:15px;font-weight:300;line-height:1.6;margin-bottom:24px;">
        We hope you had a wonderful halal-certified stay. Your feedback helps other Muslim travellers find the perfect home away from home.
      </p>
      <div style="background:#EDE0C4;border-radius:12px;padding:16px;margin-bottom:24px;">
        <div style="font-size:14px;color:#7A6548;margin-bottom:4px;">Your stay</div>
        <div style="font-size:16px;font-weight:600;color:#1A1208;">${property.name}</div>
        <div style="font-size:13px;color:#7A6548;">📍 ${property.location}</div>
      </div>
      <a href="${reviewUrl}" style="display:block;background:#C4622D;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;margin-bottom:20px;">
        ★ Leave a review →
      </a>
      <p style="text-align:center;font-size:12px;color:#7A6548;">This link expires after use. SunnaStays · sunnastays.com</p>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SunnaStays <bookings@sunnastays.com>',
        to: [booking.guestEmail],
        subject: `How was your stay at ${property.name}? Leave a review`,
        html,
      }),
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
