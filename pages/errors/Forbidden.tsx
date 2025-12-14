import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Forbidden: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-slate-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="text-center max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h1 className="text-5xl font-bold text-slate-800 mb-2">403</h1>
                    <h2 className="text-2xl font-semibold text-slate-700 mb-4">ไม่มีสิทธิ์เข้าถึง</h2>

                    <p className="text-slate-500 mb-8 leading-relaxed">
                        คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ หรือทรัพยากรนี้ถูกจำกัดสิทธิ์ไว้เฉพาะผู้ดูแลระบบเท่านั้น
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-phayao-blue hover:bg-blue-900 transition-colors duration-200 shadow-lg shadow-blue-900/20"
                        >
                            กลับสู่หน้าหลัก
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-colors duration-200"
                        >
                            เข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Forbidden;
