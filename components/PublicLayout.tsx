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
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-phayao-sky/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-phayao-gold/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-phayao-blue/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
        <ScrollToTopButton />
      </div>
    </div>
  );
};

export default PublicLayout;
