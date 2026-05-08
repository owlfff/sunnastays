import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Nav from './components/Nav';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Listing from './pages/Listing';
import HostOnboarding from './pages/HostOnboarding';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Admin from './pages/Admin';
import BookingSuccess from './pages/BookingSuccess';
import AccountPage from './pages/AccountPage';
import ReviewPage from './pages/ReviewPage';
import HostDashboard from './pages/HostDashboard';
import GuestDashboard from './pages/GuestDashboard';
import HalalCharter from './pages/HalalCharter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import HostAgreement from './pages/HostAgreement';
import CancellationPolicyPage from './pages/CancellationPolicyPage';
import About from './pages/About';
import Contact from './pages/Contact';
import ComingSoon from './pages/ComingSoon';
import './styles/global.css';

export default function App() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    localStorage.getItem('cookie_consent') === 'accepted'
  );

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    setAnalyticsEnabled(consent === 'accepted');
  }, []);

  return (
    <BrowserRouter>
      {analyticsEnabled && <Analytics />}
      <CookieBanner onConsent={setAnalyticsEnabled} />
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard/host"  element={<HostDashboard />} />
        <Route path="/dashboard/guest" element={<GuestDashboard />} />
        <Route path="*" element={
          <>
            <Nav />
            <Routes>
              <Route path="/"                    element={<Home />} />
              <Route path="/search"              element={<SearchResults />} />
              <Route path="/stays/:slug"         element={<Listing />} />
              <Route path="/host"                element={<HostOnboarding />} />
              <Route path="/signup"              element={<SignUp />} />
              <Route path="/signin"              element={<SignIn />} />
              <Route path="/booking-success"     element={<BookingSuccess />} />
              <Route path="/account"             element={<AccountPage />} />
              <Route path="/review"              element={<ReviewPage />} />
              <Route path="/halal-charter"       element={<HalalCharter />} />
              <Route path="/privacy"             element={<PrivacyPolicy />} />
              <Route path="/terms"               element={<TermsOfService />} />
              <Route path="/cookies"             element={<CookiePolicy />} />
              <Route path="/host-agreement"      element={<HostAgreement />} />
              <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
              <Route path="/about"               element={<About />} />
              <Route path="/contact"             element={<Contact />} />
              <Route path="/coming-soon"         element={<ComingSoon />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}
