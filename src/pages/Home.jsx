import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StayCard from '../components/StayCard';
import Footer from '../components/Footer';
import './Home.css';

const CATEGORIES = [
  { icon: '🏙️', label: 'City breaks' },
  { icon: '🏖️', label: 'Beachfront' },
  { icon: '🏔️', label: 'Mountains' },
  { icon: '🕌', label: 'Near mosques' },
  { icon: '🏰', label: 'Heritage riads' },
  { icon: '🌴', label: 'Desert escapes' },
  { icon: '👨‍👩‍👧‍👦', label: 'Family villas' },
  { icon: '💍', label: 'Honeymoon' },
  { icon: '🌊', label: 'Coastal' },
];

const FEATURED = [
  { id:'1', slug:'ottoman-terrace-suite', name:'Ottoman Terrace Suite', emoji:'🕌', location:'Sultanahmet, Istanbul', price:180, rating:4.97, halalCertified:true, gradient:'linear-gradient(135deg,#D4C4A0,#E8A87C)' },
  { id:'2', slug:'bosphorus-waterfront-villa', name:'Bosphorus Waterfront Villa', emoji:'🌊', location:'Bebek, Istanbul', price:340, rating:4.89, halalCertified:true, gradient:'linear-gradient(135deg,#c8b89a,#b87045)' },
  { id:'3', slug:'marina-view-penthouse', name:'Marina View Penthouse', emoji:'🌴', location:'Dubai Marina, UAE', price:290, rating:5.0, halalCertified:true, gradient:'linear-gradient(135deg,#a8c4b8,#4a7c59)' },
  { id:'4', slug:'riad-al-noor', name:'Riad al-Noor', emoji:'🏰', location:'Medina, Marrakech', price:95, rating:4.95, halalCertified:true, gradient:'linear-gradient(135deg,#d4bfa0,#8B6914)' },
];

const PROMISE = [
  { icon:'🚫🍷', title:'Alcohol-free', desc:'No alcohol stored, served, or permitted on any SunnaStays property.' },
  { icon:'🥩✓',  title:'Halal kitchen', desc:'All meat must be certified halal. Non-halal products are not permitted.' },
  { icon:'🐾',   title:'Pet-free', desc:'Pet-free environments maintained for cleanliness and guest comfort.' },
  { icon:'🕌',   title:'Prayer-friendly', desc:'Qibla direction, nearby mosque info, and prayer mats where applicable.' },
  { icon:'👨‍👩‍👧‍👦', title:'Family values', desc:'Properties respect Islamic family values throughout the guest experience.' },
  { icon:'🔒',   title:'Verified hosts', desc:'Every host is ID-verified and must sign our Halal Charter before listing.' },
];

const TESTIMONIALS = [
  { emoji:'👨', quote:'Finally a platform where I don\'t have to interrogate every host. The halal guarantee meant my wife and I could just relax and enjoy Istanbul.', name:'Yusuf Al-Hassan', meta:'London, UK · 3 stays' },
  { emoji:'👩', quote:'As a solo female traveller, knowing every property is screened gives me such peace of mind. The prayer-friendly filters are a brilliant touch.', name:'Fatima Osei', meta:'Birmingham, UK · 7 stays' },
  { emoji:'👨‍👩‍👧', quote:'We travel as a big family and halal compliance is non-negotiable. Smoother than Airbnb and the host communication was incredible. 10/10.', name:'The Mahmood Family', meta:'Manchester, UK · 5 stays' },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);
  const [featuredStays, setFeaturedStays] = useState(FEATURED);

  useEffect(() => {
    searchStays({}).then(results => {
      if (results && results.length > 0) {
        // Use real properties, pad with mock if less than 4
        const real = results.slice(0, 4);
        if (real.length < 4) {
          const mocks = FEATURED.slice(0, 4 - real.length);
          setFeaturedStays([...real, ...mocks]);
        } else {
          setFeaturedStays(real);
        }
      }
    }).catch(() => {
      // Fall back to mock data silently
    });
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-content container">
          <div className="hero-left">
            <p className="hero-arabic fade-up">إقامة حلال في كل مكان</p>
            <div className="hero-tag fade-up">
              <span>✦</span> 100% Halal-Certified Properties
            </div>
            <h1 className="fade-up-2">
              Travel with <em>trust,</em><br />stay in <em>comfort</em>
            </h1>
            <p className="hero-sub fade-up-2">
              Short stays that honour your values. Every property on SunnaStays is verified halal — no alcohol, no non-halal meat, no compromise.
            </p>
            <div className="hero-trust fade-up-4">
              {[
                { icon:'🕌', value:'2,400+', label:'Verified halal stays' },
                { icon:'🌍', value:'38 countries', label:'Global destinations' },
                { icon:'⭐', value:'4.9 / 5', label:'Guest satisfaction' },
              ].map(t => (
                <div className="trust-item" key={t.value}>
                  <div className="trust-icon">{t.icon}</div>
                  <div>
                    <div className="trust-value">{t.value}</div>
                    <div className="trust-label">{t.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual fade-up-2">
            {[
              { slug:'ottoman-terrace-suite', emoji:'🕌', loc:'Istanbul, Turkey', name:'Ottoman Terrace Suite', price:180, large:true, badge:'NEW', halalBadge:true, gradient:'linear-gradient(135deg,var(--terra-muted),var(--terra))' },
              { slug:'marina-view-penthouse', emoji:'🌴', loc:'Dubai, UAE', name:'Marina View Apt', price:210, gradient:'linear-gradient(135deg,#D4C4A0,#C4622D)' },
              { slug:'riad-al-noor', emoji:'🏡', loc:'Marrakech, Morocco', name:'Riad al-Noor', price:95, gradient:'linear-gradient(135deg,#c8b89a,#8B5014)' },
            ].map(c => (
              <div key={c.slug} className={`hero-card ${c.large ? 'hero-card--large' : ''}`} onClick={() => navigate(`/stays/${c.slug}`)}>
                <div className="hero-card-img" style={{ background: c.gradient, height: c.large ? 210 : 150 }}>
                  <span style={{ fontSize: c.large ? 44 : 32 }}>{c.emoji}</span>
                  {c.badge && <span className="hero-badge">{c.badge}</span>}
                  {c.halalBadge && <span className="hero-badge-halal">✓ Halal</span>}
                </div>
                <div className="hero-card-body">
                  <div className="hc-loc">📍 {c.loc}</div>
                  <div className="hc-name">{c.name}</div>
                  <div className="hc-price">£{c.price} <span>/ night</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="container">
          <div className="cat-grid">
            {CATEGORIES.map((c, i) => (
              <div key={c.label} className={`cat-chip ${activeCategory === i ? 'active' : ''}`} onClick={() => setActiveCategory(i)}>
                <span className="cat-icon">{c.icon}</span>
                <span className="cat-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED STAYS */}
      <section className="stays-section">
        <div className="container">
          <div className="section-label">Featured stays</div>
          <h2>Handpicked <em>halal</em> homes</h2>
          <p className="section-sub">Every property is personally reviewed and certified to meet SunnaStays standards.</p>
          <div className="stays-grid">
            {featuredStays.map(stay => <StayCard key={stay.id} stay={stay} />)}
          </div>
          <div className="stays-cta">
            <button className="btn-secondary" onClick={() => navigate('/search')}>View all stays →</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="container">
          <div className="section-label">How it works</div>
          <h2>Simple, <em>trusted,</em> halal</h2>
          <p className="section-sub how-sub">Booking a stay that aligns with your values shouldn't be complicated.</p>
          <div className="how-arabic">ابحث · احجز · استمتع</div>
          <div className="how-grid">
            {[
              { n:'01', title:'Search & filter', desc:'Browse halal-certified stays globally by destination, dates, and number of guests. Every listing verified before going live.' },
              { n:'02', title:'Book with confidence', desc:"Every property comes with our SunnaStays Halal Guarantee. No hidden surprises — what you see is exactly what you get." },
              { n:'03', title:'Arrive & enjoy', desc:"Check in to a space that respects your lifestyle. Prayer facilities, halal kitchen standards — it's all taken care of." },
            ].map(h => (
              <div key={h.n} className="how-card">
                <div className="how-num">{h.n}</div>
                <div className="how-title">{h.title}</div>
                <div className="how-desc">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMISE */}
      <section className="promise-section">
        <div className="container">
          <div className="section-label">The SunnaStays Promise</div>
          <h2>Your values, <em>our standard</em></h2>
          <p className="section-sub">We don't just list properties. We certify them.</p>
          <div className="promise-grid">
            {PROMISE.map(p => (
              <div key={p.title} className="promise-card">
                <div className="promise-icon">{p.icon}</div>
                <div className="promise-title">{p.title}</div>
                <div className="promise-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-label">Guest voices</div>
          <h2>Stories from our <em>community</em></h2>
          <div className="test-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="test-card">
                <div className="test-quote">"</div>
                <p className="test-text">{t.quote}</p>
                <div className="test-author">
                  <div className="test-avatar">{t.emoji}</div>
                  <div>
                    <div className="test-name">{t.name}</div>
                    <div className="test-meta">{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="container cta-inner">
          <div className="section-label">For hosts</div>
          <h2>List your halal <em>property</em></h2>
          <p>Join a community of verified hosts and earn from guests who share your values.</p>
          <button className="btn-white" onClick={() => navigate('/host')}>Become a host →</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
