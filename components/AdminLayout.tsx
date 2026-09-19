import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './admin/Sidebar';
import Navbar from './Navbar';
import SEO from './SEO';

const AdminLayout: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // แสดง loading ขณะกำลังตรวจสอบ authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-phayao-sky/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob"></div>
                <div className="absolute top-1/2 -right-32 w-96 h-96 bg-phayao-gold/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <SEO title="Admin Panel | Phayao Hub" noindex={true} />
                <Navbar />
                
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {/* Top Header (Mobile Only) */}
                        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-4 justify-between">
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                                <span className="text-phayao-blue">Phayao</span>
                                <span className="text-phayao-gold">Admin</span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 text-slate-400 hover:text-phayao-blue hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                        </header>

                        {/* Content Area */}
                        <main className="flex-1 overflow-auto p-4 md:p-8">
                            <div className="max-w-[1440px] mx-auto">
                                <Outlet />
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
