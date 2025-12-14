/**
 * Session Manager
 * จัดการ session timeout สำหรับระบบ authentication
 * - Inactivity timeout: ออกจากระบบเมื่อไม่มีการใช้งานเกิน 30 นาที
 * - Absolute timeout: ออกจากระบบเมื่อปิดหน้าต่างแล้วเปิดใหม่เกิน 30 นาที
 */

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 นาที (milliseconds)
const LAST_ACTIVITY_KEY = 'lastActivityTime';
const LOGIN_TIME_KEY = 'loginTime';

/**
 * เริ่มต้น session เมื่อ login สำเร็จ
 */
export const initSession = (): void => {
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    localStorage.setItem(LOGIN_TIME_KEY, now.toString());
};

/**
 * อัปเดตเวลาการใช้งานล่าสุด
 */
export const updateActivity = (): void => {
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
};

/**
 * ตรวจสอบว่า session หมดอายุหรือไม่
 * @returns true ถ้า session หมดอายุ, false ถ้ายังไม่หมดอายุ
 */
export const checkSessionTimeout = (): boolean => {
    const lastActivityTime = localStorage.getItem(LAST_ACTIVITY_KEY);
    const loginTime = localStorage.getItem(LOGIN_TIME_KEY);

    // ถ้าไม่มีข้อมูล session ถือว่าหมดอายุ
    if (!lastActivityTime || !loginTime) {
        return true;
    }

    const now = Date.now();
    const lastActivity = parseInt(lastActivityTime, 10);
    const login = parseInt(loginTime, 10);

    // ตรวจสอบ inactivity timeout (ไม่มีการใช้งานเกิน 30 นาที)
    if (now - lastActivity > SESSION_TIMEOUT) {
        return true;
    }

    // ตรวจสอบ absolute timeout (ปิดหน้าต่างแล้วเปิดใหม่เกิน 30 นาที)
    // เช็คว่าถ้า lastActivity ห่างจาก login มากกว่า SESSION_TIMEOUT
    // แสดงว่าอาจปิดหน้าต่างไปแล้วเปิดใหม่
    if (now - login > SESSION_TIMEOUT) {
        return true;
    }

    return false;
};

/**
 * ล้างข้อมูล session
 */
export const clearSession = (): void => {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
};

/**
 * ดึงเวลาที่เหลือก่อน session หมดอายุ (milliseconds)
 * @returns เวลาที่เหลือ หรือ 0 ถ้าหมดอายุแล้ว
 */
export const getTimeUntilTimeout = (): number => {
    const lastActivityTime = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (!lastActivityTime) {
        return 0;
    }

    const now = Date.now();
    const lastActivity = parseInt(lastActivityTime, 10);
    const timeElapsed = now - lastActivity;
    const timeRemaining = SESSION_TIMEOUT - timeElapsed;

    return timeRemaining > 0 ? timeRemaining : 0;
};
