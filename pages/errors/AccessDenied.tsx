import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AccessDenied: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-slate-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="text-center max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-red-100">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 mb-3">การเข้าถึงถูกระงับ</h1>

                    <p className="text-slate-500 mb-8 leading-relaxed">
                        บัญชีของคุณถูกระงับการใช้งานชั่วคราว หรือ IP ของคุณถูกบล็อกเนื่องจากพฤติกรรมที่น่าสงสัย<br />
                        <span className="text-sm mt-2 block text-slate-400">หากคุณคิดว่านี่เป็นข้อผิดพลาด โปรดติดต่อผู้ดูแลระบบ</span>
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100">
                        <p className="text-sm text-slate-600 font-medium">Contact Support</p>
                        <a href="mailto:support@phayaohub.com" className="text-phayao-blue hover:text-blue-700 font-semibold">
                            support@phayaohub.com
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AccessDenied;
