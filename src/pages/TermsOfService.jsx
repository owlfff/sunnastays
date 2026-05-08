import React from 'react';
import Footer from '../components/Footer';
import './LegalPage.css';

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <h1>Terms of Service</h1>
          <p className="legal-hero-sub">The terms that govern your use of the SunnaStays platform.</p>
          <p className="legal-hero-updated">Last updated: May 2026</p>
        </div>
      </div>

      <div className="legal-body">

        <div className="legal-highlight">
          <p>These Terms of Service ("Terms") constitute a legally binding agreement between you and SunnaStays Ltd ("SunnaStays", "we", "us"). By accessing or using the SunnaStays platform, you agree to be bound by these Terms. If you do not agree, do not use the platform.</p>
        </div>

        <section className="legal-section">
          <h2>1. About SunnaStays</h2>
          <p>SunnaStays Ltd is a company registered in England and Wales. We operate an online marketplace that enables guests to discover and book halal-certified short-stay accommodation listed by independent hosts. SunnaStays is not a party to the accommodation contract between guest and host — we provide the platform and facilitate the transaction.</p>
        </section>

        <section className="legal-section">
          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years old to create an account or make a booking on SunnaStays. By using the platform you confirm that you meet this requirement and that all information you provide is accurate and truthful.</p>
        </section>

        <section className="legal-section">
          <h2>3. Platform fees</h2>
          <h3>Guest service fee</h3>
          <p>A non-refundable service fee of <strong>10%</strong> of the booking subtotal is charged to guests at checkout. This fee covers platform operations, customer support, and the SunnaStays Halal Guarantee.</p>
          <h3>Host fee</h3>
          <p>A platform fee of <strong>3%</strong> is deducted from the host payout for each completed booking. This is calculated on the nightly rate total, excluding the guest service fee and cleaning fee.</p>
          <h3>Cleaning fees</h3>
          <p>Cleaning fees are set by hosts and passed through to guests at cost. SunnaStays does not charge a fee on cleaning fees.</p>
        </section>

        <section className="legal-section">
          <h2>4. Bookings and payments</h2>
          <p>When a guest completes checkout, payment is collected via Stripe and held by SunnaStays. For instant booking properties, the booking is confirmed immediately. For request-to-book properties, the host must accept within 24 hours or the booking lapses and full payment is returned.</p>
          <p>Host payouts are released automatically after the guest's check-in date, subject to any applicable cancellation window having passed. Payouts are made to the host's connected Stripe account.</p>
          <p>All prices are displayed in the listing currency. Guests are charged in the listing currency. SunnaStays is not responsible for foreign exchange rates or bank conversion fees.</p>
        </section>

        <section className="legal-section">
          <h2>5. Cancellation policy</h2>
          <p>Cancellation terms vary by listing and are set by the host. The applicable policy is displayed on the listing page and confirmed at checkout. SunnaStays enforces the following standard policies:</p>
          <ul>
            <li><strong>Flexible:</strong> Full refund (excluding service fee) if cancelled more than 24 hours before check-in</li>
            <li><strong>Moderate:</strong> Full refund (excluding service fee) if cancelled more than 5 days before check-in</li>
            <li><strong>Firm:</strong> Full refund if cancelled more than 30 days before check-in; 50% refund if cancelled between 7–30 days before check-in; no refund within 7 days</li>
            <li><strong>Strict:</strong> 50% refund if cancelled more than 7 days before check-in; no refund within 7 days</li>
          </ul>
          <p>The guest service fee is non-refundable in all cases. See our full <a href="/cancellation-policy">Cancellation Policy</a> for details.</p>
        </section>

        <section className="legal-section">
          <h2>6. Guest responsibilities</h2>
          <ul>
            <li>Guests must respect the property, its contents, and the host's house rules</li>
            <li>Guests must not permit more occupants than stated in the booking</li>
            <li>Guests must comply with the SunnaStays Halal Charter at all times on the property</li>
            <li>Guests are liable for damage caused to the property during their stay</li>
            <li>Guests must not use the property for commercial purposes, events, or parties without express written permission from the host</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Host responsibilities</h2>
          <ul>
            <li>Hosts must ensure their listing is accurate, up to date, and compliant with the SunnaStays Halal Charter</li>
            <li>Hosts must honour confirmed bookings. Repeated cancellations by hosts may result in account suspension</li>
            <li>Hosts are responsible for ensuring their property complies with all applicable local laws, safety regulations, and planning requirements</li>
            <li>Hosts must have all necessary permissions to rent their property (including mortgage lender or landlord consent where applicable)</li>
            <li>Hosts are responsible for collecting and remitting any applicable local taxes on rental income</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Halal compliance</h2>
          <p>All hosts must comply with the <a href="/halal-charter">SunnaStays Halal Charter</a>. SunnaStays performs reasonable verification but cannot guarantee ongoing compliance between reviews. Guests who identify a breach should report it to <a href="mailto:charter@sunnastays.com">charter@sunnastays.com</a>.</p>
        </section>

        <section className="legal-section">
          <h2>9. Prohibited conduct</h2>
          <p>You may not use the SunnaStays platform to:</p>
          <ul>
            <li>Circumvent platform fees by arranging payments directly with hosts or guests</li>
            <li>Post false, misleading, or fraudulent listings or reviews</li>
            <li>Harass, threaten, or discriminate against other users</li>
            <li>Use the platform for any illegal purpose</li>
            <li>Attempt to access systems or data beyond your authorised scope</li>
          </ul>
          <p>Violations may result in immediate account suspension and legal action.</p>
        </section>

        <section className="legal-section">
          <h2>10. Limitation of liability</h2>
          <p>SunnaStays acts as a marketplace intermediary. To the maximum extent permitted by law:</p>
          <ul>
            <li>SunnaStays is not liable for the acts, omissions, or conduct of hosts or guests</li>
            <li>SunnaStays is not liable for property damage, personal injury, or loss suffered during a stay</li>
            <li>SunnaStays's total aggregate liability to you shall not exceed the amount of fees paid to SunnaStays in the 12 months preceding the claim</li>
            <li>SunnaStays is not liable for indirect, consequential, or punitive damages</li>
          </ul>
          <p>Nothing in these Terms limits liability for death, personal injury caused by negligence, fraud, or any other matter that cannot be excluded under English law.</p>
        </section>

        <section className="legal-section">
          <h2>11. Dispute resolution</h2>
          <p>In the event of a dispute between a guest and a host, we encourage both parties to resolve the matter directly. SunnaStays may, at its discretion, assist with mediation but is not obligated to do so.</p>
          <p>Disputes between you and SunnaStays should first be raised by emailing <a href="mailto:legal@sunnastays.com">legal@sunnastays.com</a>. If unresolved within 30 days, either party may refer the matter to the courts of England and Wales.</p>
        </section>

        <section className="legal-section">
          <h2>12. Governing law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of England and Wales. Both parties submit to the exclusive jurisdiction of the courts of England and Wales.</p>
        </section>

        <section className="legal-section">
          <h2>13. Changes to these Terms</h2>
          <p>We may update these Terms at any time. We will notify you of material changes by email at least 14 days before they take effect. Continued use of the platform after that date constitutes acceptance of the revised Terms.</p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
