import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  dataAdSlot?: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  dataAdSlot = '', 
  dataAdFormat = 'auto', 
  dataFullWidthResponsive = true,
  className = ''
}) => {
  const isDev = import.meta.env.DEV; // Vite syntax to check if development
  const isLoaded = useRef(false);

  useEffect(() => {
    // Prevent double pushing during strict mode in development
    if (isLoaded.current || isDev) return;
    
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      isLoaded.current = true;
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, [isDev]);

  if (isDev) {
    return (
      <div className={`bg-gray-200 border-2 border-dashed border-gray-400 text-gray-500 flex items-center justify-center min-h-[90px] rounded-lg ${className}`}>
        [AdSense Banner Placeholder - {dataAdSlot || 'Auto'}]
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-3876783163321611"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
    />
  );
};

export default AdBanner;
