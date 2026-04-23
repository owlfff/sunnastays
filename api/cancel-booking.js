const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

function calcRefundAmount(totalPrice, policy, checkinDate) {
  const now = new Date();
  const checkin = new Date(checkinDate);
  const daysUntilCheckin = Math.ceil((checkin - now) / (1000 * 60 * 60 * 24));

  // Extract base nightly total (strip out 10% service fee)
  const baseTotal = totalPrice / 1.1;

  switch (policy) {
    case 'flexible':
      // Full refund if > 1 day before check-in
      return daysUntilCheckin >= 1 ? totalPrice : 0;

    case 'moderate':
      // Full refund if > 5 days before check-in
      return daysUntilCheckin >= 5 ? totalPrice : 0;

    case 'firm':
      // Full refund > 30 days, 50% refund > 7 days, no refund after
      if (daysUntilCheckin >= 30) return totalPrice;
      if (daysUntilCheckin >= 7)  return Math.round(baseTotal * 0.5);
      return 0;

    case 'strict':
      // 50% refund > 7 days, no refund after
      if (daysUntilCheckin >= 7) return Math.round(baseTotal * 0.5);
      return 0;

    default:
      // Default to moderate
      return daysUntilCheckin >= 5 ? totalPrice : 0;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bookingId, userId } = req.body;
  if (!bookingId || !userId) return res.status(400).json({ error: 'Missing bookingId or userId' });

  try {
    // Fetch booking and verify ownership
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.guest_id !== userId) return res.status(403).json({ error: 'Not authorised' });
    if (['cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    const policy = booking.cancellation_policy || 'moderate';
    const refundAmount = calcRefundAmount(booking.total_price, policy, booking.checkin);

    // Issue Stripe refund if payment was captured and there's something to refund
    let stripeRefundId = null;
    if (refundAmount > 0 && booking.stripe_payment_intent_id) {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100), // pence
      });
      stripeRefundId = refund.id;
    }

    // Update booking in database
    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        refund_amount: refundAmount,
        cancelled_at: new Date().toISOString(),
        stripe_refund_id: stripeRefundId,
      })
      .eq('id', bookingId);

    return res.status(200).json({
      success: true,
      refundAmount,
      message: refundAmount > 0
        ? `Cancelled. £${refundAmount.toFixed(2)} will be refunded within 5–10 business days.`
        : 'Cancelled. No refund applies under this cancellation policy.',
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ error: err.message });
  }
}
