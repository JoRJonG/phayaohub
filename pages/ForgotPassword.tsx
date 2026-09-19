import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { forgotPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            await forgotPassword(email);
            setSuccessMessage('เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ');
            setEmail('');
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถดำเนินการได้ในขณะนี้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            <SEO 
                title="ลืมรหัสผ่าน | Phayao Hub" 
                description="รีเซ็ตรหัสผ่านบัญชี Phayao Hub ของคุณ" 
            />
            
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-phayao-blue flex-col justify-between p-12 text-white shadow-2xl z-10">
                {/* Decorative Mesh Gradient Background */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-phayao-blue via-blue-800 to-indigo-900 opacity-80 mix-blend-multiply"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-phayao-sky/40 rounded-full mix-blend-screen filter blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-phayao-gold/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
                
                <div className="relative z-10">
                    <Link to="/" className="inline-block transition-transform hover:scale-105 duration-300">
                        <span className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                            Phayao<span className="text-phayao-gold">Hub</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mb-12">
                    <h2 className="text-5xl font-bold mb-6 leading-tight drop-shadow-md">
                        กู้คืนบัญชี <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-phayao-gold to-yellow-200">ของคุณ</span>
                    </h2>
                    <p className="text-blue-100 text-lg font-light leading-relaxed mb-8 opacity-90">
                        ไม่ต้องกังวล หากคุณลืมรหัสผ่าน เพียงกรอกอีเมลที่ใช้สมัครบัญชี เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณทันที
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-50/50 backdrop-blur-3xl overflow-y-auto py-10">
                {/* Mobile Background Elements */}
                <div className="lg:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-phayao-sky/10 rounded-full blur-[60px] animate-blob"></div>
                </div>

                <div className="max-w-md w-full px-6 py-12 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                        <div className="lg:hidden mb-8">
                            <Link to="/" className="inline-block">
                                <span className="text-3xl font-bold tracking-tight text-phayao-blue">
                                    Phayao<span className="text-phayao-gold">Hub</span>
                                </span>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">ลืมรหัสผ่าน</h1>
                        <p className="text-gray-500">กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-md border-l-4 border-red-500 rounded-r-xl shadow-sm animate-in slide-in-from-left-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-8 p-4 bg-green-50/80 backdrop-blur-md border-l-4 border-green-500 rounded-r-xl shadow-sm animate-in slide-in-from-left-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-700 text-sm font-medium leading-relaxed">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
                                อีเมล
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-phayao-blue transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="กรอกอีเมลของคุณ"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !!successMessage}
                                className="w-full bg-phayao-blue hover:bg-blue-800 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-phayao-blue/30 hover:shadow-xl hover:shadow-phayao-blue/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        กำลังส่งลิงก์...
                                    </>
                                ) : (
                                    'ส่งลิงก์รีเซ็ตรหัสผ่าน'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-gray-500 hover:text-phayao-blue font-medium transition-colors inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
