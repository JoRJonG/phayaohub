import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, ShoppingBag, Briefcase, Users, MapPin, MessageCircle, User, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'หน้าแรก', path: '/', icon: Home },
    { name: 'ตลาดซื้อขาย', path: '/market', icon: ShoppingBag },
    { name: 'งานพะเยา', path: '/jobs', icon: Briefcase },
    { name: 'คนหางาน', path: '/jobs/seekers', icon: Users },
    { name: 'กิน-เที่ยว-พัก', path: '/guide', icon: MapPin },
    { name: 'Phayao Talk', path: '/community', icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white/60 backdrop-blur-xl text-slate-800 sticky top-0 z-50 border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2 rounded-lg">
              <span className="font-bold text-2xl tracking-tight text-phayao-blue">
                Phayao<span className="text-phayao-gold">Hub</span>
              </span>
            </Link>
          </div>
          <div className="hidden xl:block">
            <div className="ml-4 xl:ml-6 flex items-center space-x-0.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-2 xl:px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2 ${isActive(link.path)
                      ? 'bg-white/80 text-phayao-blue shadow-minimal border border-white/50'
                      : 'text-slate-600 hover:bg-white/60 hover:text-phayao-blue hover:-translate-y-0.5 hover:shadow-minimal border border-transparent'
                      }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">{link.name}</span>
                  </Link>
                );
              })}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative ml-4">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2"
                  >
                    <div className="w-9 h-9 rounded-full bg-phayao-gold text-phayao-blue flex items-center justify-center font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-white/30 transition-shadow">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" width={48} height={48} />
                      ) : (
                        (user?.full_name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="max-w-[120px] truncate">{user?.full_name || 'ผู้ใช้งาน'}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-phayao-gold text-phayao-blue flex items-center justify-center font-bold overflow-hidden">
                            {user?.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" width={48} height={48} />
                            ) : (
                              (user?.full_name || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{user?.full_name || 'ผู้ใช้งาน'}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-phayao-blue transition-colors"
                          >
                            <Settings size={18} className="flex-shrink-0" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link
                          to="/user"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-phayao-blue transition-colors"
                        >
                          <User size={18} className="flex-shrink-0" />
                          <span>จัดการข้อมูลส่วนตัว</span>
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={18} className="flex-shrink-0" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-100">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-phayao-blue hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2"
                  >
                    <User size={18} />
                    <span className="whitespace-nowrap">เข้าสู่ระบบ</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-sm font-semibold bg-phayao-blue/90 backdrop-blur-sm text-white hover:bg-phayao-blue hover:-translate-y-0.5 hover:shadow-lg hover:shadow-phayao-blue/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2"
                  >
                    <User size={18} />
                    <span className="whitespace-nowrap">สมัครสมาชิก</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-slate-50 inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-phayao-blue hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2"
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

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="xl:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-top duration-300" id="mobile-menu">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2 ${isActive(link.path)
                    ? 'bg-blue-50 text-phayao-blue shadow-minimal'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-phayao-blue'
                    }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <div className="border-t border-slate-100 pt-4 mt-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-3">
                  <div className="w-12 h-12 rounded-full bg-phayao-gold text-white flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      (user?.full_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 truncate">{user?.full_name || 'ผู้ใช้งาน'}</div>
                    <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 transition duration-200"
                  >
                    <Settings size={20} className="flex-shrink-0" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/user"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
                >
                  <User size={20} className="flex-shrink-0" />
                  <span>จัดการข้อมูลส่วนตัว</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition duration-200"
                >
                  <LogOut size={20} className="flex-shrink-0" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:bg-slate-50 transition-colors duration-200 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2"
                >
                  <User size={20} />
                  <span>เข้าสู่ระบบ</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold bg-phayao-blue text-white hover:bg-blue-800 transition-colors duration-200 shadow-minimal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phayao-blue focus-visible:ring-offset-2"
                >
                  <User size={20} />
                  <span>สมัครสมาชิก</span>
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