import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-phayao-gold mb-4">Phayao Hub</h3>
            <p className="text-sm">
              รวมทุกเรื่องราว.. เพื่อชาวพะเยา <br/>
              Connecting Phayao Community
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">เมนูลัด</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/market" className="hover:text-phayao-gold">ตลาดซื้อขาย</a></li>
              <li><a href="#/jobs" className="hover:text-phayao-gold">หางาน</a></li>
              <li><a href="#/guide" className="hover:text-phayao-gold">ท่องเที่ยว</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">ติดต่อเรา</h4>
            <p className="text-sm">
              Email: contact@phayaohub.com <br/>
              Facebook: Phayao Hub Official
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs">
          &copy; {new Date().getFullYear()} Phayao Hub. All rights reserved. (Demo)
        </div>
      </div>
    </footer>
  );
};

export default Footer;