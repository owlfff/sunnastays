import React from 'react';
import Footer from '../components/Footer';
import { useMeta } from '../hooks/useMeta';
import './LegalPage.css';
import './About.css';

export default function About() {
  useMeta('About us', 'Learn about SunnaStays — the halal-certified short stay platform for the modern Muslim traveller.');
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <h1>About SunnaStays</h1>
          <p className="legal-hero-sub">Travel without compromise. Accommodation that reflects your values.</p>
        </div>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <h2>Our story</h2>
          <p>SunnaStays was born out of a frustration that millions of Muslim travellers know well. Every trip began with the same exhausting process — emailing hosts to ask about alcohol in the property, trying to find halal food nearby, worrying whether the space would feel comfortable for your family. Mainstream platforms weren't built with us in mind.</p>
          <p>We built SunnaStays to change that. A platform where the halal standard is the default — not an afterthought, not a filter you have to hunt for, but the foundation every listing is built on.</p>
        </section>

        <section className="legal-section">
          <h2>Our mission</h2>
          <p>Our mission is simple: to make halal travel effortless. We verify every property against our Halal Charter before it goes live, so guests can book with confidence knowing the space meets their values.</p>
          <p>We serve Muslim travellers and families who want more than just a place to sleep — they want a space that feels like home, wherever they are in the world.</p>
        </section>

        <section className="legal-section">
          <h2>The SunnaStays standard</h2>
          <p>Every property on SunnaStays must be alcohol-free, free from non-halal meat, pet-free, and reviewed by our team before going live. Hosts sign our Halal Charter and accept ongoing compliance as a condition of listing.</p>
          <p>This isn't a self-certification scheme. We review listings, monitor guest feedback, and remove hosts who don't maintain the standard. The green Halal Guarantee badge means something.</p>
          <p>Read the full <a href="/halal-charter">SunnaStays Halal Charter →</a></p>
        </section>

        <section className="legal-section">
          <h2>Where we're going</h2>
          <p>We launched in the United Kingdom and are expanding across key Muslim travel destinations — Malaysia, Turkey, the UAE, Morocco, and beyond. Our goal is to build the world's most trusted halal travel marketplace, with thousands of verified properties in every major city and resort destination that Muslim travellers love.</p>
          <p>If you're a host with a property that meets our standard, we'd love to have you. If you're a traveller, we'd love to help you find your next stay.</p>
        </section>

        <section className="legal-section">
          <h2>Get in touch</h2>
          <p>For partnerships, press enquiries, or anything else, reach us at <a href="mailto:hello@sunnastays.com">hello@sunnastays.com</a></p>
          <p>For support: <a href="/contact">Contact us →</a></p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
