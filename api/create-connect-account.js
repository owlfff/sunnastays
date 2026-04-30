const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, email, returnUrl } = req.body;
  if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' });

  try {
    // Check if host already has a connected account
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_account_status')
      .eq('user_id', userId)
      .single();

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      // Create a new Stripe Express account
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          email,
        },
        business_profile: {
          mcc: '7011', // Hotels and accommodation
          url: 'https://sunnastays.com',
          product_description: 'Short-term property rental',
        },
        settings: {
          payouts: { schedule: { interval: 'manual' } },
        },
      });
      accountId = account.id;

      // Save account ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId, stripe_account_status: 'pending' })
        .eq('user_id', userId);
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl,
      return_url: returnUrl + '?stripe=connected',
      type: 'account_onboarding',
      collect: 'eventually_due',
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error('Connect account error:', err);
    return res.status(500).json({ error: err.message });
  }
}
