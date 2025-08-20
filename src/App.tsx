import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MemberRegistration from './pages/MemberRegistration';
import MembersList from './pages/MembersList';
import SpecialRegistry from './pages/SpecialRegistry';
import Analytics from './pages/Analytics';
import MemberProfile from './pages/MemberProfile';
import EditMember from './pages/EditMember';
import DataPrivacy from './pages/DataPrivacy';

export default function App() {
  // You can delete this block if you’re not deploying to GitHub Pages anymore.
  React.useEffect(() => {
    if (window.location.search.includes('/?/')) {
      const redirect = window.location.search
        .replace('/?/', '/')
        .replace(/&/g, '?')
        .replace(/~and~/g, '&');
      window.history.replaceState(null, '', window.location.pathname + redirect + window.location.hash);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<MemberRegistration />} />
          <Route path="/members" element={<MembersList />} />
          <Route path="/members/:id" element={<MemberProfile />} />
          <Route path="/members/:id/edit" element={<EditMember />} />
          <Route path="/special-registry" element={<SpecialRegistry />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/privacy" element={<DataPrivacy />} />
        </Routes>
      </main>
    </div>
  );
}