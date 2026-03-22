import React, { useState, useEffect } from 'react';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // เช็คตำแหน่งการเลื่อนหน้าจอ
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // ฟังก์ชันสำหรับเลื่อนขึ้นบนสุด
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {/* 
        ปุ่ม Scroll to Top สไตล์พรีเมียม 
        ใช้เทคนิค Backdrop blur พร้อม Transition การโผล่และโฮเวอร์ 
      */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full 
          bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 
          text-phayao-blue hover:text-phayao-gold hover:bg-slate-900 
          hover:border-slate-800 transition-all duration-300 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
};

export default ScrollToTopButton;
