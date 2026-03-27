import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Nav from './components/Nav';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Listing from './pages/Listing';
import HostOnboarding from './pages/HostOnboarding';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Admin from './pages/Admin';
import BookingSuccess from './pages/BookingSuccess';
import HostDashboard from './pages/HostDashboard';
import GuestDashboard from './pages/GuestDashboard';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard/host"  element={<HostDashboard />} />
        <Route path="/dashboard/guest" element={<GuestDashboard />} />
        <Route path="*" element={
          <>
            <Nav />
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/search"      element={<SearchResults />} />
              <Route path="/stays/:slug" element={<Listing />} />
              <Route path="/host"        element={<HostOnboarding />} />
              <Route path="/signup"      element={<SignUp />} />
              <Route path="/signin"      element={<SignIn />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}
