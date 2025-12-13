import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-phayao-gold mb-4">Phayao Hub</h3>
            <p className="text-sm">
              รวมทุกเรื่องราว.. เพื่อชาวพะเยา <br />
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
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">ติดต่อเรา</h4>
            <p className="text-sm">
              Email: contact@phayaohub.com <br />
              Facebook: Phayao Hub Official
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs">
          &copy; {new Date().getFullYear()} Phayao Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;