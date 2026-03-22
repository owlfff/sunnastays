import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Listing from './pages/Listing';
import HostOnboarding from './pages/HostOnboarding';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/search"        element={<SearchResults />} />
        <Route path="/stays/:slug"   element={<Listing />} />
        <Route path="/host"          element={<HostOnboarding />} />
        {/* Catch-all → home */}
        <Route path="*"              element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
