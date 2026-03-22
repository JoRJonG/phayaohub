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
    <div className="relative h-[500px] w-full bg-gray-900 overflow-hidden">
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

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-phayao-blue/90 to-transparent"></div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          รวมทุกเรื่องราว.. <span className="text-phayao-gold">เพื่อชาวพะเยา</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
          หางาน หาที่เที่ยว ซื้อขายของ หรือพูดคุยแลกเปลี่ยน ครบจบในที่เดียว
        </p>

        {/* Search Bar with Autocomplete */}
        <div className="w-full max-w-lg">
          <SearchBar placeholder="ค้นหา… งาน, ที่พัก, ของกิน, สินค้า" />
        </div>

        {/* Quick Tags */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/jobs"
            className="px-3 py-1 bg-white/20 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-phayao-blue backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #งานว่าง
          </Link>
          <Link
            to="/market"
            className="px-3 py-1 bg-white/20 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-phayao-blue backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #ของมือสอง
          </Link>
          <Link
            to="/guide"
            className="px-3 py-1 bg-white/20 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-phayao-blue backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #คาเฟ่
          </Link>
          <Link
            to="/guide"
            className="px-3 py-1 bg-white/20 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-phayao-blue backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #ที่พัก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;