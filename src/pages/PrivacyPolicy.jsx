import React from 'react';
import Footer from '../components/Footer';
import './LegalPage.css';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <h1>Privacy Policy</h1>
          <p className="legal-hero-sub">How SunnaStays collects, uses, and protects your personal data.</p>
          <p className="legal-hero-updated">Last updated: May 2026</p>
        </div>
      </div>

      <div className="legal-body">

        <div className="legal-highlight">
          <p>SunnaStays Ltd is the data controller for personal data processed through this platform. We are committed to protecting your privacy in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
        </div>

        <section className="legal-section">
          <h2>1. Who we are</h2>
          <p>SunnaStays Ltd is a company registered in England and Wales. We operate an online marketplace at sunnastays.com that connects guests seeking halal-certified short-stay accommodation with verified hosts.</p>
          <p>For any privacy-related queries, contact us at: <a href="mailto:privacy@sunnastays.com">privacy@sunnastays.com</a></p>
        </section>

        <section className="legal-section">
          <h2>2. Data we collect</h2>
          <h3>Account and profile data</h3>
          <p>When you register, we collect your full name, email address, phone number, and role (guest or host). Hosts additionally provide property details, bank account information (via Stripe), and identity verification documents.</p>
          <h3>Booking and transaction data</h3>
          <p>We collect booking dates, guest counts, messages between guests and hosts, payment amounts, and transaction identifiers. Payment card details are handled entirely by Stripe and are never stored on our servers.</p>
          <h3>Usage and technical data</h3>
          <p>We collect IP addresses, browser type, pages visited, session duration, and referring URLs via Vercel Analytics. We also collect device identifiers and approximate location for map-based features (Google Maps).</p>
          <h3>Communications</h3>
          <p>We retain records of emails and notifications sent via our platform (Resend), and SMS verification messages (Twilio).</p>
        </section>

        <section className="legal-section">
          <h2>3. How we use your data</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To facilitate bookings and process payments</li>
            <li>To verify your phone number and identity</li>
            <li>To send transactional emails (booking confirmations, receipts, review requests)</li>
            <li>To display property locations and nearby points of interest on maps</li>
            <li>To monitor platform health and improve our services via analytics</li>
            <li>To detect and prevent fraud, abuse, and policy violations</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Legal bases for processing</h2>
          <table className="legal-table">
            <thead>
              <tr><th>Purpose</th><th>Legal basis</th></tr>
            </thead>
            <tbody>
              <tr><td>Account creation and management</td><td>Contract performance</td></tr>
              <tr><td>Processing payments</td><td>Contract performance</td></tr>
              <tr><td>Phone verification</td><td>Legitimate interests (security)</td></tr>
              <tr><td>Transactional emails</td><td>Contract performance</td></tr>
              <tr><td>Analytics</td><td>Consent</td></tr>
              <tr><td>Fraud prevention</td><td>Legitimate interests</td></tr>
              <tr><td>Legal compliance</td><td>Legal obligation</td></tr>
            </tbody>
          </table>
        </section>

        <section className="legal-section">
          <h2>5. Third-party data processors</h2>
          <p>We share data only with trusted processors who are contractually bound to protect it:</p>
          <table className="legal-table">
            <thead>
              <tr><th>Processor</th><th>Purpose</th><th>Location</th></tr>
            </thead>
            <tbody>
              <tr><td>Stripe, Inc.</td><td>Payment processing and host payouts</td><td>USA (SCCs in place)</td></tr>
              <tr><td>Supabase, Inc.</td><td>Database and file storage</td><td>EU (AWS Frankfurt)</td></tr>
              <tr><td>Twilio, Inc.</td><td>SMS phone verification</td><td>USA (SCCs in place)</td></tr>
              <tr><td>Resend, Inc.</td><td>Transactional email delivery</td><td>USA (SCCs in place)</td></tr>
              <tr><td>Vercel, Inc.</td><td>Hosting and web analytics</td><td>USA (SCCs in place)</td></tr>
              <tr><td>Google LLC</td><td>Maps, geocoding, and Places search</td><td>USA (SCCs in place)</td></tr>
            </tbody>
          </table>
          <p>Where processors are located outside the UK/EEA, transfers are protected by Standard Contractual Clauses (SCCs) approved by the ICO.</p>
        </section>

        <section className="legal-section">
          <h2>6. Cookies</h2>
          <p>We use cookies and similar technologies for essential functionality and, with your consent, analytics. See our full <a href="/cookies">Cookie Policy</a> for details.</p>
        </section>

        <section className="legal-section">
          <h2>7. Data retention</h2>
          <ul>
            <li><strong>Account data:</strong> Retained for the duration of your account and 2 years after closure</li>
            <li><strong>Booking and transaction data:</strong> Retained for 7 years for financial/legal compliance</li>
            <li><strong>Communications:</strong> Retained for 2 years</li>
            <li><strong>Analytics data:</strong> Aggregated and anonymised after 90 days</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Your rights under UK GDPR</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right of access:</strong> Request a copy of the data we hold about you</li>
            <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Right to erasure:</strong> Request deletion of your data (subject to legal retention obligations)</li>
            <li><strong>Right to restriction:</strong> Restrict processing in certain circumstances</li>
            <li><strong>Right to portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Right to object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Right to withdraw consent:</strong> Withdraw consent for analytics at any time</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:privacy@sunnastays.com">privacy@sunnastays.com</a>. We will respond within 30 days.</p>
        </section>

        <section className="legal-section">
          <h2>9. Complaints</h2>
          <p>If you believe we have handled your data unlawfully, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a> or by calling 0303 123 1113.</p>
        </section>

        <section className="legal-section">
          <h2>10. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. Material changes will be communicated by email. Continued use of the platform after changes constitutes acceptance.</p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
