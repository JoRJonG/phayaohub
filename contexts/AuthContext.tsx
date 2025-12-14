import React, { createContext, useContext, useState, useEffect } from 'react';
import { initSession, updateActivity, checkSessionTimeout, clearSession } from '../utils/sessionManager';

interface User {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // โหลด token จาก localStorage เมื่อเริ่มต้น
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            // ตรวจสอบ session timeout ก่อน
            if (checkSessionTimeout()) {
                // Session หมดอายุ - ล้างข้อมูลและ logout
                localStorage.removeItem('token');
                clearSession();
                setIsLoading(false);
                // Redirect ไปหน้า login พร้อมแจ้งเตือน
                window.location.href = '/login?session_expired=true';
            } else {
                setToken(savedToken);
                fetchCurrentUser(savedToken);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    // ตรวจสอบ session timeout ทุก 1 นาที
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            if (checkSessionTimeout()) {
                logout();
                window.location.href = '/login?session_expired=true';
            }
        }, 60000); // ตรวจสอบทุก 1 นาที

        return () => clearInterval(interval);
    }, [user]);

    // Track user activity
    useEffect(() => {
        if (!user) return;

        const handleActivity = () => {
            updateActivity();
        };

        // ฟัง events ที่แสดงว่ามี user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [user]);

    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const fetchCurrentUser = async (authToken: string) => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                // Token ไม่ถูกต้องหรือหมดอายุ
                localStorage.removeItem('token');
                setToken(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    // เข้าสู่ระบบ
    const login = async (username: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            // เริ่มต้น session
            initSession();
        } catch (error) {
            throw error;
        }
    };

    // สมัครสมาชิก
    const register = async (userData: RegisterData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            // เริ่มต้น session
            initSession();
        } catch (error) {
            throw error;
        }
    };

    // ออกจากระบบ
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        // ล้างข้อมูล session
        clearSession();
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
