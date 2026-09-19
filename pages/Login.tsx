import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/';

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('session_expired') === 'true') {
            setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            <SEO 
                title="เข้าสู่ระบบ | Phayao Hub" 
                description="เข้าสู่ระบบ Phayao Hub เพื่อจัดการข้อมูล ประกาศขายของ หรือหางาน" 
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
                        เชื่อมต่อทุกเรื่องราว <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-phayao-gold to-yellow-200">ในพะเยา</span>
                    </h2>
                    <p className="text-blue-100 text-lg font-light leading-relaxed mb-8 opacity-90">
                        แพลตฟอร์มศูนย์รวมตลาดซื้อขาย งาน และแหล่งท่องเที่ยวสำหรับชาวพะเยาและผู้มาเยือน สร้างโอกาสและแบ่งปันเรื่องราวดีๆ ไปด้วยกัน
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-50/50 backdrop-blur-3xl overflow-y-auto">
                {/* Mobile Background Elements */}
                <div className="lg:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-phayao-sky/10 rounded-full blur-[60px] animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-phayao-gold/10 rounded-full blur-[60px] animate-blob" style={{ animationDelay: '2s' }}></div>
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับกลับมา</h1>
                        <p className="text-gray-500">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 ml-1">
                                ชื่อผู้ใช้หรืออีเมล
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-phayao-blue transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="กรอกชื่อผู้ใช้หรืออีเมล"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-1">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                    รหัสผ่าน
                                </label>
                                <Link to="/forgot-password" className="text-xs font-medium text-phayao-sky hover:text-phayao-blue transition-colors">
                                    ลืมรหัสผ่าน?
                                </Link>
                            </div>
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
                                    placeholder="กรอกรหัสผ่าน"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-phayao-blue hover:bg-blue-800 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-phayao-blue/30 hover:shadow-xl hover:shadow-phayao-blue/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        กำลังเข้าสู่ระบบ...
                                    </>
                                ) : (
                                    'เข้าสู่ระบบ'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-50 text-gray-500">หรือ</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 font-medium">
                            ยังไม่มีบัญชี?{' '}
                            <Link to="/register" className="text-phayao-blue hover:text-phayao-gold font-bold transition-colors">
                                สมัครสมาชิกตอนนี้
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
