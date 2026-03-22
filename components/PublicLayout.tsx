import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTopButton from './ScrollToTopButton';

const PublicLayout: React.FC = () => {
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('has_visited_session');
    if (!hasVisited) {
      fetch('/api/settings/visit', { method: 'POST' })
        .catch(err => console.error('Error recording visit:', err));
      sessionStorage.setItem('has_visited_session', 'true');
    }
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default PublicLayout;
