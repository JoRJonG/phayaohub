import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

interface MarketItem {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category_name: string;
  seller_name: string;
  seller_full_name: string;
  primary_image: string;
  condition_type: string;
  status: string;
  view_count?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const Marketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [items, setItems] = useState<MarketItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [selectedCategory, currentPage, searchTerm]);

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=market');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let url = `/api/market-items?status=available&limit=${itemsPerPage}&offset=${offset}`;
      if (selectedCategory) {
        url += `&category_id=${selectedCategory}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Phayao Market <span className="text-phayao-gold text-lg font-normal">ตลาดซื้อขาย</span>
        </h1>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-phayao-blue focus:border-phayao-blue sm:text-sm rounded-md border"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {/* Search Box */}
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-phayao-blue focus:border-phayao-blue"
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition duration-200 overflow-hidden group">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    {item.primary_image ? (
                      <img
                        src={item.primary_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        ไม่มีรูปภาพ
                      </div>
                    )}
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {item.location || 'พะเยา'}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-phayao-blue bg-blue-50 px-2 py-0.5 rounded-full">
                        {item.category_name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {item.view_count || 0}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ผู้ขาย: {item.seller_full_name || item.seller_name}
                    </p>
                    <div className="flex justify-between items-end mt-3">
                      <span className="text-lg font-bold text-phayao-gold">
                        ฿{item.price.toLocaleString()}
                      </span>
                      <Link to={`/market/${item.id}`} className="text-xs bg-phayao-blue text-white px-3 py-1.5 rounded hover:bg-blue-800 transition">
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                ไม่พบสินค้าตามเงื่อนไขที่เลือก
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;