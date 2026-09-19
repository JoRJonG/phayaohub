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
    <footer className="bg-white text-slate-600 py-12 mt-auto border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-phayao-blue mb-4">Phayao<span className="text-phayao-gold">Hub</span></h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              รวมทุกเรื่องราว… เพื่อชาวพะเยา <br />
              Connecting Phayao Community
            </p>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800 mb-4 tracking-tight">บริการยอดนิยม</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/market" className="hover:text-phayao-blue transition-colors">ของมือสองพะเยา</Link></li>
              <li><Link to="/jobs" className="hover:text-phayao-blue transition-colors">หางานในพะเยา</Link></li>
              <li><Link to="/guide" className="hover:text-phayao-blue transition-colors">ที่เที่ยวพะเยา</Link></li>
              <li><Link to="/community" className="hover:text-phayao-blue transition-colors">พูดคุย/เว็บบอร์ด</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800 mb-4 tracking-tight">ข้อมูลเพิ่มเติม</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/guide" className="hover:text-phayao-blue transition-colors">ร้านอาหารพะเยา</Link></li>
              <li><Link to="/guide" className="hover:text-phayao-blue transition-colors">ที่พักพะเยา</Link></li>
              <li><Link to="/jobs/seekers" className="hover:text-phayao-blue transition-colors">รายชื่อผู้หางาน</Link></li>
              <li><Link to="/map" className="hover:text-phayao-blue transition-colors">แผนที่พะเยา</Link></li>
            </ul>
          </div>
          <div className="flex flex-col h-full">
            <h4 className="text-base font-bold text-slate-800 mb-4 tracking-tight">ติดต่อเรา</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Email: contact@phayaohub.com <br />
              Facebook: Phayao Hub Official
            </p>

            {visitorCount !== null && (
              <div className="mt-8 lg:mt-auto flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 w-max hover:bg-slate-100 hover:border-slate-200 transition-all duration-300 group cursor-default shadow-minimal">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></span>
                </span>
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors tracking-wide">
                  สถิติการเข้าชม :
                </span>
                <span className="text-sm font-bold text-phayao-blue font-mono tracking-wider transition-colors" style={{ fontVariantNumeric: 'tabular-nums' }}>
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