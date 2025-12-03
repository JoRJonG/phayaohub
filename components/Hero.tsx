import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Detect search intent and navigate to appropriate page
    const term = searchTerm.toLowerCase();
    
    if (term.includes('งาน') || term.includes('job') || term.includes('สมัคร')) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm)}`);
    } else if (term.includes('ซื้อ') || term.includes('ขาย') || term.includes('ของ')) {
      navigate(`/market?search=${encodeURIComponent(searchTerm)}`);
    } else if (term.includes('ที่เที่ยว') || term.includes('คาเฟ') || term.includes('ร้านอาหาร') || term.includes('ที่พัก')) {
      navigate(`/guides?search=${encodeURIComponent(searchTerm)}`);
    } else if (term.includes('คุย') || term.includes('แชร์') || term.includes('โพส')) {
      navigate(`/community?search=${encodeURIComponent(searchTerm)}`);
    } else {
      // Default to market search
      navigate(`/market?search=${encodeURIComponent(searchTerm)}`);
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

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-lg relative">
          <input
            type="text"
            className="w-full py-4 pl-6 pr-12 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-phayao-gold/50 shadow-xl"
            placeholder="ค้นหา... งาน, ที่พัก, ของกิน"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 h-10 w-10 bg-phayao-blue rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

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
            onClick={() => navigate('/guides')}
            className="px-3 py-1 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-sm text-white cursor-pointer transition"
          >
            #คาเฟ่
          </span>
          <span
            onClick={() => navigate('/guides')}
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