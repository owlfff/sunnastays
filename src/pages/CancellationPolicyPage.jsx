import React from 'react';
import Footer from '../components/Footer';
import './LegalPage.css';

export default function CancellationPolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <h1>Cancellation Policy</h1>
          <p className="legal-hero-sub">How cancellations and refunds work on SunnaStays.</p>
          <p className="legal-hero-updated">Last updated: May 2026</p>
        </div>
      </div>

      <div className="legal-body">

        <div className="legal-highlight">
          <p>Each listing on SunnaStays has a cancellation policy set by the host. The applicable policy is shown on the listing page and confirmed at checkout. The guest service fee (10%) is non-refundable in all cases.</p>
        </div>

        <section className="legal-section">
          <h2>🟢 Flexible</h2>
          <p>Full refund of the nightly rate if cancelled more than <strong>24 hours</strong> before check-in. Cancellations within 24 hours of check-in receive no refund.</p>
          <table className="legal-table">
            <thead><tr><th>Cancellation timing</th><th>Refund</th></tr></thead>
            <tbody>
              <tr><td>More than 24 hours before check-in</td><td>Full nightly rate refunded</td></tr>
              <tr><td>Less than 24 hours before check-in</td><td>No refund</td></tr>
              <tr><td>Guest service fee</td><td>Non-refundable</td></tr>
            </tbody>
          </table>
        </section>

        <section className="legal-section">
          <h2>🟡 Moderate</h2>
          <p>Full refund of the nightly rate if cancelled more than <strong>5 days</strong> before check-in. Cancellations within 5 days receive no refund.</p>
          <table className="legal-table">
            <thead><tr><th>Cancellation timing</th><th>Refund</th></tr></thead>
            <tbody>
              <tr><td>More than 5 days before check-in</td><td>Full nightly rate refunded</td></tr>
              <tr><td>5 days or less before check-in</td><td>No refund</td></tr>
              <tr><td>Guest service fee</td><td>Non-refundable</td></tr>
            </tbody>
          </table>
        </section>

        <section className="legal-section">
          <h2>🟠 Firm</h2>
          <p>Full refund if cancelled more than <strong>30 days</strong> before check-in. 50% refund if cancelled between <strong>7 and 30 days</strong> before check-in. No refund within 7 days.</p>
          <table className="legal-table">
            <thead><tr><th>Cancellation timing</th><th>Refund</th></tr></thead>
            <tbody>
              <tr><td>More than 30 days before check-in</td><td>Full nightly rate refunded</td></tr>
              <tr><td>7–30 days before check-in</td><td>50% of nightly rate refunded</td></tr>
              <tr><td>Less than 7 days before check-in</td><td>No refund</td></tr>
              <tr><td>Guest service fee</td><td>Non-refundable</td></tr>
            </tbody>
          </table>
        </section>

        <section className="legal-section">
          <h2>🔴 Strict</h2>
          <p>50% refund if cancelled more than <strong>7 days</strong> before check-in. No refund within 7 days.</p>
          <table className="legal-table">
            <thead><tr><th>Cancellation timing</th><th>Refund</th></tr></thead>
            <tbody>
              <tr><td>More than 7 days before check-in</td><td>50% of nightly rate refunded</td></tr>
              <tr><td>7 days or less before check-in</td><td>No refund</td></tr>
              <tr><td>Guest service fee</td><td>Non-refundable</td></tr>
            </tbody>
          </table>
        </section>

        <section className="legal-section">
          <h2>Host cancellations</h2>
          <p>If a host cancels a confirmed booking, the guest receives a <strong>full refund including the service fee</strong>, regardless of the listed cancellation policy. SunnaStays may also apply penalties to the host's account.</p>
        </section>

        <section className="legal-section">
          <h2>Extenuating circumstances</h2>
          <p>In exceptional circumstances (serious illness, bereavement, or force majeure events), SunnaStays may at its discretion override the standard cancellation policy. To request an extenuating circumstances review, contact <a href="mailto:support@sunnastays.com">support@sunnastays.com</a> with relevant documentation within 48 hours of the cancellation.</p>
        </section>

        <section className="legal-section">
          <h2>How refunds are processed</h2>
          <p>Approved refunds are returned to the original payment method via Stripe. Refunds typically appear within 5–10 business days depending on your bank or card issuer.</p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
