import React from 'react';
import useSWR from 'swr';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';
import AdBanner from '../components/AdBanner';
import { ProductSkeleton, GuideSkeleton, JobSkeleton, PostSkeleton } from '../components/Skeletons';
import { Briefcase, MessageCircle } from 'lucide-react';

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
  const { data: productsRes, isLoading: pLoad } = useSWR('featuredProducts', () => getFeaturedProducts());
  const { data: guidesRes, isLoading: gLoad } = useSWR('featuredGuides', () => getFeaturedGuides());
  const { data: jobsRes, isLoading: jLoad } = useSWR('latestJobs', () => getLatestJobs());
  const { data: postsRes, isLoading: poLoad } = useSWR('trendingPosts', () => getTrendingPosts());

  const featuredProducts: MarketItem[] = productsRes?.success ? productsRes.data : [];
  const featuredGuides: Guide[] = guidesRes?.success ? guidesRes.data : [];
  const latestJobs: Job[] = jobsRes?.success ? jobsRes.data : [];
  const trendingPosts: Post[] = postsRes?.success ? postsRes.data : [];
  
  const isLoading = pLoad || gLoad || jLoad || poLoad;

  const formatSalary = (job: Job) => {
    const formatter = new Intl.NumberFormat('th-TH');
    if (job.salary_min && job.salary_max) {
      return `฿${formatter.format(job.salary_min)}-${formatter.format(job.salary_max)}`;
    } else if (job.salary_min) {
      return `฿${formatter.format(job.salary_min)}+`;
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
    const rtf = new Intl.RelativeTimeFormat('th', { numeric: 'auto' });

    if (seconds < 60) return 'เมื่อสักครู่';
    if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute');
    if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
    return rtf.format(-Math.floor(seconds / 86400), 'day');
  };

  return (
    <div className="min-h-screen bg-transparent">
      <SEO 
        title="Phayao Hub | ศูนย์รวมของมือสองพะเยา ท่องเที่ยว และที่กินพะเยา" 
        description="ศูนย์รวมข้อมูลจังหวัดพะเยา แหล่งซื้อขายของมือสองพะเยา สินค้า OTOP แนะนำที่เที่ยวพะเยา และประกาศหางาน" 
      />
      <StructuredData 
        type="organization" 
        data={{ 
          name: 'Phayao Hub', 
          url: 'https://phayaohub.com/',
          description: 'คอมมิวนิตี้เพื่อชาวพะเยา แหล่งรวมข้อมูล ข่าวสาร ท่องเที่ยว และช้อปปิ้ง'
        }} 
      />
      <Hero />

      <section className="py-12 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

          <Link to="/market" className="group glass-panel p-6 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2">
            <div className="w-14 h-14 bg-blue-50/80 text-phayao-blue rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">ของมือสองพะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">ตลาด OTOP & ของใช้มือสอง</p>
          </Link>

          <Link to="/jobs" className="group glass-panel p-6 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 bg-amber-50/80 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">งานพะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">งานประจำ & Part-time</p>
          </Link>

          <Link to="/guide" className="group glass-panel p-6 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 bg-green-50/80 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">เที่ยวพะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">กิน เที่ยว พัก</p>
          </Link>

          <Link to="/map" className="group glass-panel p-6 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 aspect-square flex flex-col items-center justify-center text-center animate-fadeIn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 bg-purple-50/80 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800">แผนที่พะเยา</h3>
            <p className="text-slate-500 text-xs mt-1">แผนที่ท่องเที่ยว</p>
          </Link>

        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <AdBanner className="rounded-2xl overflow-hidden glass-panel" />
      </div>

      {/* Featured Guides (Eat-Travel-Stay) */}
      <section className="py-12 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">กิน-เที่ยว-พัก</h2>
            <Link to="/guide" className="text-slate-500 hover:text-phayao-blue hover:underline text-sm font-medium transition-colors">ดูทั้งหมด</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {gLoad ? (
              Array.from({ length: 4 }).map((_, i) => <GuideSkeleton key={`g-skel-${i}`} />)
            ) : featuredGuides.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 md:col-span-4 py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                ไม่มีสถานที่แนะนำในขณะนี้
              </div>
            ) : featuredGuides.map((guide) => (
              <Link to={`/guide/${guide.id}`} key={guide.id} className="rounded-2xl overflow-hidden glass-panel hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2">
                <div className="h-48 bg-slate-100/50 overflow-hidden">
                  {guide.image_url ? (
                    <img
                      src={guide.image_url}
                      alt={`ท่องเที่ยวพะเยา: ${guide.title}`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{guide.category}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {guide.view_count || 0}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg truncate text-slate-800">{guide.title}</h3>
                  <p className="text-slate-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">{guide.description || guide.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">สินค้าแนะนำ</h2>
            <Link to="/market" className="text-slate-500 hover:text-phayao-blue hover:underline text-sm font-medium transition-colors">ดูทั้งหมด</Link>
          </div>
          {pLoad ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={`p-skel-${i}`} />)}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              ไม่มีสินค้าแนะนำในขณะนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link to={`/market/${product.id}`} key={product.id} className="rounded-2xl overflow-hidden glass-panel hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2">
                  <div className="h-48 bg-slate-100/50 overflow-hidden">
                    {product.primary_image || product.image_url ? (
                      <img
                        src={product.primary_image || product.image_url}
                        alt={`ของมือสองพะเยา: ${product.title}`}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      {product.category_name && (
                        <span className="text-xs font-medium text-phayao-blue bg-blue-50 px-2.5 py-1 rounded-full">{product.category_name}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {product.view_count || 0}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg truncate text-slate-800">{product.title}</h3>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-phayao-gold font-bold text-lg">฿{new Intl.NumberFormat('th-TH').format(product.price)}</span>
                      {product.location && (
                        <span className="text-xs text-slate-500">{product.location}</span>
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
      <section className="py-12 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Jobs */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Phayao Jobs <span className="text-sm text-slate-400 font-normal ml-2 hidden sm:inline">งานพะเยา</span></h2>
              <Link to="/jobs" className="text-sm font-medium text-slate-500 hover:text-phayao-blue transition-colors">ดูทั้งหมด</Link>
            </div>
            <div className="space-y-1">
              {jLoad ? (
                Array.from({ length: 4 }).map((_, i) => <JobSkeleton key={`j-skel-${i}`} />)
              ) : latestJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                    <Briefcase size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">ยังไม่มีประกาศงานใหม่</h3>
                  <p className="text-sm text-slate-500 mb-5">รอติดตามอัพเดทตำแหน่งงานที่น่าสนใจเร็วๆ นี้</p>
                  <Link to="/jobs" className="text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 px-5 py-2.5 rounded-xl transition-colors">
                    ดูงานทั้งหมด
                  </Link>
                </div>
              ) : (
                latestJobs.map((job) => (
                  <Link to={`/jobs/${job.id}`} key={job.id} className="flex justify-between items-start border-b border-white/20 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0 hover:bg-white/40 transition-colors p-3 -mx-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2">
                    <div>
                      <h4 className="font-bold text-slate-800">{job.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{job.company_name}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium">{getJobTypeLabel(job.job_type)}</span>
                        {job.location && (
                          <span className="text-xs text-slate-400 py-0.5">{job.location}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400 py-0.5 ml-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {job.view_count || 0}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{formatSalary(job)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Community Feed */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <Link to="/community" className="group flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-phayao-blue transition-colors">Phayao Talk</h2>
              </Link>
              <Link to="/community" className="text-sm font-medium text-slate-500 hover:text-phayao-blue transition-colors">ดูทั้งหมด</Link>
            </div>
            <div className="space-y-1 flex-grow">
              {poLoad ? (
                Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={`po-skel-${i}`} />)
              ) : trendingPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full min-h-[200px]">
                  <div className="w-14 h-14 bg-blue-50 text-phayao-blue rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">ยังไม่มีกระทู้พูดคุย</h3>
                  <p className="text-sm text-slate-500 mb-5">มาเริ่มบทสนทนาแรกของวันนี้กันเถอะ</p>
                  <Link to="/community" className="text-sm font-medium text-phayao-blue bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-colors">
                    ตั้งกระทู้ใหม่
                  </Link>
                </div>
              ) : (
                trendingPosts.map((post) => (
                  <div key={post.id} className="pb-4 mb-4 border-b border-white/20 last:border-0 last:pb-0 last:mb-0 p-3 -mx-3 rounded-xl hover:bg-white/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white bg-phayao-blue">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-xs text-slate-400">{getTimeAgo(post.created_at)}</span>
                    </div>
                    <Link to={`/community/${post.id}`}>
                      <h4 className="font-bold text-slate-800 hover:text-phayao-blue transition-colors cursor-pointer line-clamp-2">{decodeHTML(post.title)}</h4>
                    </Link>
                    <div className="flex gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v7.333l-2 2.333A1.998 1.998 0 006 13.093z" /></svg>
                        {post.like_count || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                        {post.comment_count || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <Link to="/community" className="block w-full text-center bg-blue-50 text-phayao-blue py-2 rounded-lg hover:bg-phayao-blue hover:text-white transition font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2">
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