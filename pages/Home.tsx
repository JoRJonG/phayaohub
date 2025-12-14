import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';

import { getFeaturedProducts, getFeaturedGuides, getLatestJobs, getTrendingPosts } from '../services/api';

interface MarketItem {
  id: number;
  title: string;
  price: number;
  image_url?: string;
  primary_image?: string;
  category_name?: string;
  location?: string;
  view_count?: number;
}

interface Job {
  id: number;
  title: string;
  company_name: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  view_count?: number;
}

interface Post {
  id: number;
  title: string;
  category: string;
  created_at: string;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
}

interface Guide {
  id: number;
  title: string;
  image_url?: string;
  category: string;
  slug: string;
  description?: string;
  content?: string;
  view_count?: number;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<MarketItem[]>([]);
  const [featuredGuides, setFeaturedGuides] = useState<Guide[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel for better performance
        const [productsRes, guidesRes, jobsRes, postsRes] = await Promise.all([
          getFeaturedProducts(),
          getFeaturedGuides(),
          getLatestJobs(),
          getTrendingPosts()
        ]);

        // Update state with fetched data
        if (productsRes.success) {
          setFeaturedProducts(productsRes.data);
        }
        if (guidesRes.success) {
          setFeaturedGuides(guidesRes.data);
        }
        if (jobsRes.success) {
          setLatestJobs(jobsRes.data);
        }
        if (postsRes.success) {
          setTrendingPosts(postsRes.data);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max) {
      return `฿${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}`;
    } else if (job.salary_min) {
      return `฿${job.salary_min.toLocaleString()}+`;
    }
    return 'ตามตกลง';
  };

  const getJobTypeLabel = (jobType: string) => {
    const labels: { [key: string]: string } = {
      'full_time': 'งานประจำ',
      'part_time': 'พาร์ทไทม์',
      'freelance': 'ฟรีแลนซ์',
      'contract': 'สัญญาจ้าง',
      'internship': 'ฝึกงาน'
    };
    return labels[jobType] || jobType;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'news': 'ข่าวสาร',
      'question': 'ถาม-ตอบ',
      'review': 'รีวิว',
      'event': 'กิจกรรม',
      'other': 'อื่นๆ'
    };
    return labels[category] || category;
  };

  const decodeHTML = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'เมื่อสักครู่';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Hero />

      {/* Quick Menu */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

          <Link to="/market" className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-14 h-14 bg-blue-50 text-phayao-blue rounded-full flex items-center justify-center mb-4 group-hover:bg-phayao-blue group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">ตลาดพะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">สินค้า OTOP & มือสอง</p>
          </Link>

          <Link to="/jobs" className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-phayao-gold group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">งานพะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">งานประจำ & Part-time</p>
          </Link>

          <Link to="/guide" className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">เที่ยวพะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">กิน เที่ยว พัก</p>
          </Link>

          <Link to="/map" className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">แผนที่พะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">แผนที่ท่องเที่ยว</p>
          </Link>

        </div>
      </section>

      {/* Featured Guides (Eat-Travel-Stay) */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-green-500 pl-3">กิน-เที่ยว-พัก</h2>
            <Link to="/guide" className="text-phayao-blue hover:underline text-sm">ดูทั้งหมด</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredGuides.map((guide) => (
              <Link to={`/guide/${guide.id}`} key={guide.id} className="rounded-lg overflow-hidden hover:shadow-xl transition-all duration-500 block group">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {guide.image_url ? (
                    <img
                      src={guide.image_url}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white border border-t-0 border-gray-100 rounded-b-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{guide.category}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {guide.view_count || 0}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg truncate text-gray-800">{guide.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">{guide.description || guide.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-phayao-gold pl-3">สินค้าแนะนำ</h2>
            <Link to="/market" className="text-phayao-blue hover:underline text-sm">ดูทั้งหมด</Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-blue"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link to={`/market/${product.id}`} key={product.id} className="rounded-lg overflow-hidden hover:shadow-xl transition-all duration-500 block bg-white group">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {product.primary_image || product.image_url ? (
                      <img
                        src={product.primary_image || product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      {product.category_name && (
                        <span className="text-xs font-semibold text-phayao-blue bg-blue-50 px-2 py-0.5 rounded-full">{product.category_name}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {product.view_count || 0}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-phayao-gold font-bold">฿{product.price.toLocaleString()}</span>
                      {product.location && (
                        <span className="text-xs text-gray-500">{product.location}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Jobs & Community */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Jobs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Phayao Jobs <span className="text-sm text-phayao-gold font-normal ml-1">งานพะเยา</span></h2>
              <Link to="/jobs" className="text-sm text-phayao-blue">ดูทั้งหมด</Link>
            </div>
            <div className="space-y-4">
              {latestJobs.length === 0 ? (
                <p className="text-center text-gray-500 py-4">ไม่มีงานใหม่</p>
              ) : (
                latestJobs.map((job) => (
                  <Link to={`/jobs/${job.id}`} key={job.id} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0 hover:bg-slate-50 transition p-2 rounded">
                    <div>
                      <h4 className="font-semibold text-gray-800">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.company_name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{getJobTypeLabel(job.job_type)}</span>
                        {job.location && (
                          <span className="text-xs text-gray-400">{job.location}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {job.view_count || 0}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600">{formatSalary(job)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Community Feed */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <Link to="/community" className="group flex items-center gap-2 hover:text-phayao-blue transition">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-phayao-blue">Phayao Talk</h2>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-phayao-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <Link to="/community" className="text-sm text-phayao-blue hover:underline">ดูทั้งหมด</Link>
            </div>
            <div className="space-y-4 flex-grow">
              {trendingPosts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">ไม่มีกระทู้</p>
              ) : (
                trendingPosts.map((post) => (
                  <div key={post.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0 p-2 rounded hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-white bg-blue-500">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-xs text-gray-400">{getTimeAgo(post.created_at)}</span>
                    </div>
                    <Link to={`/community/${post.id}`}>
                      <h4 className="font-medium text-gray-800 hover:text-phayao-blue cursor-pointer line-clamp-2">{decodeHTML(post.title)}</h4>
                    </Link>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v7.333l-2 2.333A1.998 1.998 0 006 13.093z" /></svg>
                        {post.like_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                        {post.comment_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.view_count || 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link to="/community" className="block w-full text-center bg-blue-50 text-phayao-blue py-2 rounded-lg hover:bg-phayao-blue hover:text-white transition font-medium">
                ไปที่เว็บบอร์ด
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;