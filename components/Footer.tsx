import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/settings/visitors')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVisitorCount(data.count);
        }
      })
      .catch(err => console.error('Error fetching visitor count:', err));
  }, []);
  return (
    <footer className="bg-slate-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-phayao-gold mb-4">Phayao Hub</h3>
            <p className="text-sm">
              รวมทุกเรื่องราว… เพื่อชาวพะเยา <br />
              Connecting Phayao Community
            </p>

          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">เมนูลัด</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/market" className="hover:text-phayao-gold transition-colors">ตลาดซื้อขาย</Link></li>
              <li><Link to="/jobs" className="hover:text-phayao-gold transition-colors">หางาน</Link></li>
              <li><Link to="/guide" className="hover:text-phayao-gold transition-colors">ท่องเที่ยว</Link></li>
              <li><Link to="/community" className="hover:text-phayao-gold transition-colors">เว็บบอร์ด</Link></li>
            </ul>
          </div>
          <div className="flex flex-col h-full">
            <h4 className="text-lg font-semibold text-white mb-4">ติดต่อเรา</h4>
            <p className="text-sm">
              Email: contact@phayaohub.com <br />
              Facebook: Phayao Hub Official
            </p>
            
            {/* ย้ายกลับมาอยู่ใต้ส่วนติดต่อเราฝั่งขวามือ ตามที่คุณต้องการ */}
            {visitorCount !== null && (
              <div className="mt-8 lg:mt-auto flex items-center gap-3 bg-slate-800/40 border border-white/5 rounded-full px-5 py-2 w-max shadow-sm backdrop-blur-md hover:bg-slate-800/70 hover:border-phayao-gold/30 transition-all duration-300 group cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></span>
                </span>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors tracking-wide">
                  สถิติการเข้าชมเว็บไซต์ :
                </span>
                <span className="text-sm font-bold text-phayao-gold/90 font-mono tracking-wider drop-shadow-sm group-hover:text-phayao-gold transition-colors" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {new Intl.NumberFormat('th-TH').format(visitorCount)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 pb-2 text-center text-slate-500 text-xs">
          &copy; {new Date().getFullYear()} Phayao Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;