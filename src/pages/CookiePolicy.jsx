import React from 'react';
import Footer from '../components/Footer';
import './LegalPage.css';

export default function CookiePolicy() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <h1>Cookie Policy</h1>
          <p className="legal-hero-sub">What cookies we use, why, and how to control them.</p>
          <p className="legal-hero-updated">Last updated: May 2026</p>
        </div>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <h2>1. What are cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They allow the site to remember your preferences, keep you logged in, and understand how you use the service. Some cookies are essential for the platform to function; others are optional and used only with your consent.</p>
        </section>

        <section className="legal-section">
          <h2>2. Cookies we use</h2>
          <table className="legal-table">
            <thead>
              <tr><th>Cookie / Technology</th><th>Type</th><th>Purpose</th><th>Duration</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase auth token</td>
                <td>Essential</td>
                <td>Keeps you logged in to your SunnaStays account</td>
                <td>Session / 1 week</td>
              </tr>
              <tr>
                <td>cookie_consent</td>
                <td>Essential</td>
                <td>Stores your cookie consent preference</td>
                <td>1 year (localStorage)</td>
              </tr>
              <tr>
                <td>Vercel Analytics</td>
                <td>Analytics</td>
                <td>Anonymous usage analytics to understand how visitors use the site. No personal data is stored.</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>Google Maps</td>
                <td>Functional</td>
                <td>Required to display property maps and search for nearby places</td>
                <td>Session</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="legal-section">
          <h2>3. Essential cookies</h2>
          <p>Essential cookies are required for the platform to function and cannot be disabled. They include the authentication token that keeps you logged in and the cookie that remembers your consent preference. No consent is required for these cookies under UK GDPR.</p>
        </section>

        <section className="legal-section">
          <h2>4. Analytics cookies</h2>
          <p>We use Vercel Analytics to collect anonymous, aggregated data about how visitors use SunnaStays. This data includes pages visited, session duration, and referral source. No personally identifiable information is collected or stored. Analytics are only enabled with your consent.</p>
        </section>

        <section className="legal-section">
          <h2>5. Functional cookies</h2>
          <p>Google Maps is used to display property locations and search for nearby halal restaurants, food shops, and mosques. Google may set cookies as part of this service. See <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google's Privacy Policy</a> for details.</p>
        </section>

        <section className="legal-section">
          <h2>6. How to manage cookies</h2>
          <p>You can control cookie preferences in the following ways:</p>
          <ul>
            <li><strong>Cookie banner:</strong> When you first visit SunnaStays, a banner allows you to accept or decline non-essential cookies. You can change your preference at any time by clearing your browser's localStorage for sunnastays.com.</li>
            <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies via settings. Note that blocking essential cookies may prevent you from logging in.</li>
            <li><strong>Google Maps opt-out:</strong> You can opt out of Google's data collection via <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">Google's opt-out tool</a>.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Changes to this policy</h2>
          <p>We may update this Cookie Policy as we introduce new features or third-party services. Material changes will be communicated via the cookie banner on your next visit.</p>
          <p>Questions about cookies? Email <a href="mailto:privacy@sunnastays.com">privacy@sunnastays.com</a></p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
