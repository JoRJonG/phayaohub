import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'ตลาดซื้อขาย', path: '/market' },
    { name: 'งานพะเยา', path: '/jobs' },
    { name: 'คนหางาน', path: '/jobs/seekers' },
    { name: 'กิน-เที่ยว-พัก', path: '/guide' },
    { name: 'Phayao Talk', path: '/community' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-phayao-blue text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="font-bold text-2xl tracking-tight text-phayao-gold">
                Phayao<span className="text-white">Hub</span>
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                    ? 'bg-blue-800 text-phayao-gold'
                    : 'hover:bg-blue-800 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative ml-3">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-phayao-gold text-phayao-blue flex items-center justify-center font-bold overflow-hidden">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        (user?.full_name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span>{user?.full_name || 'ผู้ใช้งาน'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user?.full_name || 'ผู้ใช้งาน'}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🔧 Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/user"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        จัดการข้อมูลส่วนตัว
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-phayao-gold text-phayao-blue hover:bg-yellow-400 transition-colors"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-blue-800 inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                  ? 'bg-blue-900 text-phayao-gold'
                  : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <div className="border-t border-blue-700 pt-4 mt-4">
                <div className="px-3 py-2 text-sm text-gray-300">
                  <div className="font-medium">{user?.full_name || 'ผู้ใช้งาน'}</div>
                  <div className="text-xs">{user?.email}</div>
                </div>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-700 hover:text-white"
                  >
                    🔧 Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/user"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-700 hover:text-white"
                >
                  จัดการข้อมูลส่วนตัว
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-700 hover:text-white"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="border-t border-blue-700 pt-4 mt-4 space-y-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-700 hover:text-white"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-phayao-gold text-phayao-blue hover:bg-yellow-400"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;