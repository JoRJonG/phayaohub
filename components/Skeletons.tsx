import React from 'react';

// โครงสร้าง Skeleton สำหรับการโหลดข้อมูล 
// วางโครงแบบเดียวกับคอมโพเนนต์จริงเพื่อลด Layout Shift และเพิ่มความพรีเมียม

export const GuideSkeleton: React.FC = () => (
  <div className="rounded-lg overflow-hidden block bg-white border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4 bg-white border-t-0 border-gray-100 rounded-b-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-16 bg-green-100 rounded-full"></div>
        <div className="h-3 w-10 bg-gray-200 rounded"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

export const ProductSkeleton: React.FC = () => (
  <div className="rounded-lg overflow-hidden bg-white border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 w-16 bg-blue-100 rounded-full"></div>
        <div className="h-3 w-10 bg-gray-200 rounded"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-full mb-3 mt-1"></div>
      <div className="flex justify-between items-center mt-2">
        <div className="h-5 w-16 bg-yellow-100 rounded"></div>
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export const JobSkeleton: React.FC = () => (
  <div className="flex justify-between items-start border-b border-gray-100 pb-3 p-2 animate-pulse">
    <div className="w-full">
      <div className="h-5 bg-gray-200 rounded w-1/2 mb-1.5"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 bg-amber-50 rounded"></div>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="h-5 w-20 bg-green-100 rounded flex-shrink-0 mt-1"></div>
  </div>
);

export const PostSkeleton: React.FC = () => (
  <div className="pb-3 border-b border-gray-100 p-2 animate-pulse">
    <div className="flex items-center gap-2 mb-1">
      <div className="h-4 w-12 bg-blue-100 rounded-full"></div>
      <div className="h-3 w-20 bg-gray-200 rounded"></div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-full mb-2 mt-2"></div>
    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
    <div className="flex gap-4 mt-2">
      <div className="h-3 w-8 bg-gray-200 rounded"></div>
      <div className="h-3 w-8 bg-gray-200 rounded"></div>
      <div className="h-3 w-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);
