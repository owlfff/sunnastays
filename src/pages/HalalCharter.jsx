import React from 'react';
import Footer from '../components/Footer';
import './HalalCharter.css';

const REQUIREMENTS = [
  {
    icon: '🚫',
    title: 'Alcohol-free',
    desc: 'No alcohol is stored, consumed, or served on the property at any time — including in minibars, welcome hampers, or communal spaces.',
  },
  {
    icon: '🥩',
    title: 'No non-halal meat',
    desc: 'Pork and non-halal meat products must not be present on the property. Hosts who provide food must ensure all meat is halal-certified.',
  },
  {
    icon: '🐾',
    title: 'Pet-free',
    desc: 'No pets reside in or visit the property. Properties must be professionally cleaned and certified free of animal presence.',
  },
  {
    icon: '🍳',
    title: 'Halal kitchen',
    desc: 'Where indicated, kitchen utensils, cookware, and appliances have only been used with halal-compliant ingredients.',
  },
  {
    icon: '🕌',
    title: 'Prayer facilities',
    desc: 'A clean prayer mat is available and the Qibla direction is clearly indicated. Hosts are encouraged to provide a prayer timetable.',
  },
  {
    icon: '🖼️',
    title: 'Appropriate décor',
    desc: 'The property contains no explicit imagery, alcohol advertising, or content inconsistent with Islamic values.',
  },
];

const VERIFICATION_STEPS = [
  { step: '01', title: 'Self-declaration', desc: 'Hosts complete our Halal Standards checklist confirming each requirement during onboarding.' },
  { step: '02', title: 'Document review', desc: 'Our team reviews photos, descriptions, and any supporting documentation provided by the host.' },
  { step: '03', title: 'Listing approval', desc: 'A SunnaStays reviewer approves each listing before it goes live. Non-compliant listings are rejected.' },
  { step: '04', title: 'Guest feedback', desc: 'Guest reviews are monitored for compliance. Verified complaints trigger an immediate review.' },
];

export default function HalalCharter() {
  return (
    <div className="charter-page">
      {/* HERO */}
      <div className="charter-hero">
        <div className="charter-hero-inner">
          <p className="charter-arabic">ميثاق الحلال</p>
          <h1>The SunnaStays<br /><em>Halal Charter</em></h1>
          <p className="charter-hero-sub">
            Every property listed on SunnaStays is held to a rigorous set of halal standards.
            This charter defines what we require, how we verify it, and what you can expect as a guest or host.
          </p>
          <div className="charter-badge">🟢 Verified Halal Standard</div>
        </div>
      </div>

      <div className="charter-body">

        {/* INTRO */}
        <section className="charter-section">
          <h2>Our commitment</h2>
          <p>
            SunnaStays was founded on a simple belief: Muslim travellers deserve short-stay accommodation
            that reflects their values — without compromise. The SunnaStays Halal Charter is our formal
            commitment to every guest that each listed property meets a defined, verified standard.
          </p>
          <p>
            This is not a self-certification scheme. Every listing is reviewed by our team before going live,
            and guest feedback forms part of our ongoing monitoring. Hosts who fail to meet the charter
            requirements are removed from the platform.
          </p>
        </section>

        {/* REQUIREMENTS */}
        <section className="charter-section">
          <h2>Property requirements</h2>
          <p>All SunnaStays properties must meet the following standards. Requirements marked as mandatory
            must be confirmed by every host. Additional standards are encouraged and clearly displayed on each listing.</p>
          <div className="charter-requirements">
            {REQUIREMENTS.map(r => (
              <div key={r.title} className="charter-req-card">
                <div className="charter-req-icon">{r.icon}</div>
                <div>
                  <h4>{r.title}</h4>
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VERIFICATION */}
        <section className="charter-section">
          <h2>How we verify</h2>
          <div className="charter-steps">
            {VERIFICATION_STEPS.map(s => (
              <div key={s.step} className="charter-step">
                <div className="charter-step-num">{s.step}</div>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GUEST RIGHTS */}
        <section className="charter-section charter-section--highlighted">
          <h2>Your rights as a guest</h2>
          <p>If you arrive at a SunnaStays property and find it does not meet the standards advertised, you are entitled to:</p>
          <ul className="charter-list">
            <li>A full refund if the breach is material and reported within 24 hours of check-in</li>
            <li>Assistance finding alternative accommodation from our team</li>
            <li>A formal complaint review, with the host's listing suspended pending investigation</li>
          </ul>
          <p>To report a concern, contact us at <strong>charter@sunnastays.com</strong></p>
        </section>

        {/* HOST OBLIGATIONS */}
        <section className="charter-section">
          <h2>Host obligations</h2>
          <p>By listing on SunnaStays, hosts agree to:</p>
          <ul className="charter-list">
            <li>Maintain the halal standards declared during onboarding at all times</li>
            <li>Inform SunnaStays immediately of any change that affects compliance</li>
            <li>Permit re-verification at any time upon request</li>
            <li>Accept that repeated or serious breaches will result in permanent removal from the platform</li>
          </ul>
        </section>

        {/* CLOSING */}
        <section className="charter-section charter-section--closing">
          <p className="charter-closing-arabic">وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا</p>
          <p className="charter-closing-translation">"And whoever fears Allah — He will make for him a way out." — Quran 65:2</p>
          <p>This charter is reviewed annually. Last updated April 2026.</p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
