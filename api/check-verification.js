const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, code, userId } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phone, code });

    if (result.status === 'approved') {
      // Mark phone as verified in profiles
      if (userId) {
        await supabase.from('profiles')
          .update({ phone, phone_verified: true })
          .eq('user_id', userId);
      }
      return res.status(200).json({ success: true, verified: true });
    } else {
      return res.status(200).json({ success: false, verified: false, error: 'Invalid code' });
    }
  } catch (err) {
    console.error('Twilio verify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
