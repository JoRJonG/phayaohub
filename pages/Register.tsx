import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.username.length < 3 || formData.username.length > 20) {
            setError('ชื่อผู้ใช้ต้องมีความยาว 3-20 ตัวอักษร');
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(formData.username)) {
            setError('ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (formData.password.length < 8) {
            setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(formData.password)) {
            setError('รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข');
            return;
        }

        setIsLoading(true);

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone || undefined
            });
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.message || 'สมัครสมาชิกไม่สำเร็จ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            <SEO 
                title="สมัครสมาชิก | Phayao Hub" 
                description="ร่วมเป็นส่วนหนึ่งของชุมชนพะเยา สมัครเพื่อประกาศขายของ หางาน และร่วมพูดคุย" 
            />
            
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-phayao-blue flex-col justify-between p-12 text-white shadow-2xl z-10">
                {/* Decorative Mesh Gradient Background */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-tr from-indigo-900 via-blue-800 to-phayao-sky opacity-80 mix-blend-multiply"></div>
                <div className="absolute top-1/4 left-[-100px] w-[500px] h-[500px] bg-phayao-gold/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                <div className="absolute bottom-10 right-[-100px] w-[600px] h-[600px] bg-phayao-sky/40 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
                
                <div className="relative z-10">
                    <Link to="/" className="inline-block transition-transform hover:scale-105 duration-300">
                        <span className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                            Phayao<span className="text-phayao-gold">Hub</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mb-12">
                    <h2 className="text-5xl font-bold mb-6 leading-tight drop-shadow-md">
                        เริ่มต้นเรื่องราว <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-phayao-gold to-yellow-200">ของคุณกับเรา</span>
                    </h2>
                    <p className="text-blue-100 text-lg font-light leading-relaxed mb-8 opacity-90">
                        สมัครสมาชิกวันนี้เพื่อเข้าร่วมชุมชนพะเยา คุณสามารถโพสต์ขายของ หางาน รีวิวสถานที่ท่องเที่ยว และพูดคุยกับผู้คนในจังหวัดพะเยา
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-5 h-5 text-phayao-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-blue-100 font-medium">ประกาศขายของได้ฟรีไม่มีค่าใช้จ่าย</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-5 h-5 text-phayao-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-blue-100 font-medium">สร้างโปรไฟล์หางานให้ผู้ประกอบการเห็น</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-5 h-5 text-phayao-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-blue-100 font-medium">ร่วมพูดคุยและรีวิวใน Phayao Talk</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center relative bg-slate-50/50 backdrop-blur-3xl overflow-y-auto py-10">
                {/* Mobile Background Elements */}
                <div className="lg:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-phayao-sky/10 rounded-full blur-[60px] animate-blob"></div>
                </div>

                <div className="max-w-xl w-full px-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-8">
                        <div className="lg:hidden mb-6">
                            <Link to="/" className="inline-block">
                                <span className="text-3xl font-bold tracking-tight text-phayao-blue">
                                    Phayao<span className="text-phayao-gold">Hub</span>
                                </span>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้างบัญชีผู้ใช้ใหม่</h1>
                        <p className="text-gray-500">กรอกข้อมูลด้านล่างเพื่อเข้าร่วมชุมชนพะเยาฮับ</p>
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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 ml-1">
                                    ชื่อผู้ใช้ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="ภาษาอังกฤษ/ตัวเลข"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
                                    อีเมล <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 ml-1">
                                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="กรอกชื่อ-นามสกุล"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 ml-1">
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="0xx-xxx-xxxx"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">
                                    รหัสผ่าน <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="อย่างน้อย 8 ตัวอักษร"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 ml-1">
                                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-phayao-blue/10 focus:border-phayao-blue focus:bg-white transition-all shadow-sm outline-none text-gray-800"
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                />
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 ml-1">
                            รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรพิมพ์เล็ก ตัวอักษรพิมพ์ใหญ่ และตัวเลข
                        </div>

                        <div className="pt-4">
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
                                        กำลังสร้างบัญชี...
                                    </>
                                ) : (
                                    'สมัครสมาชิก'
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
                            มีบัญชีอยู่แล้ว?{' '}
                            <Link to="/login" className="text-phayao-blue hover:text-phayao-gold font-bold transition-colors">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
