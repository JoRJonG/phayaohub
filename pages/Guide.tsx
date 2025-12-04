import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

interface Guide {
  id: number;
  title: string;
  description?: string;
  content?: string;
  category: string;
  image_url?: string;
  is_featured: boolean;
  view_count: number;
}

const Guide: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, [activeCategory]);

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      let url = '/api/guides';
      if (activeCategory !== 'All') {
        url += `?category=${activeCategory}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setGuides(data.data);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'เที่ยว': return 'ที่เที่ยว';
      case 'พัก': return 'ที่พัก';
      case 'กิน': return 'ของกิน';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex justify-center space-x-2 mb-8 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'All', label: 'ทั้งหมด' },
            { id: 'เที่ยว', label: 'ที่เที่ยว' },
            { id: 'กิน', label: 'ของกิน' },
            { id: 'พัก', label: 'ที่พัก' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === tab.id
                ? 'bg-phayao-blue text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Places Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-blue"></div>
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>ไม่พบข้อมูล</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {guides.map((guide) => (
              <Link to={`/guide/${guide.id}`} key={guide.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col h-full block">
                <div className="w-full h-48">
                  {guide.image_url ? (
                    <img
                      src={guide.image_url}
                      alt={guide.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-amber-500 tracking-wide uppercase">
                        {getCategoryLabel(guide.category)}
                      </span>
                      {guide.is_featured && (
                        <span className="flex items-center text-sm text-yellow-400">
                          <Star size={16} fill="currentColor" />
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{guide.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{guide.description || guide.content}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {guide.view_count} ครั้ง
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Map Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">แผนที่พะเยา</h2>
            <p className="text-gray-500 mb-6">
              สำรวจสถานที่ท่องเที่ยว ร้านอาหาร และที่พักในจังหวัดพะเยาผ่านแผนที่แบบโต้ตอบ
              ค้นหาสถานที่ที่น่าสนใจและวางแผนการเดินทางของคุณได้ง่ายๆ
            </p>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 bg-phayao-blue text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition shadow-lg shadow-blue-900/20 font-medium"
            >
              <MapPin size={20} />
              เปิดแผนที่พะเยา
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;