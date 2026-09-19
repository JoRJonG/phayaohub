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
    <footer className="bg-white/80 backdrop-blur-md text-slate-600 py-12 sm:py-16 mt-auto border-t border-white/40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-10 gap-x-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="text-3xl font-bold text-phayao-blue mb-2 lg:mb-4">Phayao<span className="text-phayao-gold">Hub</span></h3>
            <p className="text-xs lg:text-sm text-slate-500 leading-relaxed max-w-xs">
              รวมทุกเรื่องราว… เพื่อชาวพะเยา <br />
              Connecting Phayao Community
            </p>
          </div>
          {/* Links Section (2 columns on mobile) */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-8">
            {/* Links 1 */}
            <div className="col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-[11px] sm:text-sm font-bold text-slate-900 mb-3 sm:mb-4 tracking-wider uppercase">บริการยอดนิยม</h4>
              <ul className="space-y-2 sm:space-y-3 text-[13px] sm:text-sm">
                <li><Link to="/market" className="text-slate-500 hover:text-phayao-blue transition-colors">ของมือสองพะเยา</Link></li>
                <li><Link to="/jobs" className="text-slate-500 hover:text-phayao-blue transition-colors">หางานในพะเยา</Link></li>
                <li><Link to="/guide" className="text-slate-500 hover:text-phayao-blue transition-colors">ที่เที่ยวพะเยา</Link></li>
                <li><Link to="/community" className="text-slate-500 hover:text-phayao-blue transition-colors">พูดคุย/เว็บบอร์ด</Link></li>
              </ul>
            </div>
            
            {/* Links 2 */}
            <div className="col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-[11px] sm:text-sm font-bold text-slate-900 mb-3 sm:mb-4 tracking-wider uppercase">ข้อมูลเพิ่มเติม</h4>
              <ul className="space-y-2 sm:space-y-3 text-[13px] sm:text-sm">
                <li><Link to="/guide" className="text-slate-500 hover:text-phayao-blue transition-colors">ร้านอาหารพะเยา</Link></li>
                <li><Link to="/guide" className="text-slate-500 hover:text-phayao-blue transition-colors">ที่พักพะเยา</Link></li>
                <li><Link to="/jobs/seekers" className="text-slate-500 hover:text-phayao-blue transition-colors">รายชื่อผู้หางาน</Link></li>
                <li><Link to="/map" className="text-slate-500 hover:text-phayao-blue transition-colors">แผนที่พะเยา</Link></li>
              </ul>
            </div>
          </div>
          {/* Contact */}
          <div className="col-span-1 flex flex-col h-full items-center lg:items-start text-center lg:text-left">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-4 tracking-wider uppercase">ติดต่อเรา</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Email: contact@phayaohub.com <br />
              Facebook: Phayao Hub Official
            </p>

            {visitorCount !== null && (
              <div className="mt-6 lg:mt-auto flex items-center justify-center lg:justify-start gap-3 bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 w-max hover:bg-slate-100 hover:border-slate-200 transition-all duration-300 group cursor-default shadow-minimal mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors tracking-wide">
                  สถิติการเข้าชม :
                </span>
                <span className="text-xs sm:text-sm font-bold text-phayao-blue font-mono tracking-wider transition-colors" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {new Intl.NumberFormat('th-TH').format(visitorCount)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-slate-100 mt-12 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Phayao Hub. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="#" className="hover:text-phayao-blue transition-colors">นโยบายความเป็นส่วนตัว</Link>
            <Link to="#" className="hover:text-phayao-blue transition-colors">เงื่อนไขการใช้งาน</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;