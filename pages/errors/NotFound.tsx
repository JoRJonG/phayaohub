import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-slate-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="text-center max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                    <div className="mb-6 relative">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-6xl font-bold text-slate-800 mb-2">404</h1>
                        <h2 className="text-2xl font-semibold text-slate-700">ไม่พบหน้าที่คุณต้องการ</h2>
                    </div>

                    <p className="text-slate-500 mb-8 leading-relaxed">
                        ขออภัย หน้าที่คุณกำลังพยายามเข้าถึงอาจถูกลบออก เปลี่ยนชื่อ หรือไม่มีอยู่จริงในระบบ
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-phayao-blue hover:bg-blue-900 transition-colors duration-200 shadow-lg shadow-blue-900/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            กลับสู่หน้าหลัก
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-colors duration-200"
                        >
                            ย้อนกลับ
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
