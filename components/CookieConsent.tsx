import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full hidden md:block">
                        <Cookie className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                            <Cookie className="text-blue-600 md:hidden" size={20} />
                            การใช้งานคุกกี้
                        </h3>
                        <p className="text-sm text-gray-600">
                            เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสบการณ์การใช้งานของคุณ และเก็บสถิติการเข้าชม
                            เพื่อให้เราสามารถปรับปรุงบริการให้ดียิ่งขึ้น
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm whitespace-nowrap"
                    >
                        ยอมรับทั้งหมด
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
