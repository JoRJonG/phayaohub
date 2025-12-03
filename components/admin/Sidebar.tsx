import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Briefcase,
    MessageSquare,
    LogOut,
    Menu,
    X,
    MapPin,
    Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }> = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            logout();
            navigate('/login');
        }
    };

    const menuItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'ภาพรวม' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'จัดการผู้ใช้' },
        { path: '/admin/market-items', icon: <ShoppingBag size={20} />, label: 'จัดการสินค้า' },
        { path: '/admin/jobs', icon: <Briefcase size={20} />, label: 'จัดการงาน' },
        { path: '/admin/posts', icon: <MessageSquare size={20} />, label: 'จัดการโพสต์' },
        { path: '/admin/guides', icon: <MapPin size={20} />, label: 'กิน-เที่ยว-พัก' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'ตั้งค่าเว็บไซต์' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                        <NavLink to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition">
                            <span className="text-phayao-gold">Phayao</span>
                            <span>Admin</span>
                        </NavLink>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        end={item.path === '/admin'}
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                      ${isActive
                                                ? 'bg-phayao-blue text-white shadow-lg shadow-phayao-blue/20'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }
                    `}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
