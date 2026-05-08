import React from 'react';
import Footer from '../components/Footer';
import './LegalPage.css';

export default function HostAgreement() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <h1>Host Agreement</h1>
          <p className="legal-hero-sub">The terms that govern hosting on the SunnaStays platform.</p>
          <p className="legal-hero-updated">Last updated: May 2026</p>
        </div>
      </div>

      <div className="legal-body">

        <div className="legal-highlight">
          <p>By creating a listing on SunnaStays, you ("the Host") agree to be bound by this Host Agreement in addition to our general <a href="/terms">Terms of Service</a>. This agreement sets out your specific obligations as a host on our platform.</p>
        </div>

        <section className="legal-section">
          <h2>1. Eligibility to host</h2>
          <p>To list a property on SunnaStays you must:</p>
          <ul>
            <li>Be at least 18 years of age</li>
            <li>Have the legal right to rent the property (as owner, or with the written consent of the owner, landlord, or mortgage lender where applicable)</li>
            <li>Hold any required licences or permits for short-term letting in your local area</li>
            <li>Be able to receive payouts via Stripe Connect (subject to Stripe's eligibility requirements)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. Listing requirements</h2>
          <p>All listings must include:</p>
          <ul>
            <li>Accurate property name, address, description, and type</li>
            <li>At least 5 high-quality photos that accurately represent the property</li>
            <li>Correct bedroom count, maximum occupancy, and nightly price</li>
            <li>Applicable house rules and cancellation policy</li>
          </ul>
          <p>Listings that are materially inaccurate, misleading, or do not reflect the property at the time of the guest's stay may be removed and the host may be liable for guest compensation.</p>
        </section>

        <section className="legal-section">
          <h2>3. Halal compliance obligations</h2>
          <p>As a condition of listing on SunnaStays, all hosts must comply with the <a href="/halal-charter">SunnaStays Halal Charter</a> at all times. The mandatory requirements are:</p>
          <ul>
            <li><strong>Alcohol-free:</strong> No alcohol may be stored, consumed, or served on the property at any time, including in minibars or welcome hampers</li>
            <li><strong>No non-halal meat:</strong> Pork and non-halal meat products must not be present on the property</li>
            <li><strong>Pet-free:</strong> No pets may reside in or visit the property</li>
          </ul>
          <p>Hosts who breach these mandatory requirements are subject to immediate listing suspension and may face permanent removal from the platform.</p>
        </section>

        <section className="legal-section">
          <h2>4. Fee structure</h2>
          <h3>Host platform fee</h3>
          <p>SunnaStays charges a <strong>3% host fee</strong> on the nightly rate total for each completed booking. This fee is automatically deducted before your payout is released.</p>
          <h3>Guest service fee</h3>
          <p>Guests are charged a separate 10% service fee on top of your listed price. This fee belongs to SunnaStays and does not affect your earnings.</p>
          <h3>Cleaning fees</h3>
          <p>You may set an optional cleaning fee. This is passed to you in full and is not subject to the host platform fee.</p>
        </section>

        <section className="legal-section">
          <h2>5. Payout terms</h2>
          <p>Payouts are made to your connected Stripe account after the guest checks in, following any applicable cancellation window. Payout timing is subject to Stripe's standard processing times (typically 2–7 business days depending on your bank).</p>
          <p>SunnaStays reserves the right to withhold or delay payouts in the following circumstances:</p>
          <ul>
            <li>A guest has raised a complaint pending investigation</li>
            <li>A cancellation or refund dispute is unresolved</li>
            <li>We have reason to suspect fraudulent activity</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Cancellations by hosts</h2>
          <p>Hosts are expected to honour all confirmed bookings. If you must cancel a confirmed booking:</p>
          <ul>
            <li>The guest will receive a full refund including the service fee</li>
            <li>Your listing may be temporarily removed from search results</li>
            <li>Repeated cancellations may result in permanent account suspension</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Taxes and legal compliance</h2>
          <p>Hosts are solely responsible for determining and fulfilling their tax obligations on rental income, including Income Tax, VAT, and any local tourist taxes. SunnaStays does not provide tax advice. Where required by law, SunnaStays may share transaction data with tax authorities.</p>
        </section>

        <section className="legal-section">
          <h2>8. Grounds for removal</h2>
          <p>SunnaStays reserves the right to remove a host's listing or suspend an account for:</p>
          <ul>
            <li>Breach of the SunnaStays Halal Charter</li>
            <li>Repeated guest complaints or low ratings</li>
            <li>Fraudulent, deceptive, or illegal conduct</li>
            <li>Circumventing platform fees</li>
            <li>Breach of these Terms or the Host Agreement</li>
          </ul>
          <p>In the event of removal, any pending payouts for completed stays will still be released. Payouts for active or future bookings that are cancelled as a result of removal will be refunded to guests.</p>
        </section>

        <section className="legal-section">
          <h2>9. Governing law</h2>
          <p>This Host Agreement is governed by English law. Any disputes arising from this agreement are subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
