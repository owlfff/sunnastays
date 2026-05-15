const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);
const supabaseAuth = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  // Verify the caller's identity from their JWT — never trust client-supplied userId
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: authedUser }, error: authErr } = await supabaseAuth.auth.getUser(token);
  if (authErr || !authedUser) return res.status(401).json({ error: 'Unauthorised' });

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phone, code });

    if (result.status === 'approved') {
      await supabase.from('profiles')
        .update({ phone, phone_verified: true })
        .eq('user_id', authedUser.id);
      return res.status(200).json({ success: true, verified: true });
    } else {
      return res.status(200).json({ success: false, verified: false, error: 'Invalid code' });
    }
  } catch (err) {
    console.error('Twilio verify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
