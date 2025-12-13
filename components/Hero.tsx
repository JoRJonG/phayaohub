import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url("${bgImage}")` }}
      ></div>

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
          <SearchBar placeholder="ค้นหา... งาน, ที่พัก, ของกิน, สินค้า" />
        </div>

        {/* Quick Tags */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span
            onClick={() => navigate('/jobs')}
            className="px-3 py-1 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #งานว่าง
          </span>
          <span
            onClick={() => navigate('/market')}
            className="px-3 py-1 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #ของมือสอง
          </span>
          <span
            onClick={() => navigate('/guide')}
            className="px-3 py-1 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #คาเฟ่
          </span>
          <span
            onClick={() => navigate('/guide')}
            className="px-3 py-1 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #ที่พัก
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero;