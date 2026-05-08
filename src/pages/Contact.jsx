import React from 'react';
import Footer from '../components/Footer';
import './LegalPage.css';
import './Contact.css';

export default function Contact() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <h1>Contact us</h1>
          <p className="legal-hero-sub">We'd love to hear from you.</p>
        </div>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <h2>General enquiries</h2>
          <p>For general questions about SunnaStays, partnerships, or feedback, email us at:</p>
          <div className="contact-email-block">
            <a href="mailto:hello@sunnastays.com">hello@sunnastays.com</a>
          </div>
        </section>

        <section className="legal-section">
          <h2>Support</h2>
          <p>Having trouble with a booking, account, or payment? Our support team is here to help.</p>
          <div className="contact-email-block">
            <a href="mailto:support@sunnastays.com">support@sunnastays.com</a>
          </div>
        </section>

        <section className="legal-section">
          <h2>Halal compliance concerns</h2>
          <p>If you've stayed at a property and believe it did not meet our Halal Charter standards, please report it to our compliance team immediately. We take every report seriously.</p>
          <div className="contact-email-block">
            <a href="mailto:charter@sunnastays.com">charter@sunnastays.com</a>
          </div>
        </section>

        <section className="legal-section">
          <h2>Privacy and data requests</h2>
          <p>For data subject access requests, deletion requests, or any other GDPR-related queries:</p>
          <div className="contact-email-block">
            <a href="mailto:privacy@sunnastays.com">privacy@sunnastays.com</a>
          </div>
        </section>

        <section className="legal-section">
          <h2>Legal and press</h2>
          <div className="contact-email-block">
            <a href="mailto:legal@sunnastays.com">legal@sunnastays.com</a>
          </div>
        </section>

        <div className="legal-highlight">
          <p>We aim to respond to all enquiries within 2 business days. For urgent support relating to an active booking, please include your booking reference in the subject line.</p>
        </div>

      </div>
      <Footer />
    </div>
  );
}
