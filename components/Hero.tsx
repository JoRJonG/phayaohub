import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = React.useState('');

  React.useEffect(() => {
    // Check local storage first
    const cachedBg = localStorage.getItem('hero_bg_url');
    if (cachedBg) {
      setBgImage(cachedBg);
    }
    fetchBgImage();
  }, []);

  const fetchBgImage = async () => {
    try {
      const response = await fetch('/api/settings/hero-bg');
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setBgImage(data.imageUrl);
        localStorage.setItem('hero_bg_url', data.imageUrl);
      }
    } catch (error) {
      console.error('Error fetching hero bg:', error);
    }
  };

  return (
    <div className="relative min-h-[400px] md:h-[500px] w-full bg-slate-900 overflow-hidden">
      {/* Background Image - Simulating Kwan Phayao Sunset */}
      {bgImage && (
        <img
          src={bgImage}
          alt="บรรยากาศกว๊านพะเยา ยามเย็น - Phayao Hub ศูนย์รวมคนพะเยา"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          fetchPriority="high"
          decoding="async"
          width="1920"
          height="500"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 py-12 md:py-0">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight leading-tight">
          รวมทุกเรื่องราว <span className="text-phayao-gold block sm:inline">เพื่อชาวพะเยา</span>
        </h1>
        <p className="text-base md:text-xl text-slate-200 mb-8 md:mb-10 max-w-xl font-light px-2">
          หางาน หาที่เที่ยว ซื้อขายของ หรือพูดคุยแลกเปลี่ยน ครบจบในที่เดียว
        </p>

        {/* Search Bar with Autocomplete */}
        <div className="w-full max-w-lg">
          <SearchBar placeholder="ค้นหา… งาน, ที่พัก, ของกิน, สินค้า" />
        </div>

        {/* Quick Tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/jobs"
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            #งานว่าง
          </Link>
          <Link
            to="/market"
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            #ของมือสอง
          </Link>
          <Link
            to="/guide"
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            #คาเฟ่
          </Link>
          <Link
            to="/guide"
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            #ที่พัก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;