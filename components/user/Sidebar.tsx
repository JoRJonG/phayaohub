import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Briefcase,
    MessageSquare,
    LogOut,
    X,
    Home,
    FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserSidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }> = ({ isOpen, setIsOpen }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            logout();
            navigate('/login');
        }
    };

    const menuItems = [
        { path: '/user', icon: <LayoutDashboard size={20} />, label: 'ภาพรวม' },
        { path: '/user/market-items', icon: <ShoppingBag size={20} />, label: 'สินค้าของฉัน' },
        { path: '/user/jobs', icon: <Briefcase size={20} />, label: 'งานที่ลงประกาศ' },
        { path: '/user/deposit-resume', icon: <FileText size={20} />, label: 'ฝากประวัติงาน' },
        { path: '/user/posts', icon: <MessageSquare size={20} />, label: 'โพสต์ของฉัน' },
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
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 text-slate-600 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 font-bold text-xl text-phayao-blue">
                            <span>Phayao Hub</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-slate-600"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* User Profile Summary */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${!user?.avatar_url ? 'bg-phayao-blue/10 text-phayao-blue font-bold' : ''}`}>
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    (user?.full_name || 'U').charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-medium text-slate-800 truncate">{user?.full_name || 'ผู้ใช้งาน'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        end={item.path === '/user'}
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                      ${isActive
                                                ? 'bg-phayao-blue text-white shadow-md shadow-blue-500/20'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }
                    `}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                            <div className="my-4 border-t border-slate-100 mx-3"></div>
                            <li>
                                <NavLink
                                    to="/"
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Home size={20} />
                                    <span className="font-medium">กลับหน้าหลัก</span>
                                </NavLink>
                            </li>
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

export default UserSidebar;
