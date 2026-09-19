import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!token) {
            setError('ไม่พบข้อมูล Token ที่ใช้สำหรับรีเซ็ตรหัสผ่าน');
            return;
        }

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 8) {
            setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(password)) {
            setError('รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข');
            return;
        }

        setIsLoading(true);

        try {
            const message = await resetPassword(token, password);
            setSuccessMessage('เปลี่ยนรหัสผ่านสำเร็จ กำลังพากลับไปหน้าเข้าสู่ระบบ...');
            
            // รอ 3 วินาทีแล้วพากลับไปหน้า login
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            <SEO 
                title="ตั้งรหัสผ่านใหม่ | Phayao Hub" 
                description="ตั้งรหัสผ่านใหม่สำหรับบัญชี Phayao Hub ของคุณ" 
            />
            
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-phayao-blue flex-col justify-between p-12 text-white shadow-2xl z-10">
                {/* Decorative Mesh Gradient Background */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-tr from-phayao-sky via-blue-800 to-indigo-900 opacity-80 mix-blend-multiply"></div>
                <div className="absolute top-1/4 left-[-100px] w-[500px] h-[500px] bg-phayao-gold/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                
                <div className="relative z-10">
                    <Link to="/" className="inline-block transition-transform hover:scale-105 duration-300">
                        <span className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                            Phayao<span className="text-phayao-gold">Hub</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mb-12">
                    <h2 className="text-5xl font-bold mb-6 leading-tight drop-shadow-md">
                        ตั้งรหัสผ่านใหม่ <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-phayao-gold to-yellow-200">อย่างปลอดภัย</span>
                    </h2>
                    <p className="text-blue-100 text-lg font-light leading-relaxed mb-8 opacity-90">
                        กรุณาตั้งรหัสผ่านใหม่ที่ปลอดภัยและคาดเดาได้ยาก เพื่อปกป้องบัญชีของคุณ
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">ตั้งรหัสผ่านใหม่</h1>
                        <p className="text-gray-500">กรุณากรอกรหัสผ่านใหม่ที่ต้องการ</p>
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
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">
                                รหัสผ่านใหม่
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-phayao-blue transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="อย่างน้อย 8 ตัวอักษร"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 ml-1">
                                ยืนยันรหัสผ่านใหม่
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-phayao-blue transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                />
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 ml-1">
                            รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรพิมพ์เล็ก ตัวอักษรพิมพ์ใหญ่ และตัวเลข
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
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    'ตั้งรหัสผ่านใหม่'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
