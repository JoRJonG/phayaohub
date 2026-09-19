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
        { path: '/admin/job-seekers', icon: <Users size={20} />, label: 'จัดการคนหางาน' },
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
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-100 text-slate-600 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] lg:sticky lg:top-0
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                        <NavLink to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition">
                            <span className="text-phayao-blue">Phayao</span>
                            <span className="text-phayao-gold">Admin</span>
                        </NavLink>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-phayao-blue"
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
                      flex items-center gap-3 px-4 py-3 transition-all duration-200
                      ${isActive
                                                ? 'bg-blue-50/50 text-phayao-blue font-semibold border-r-4 border-phayao-blue'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-phayao-blue border-r-4 border-transparent'
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
                    <div className="p-4 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
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
