import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export const authMiddleware = async (req, res, next) => {
    try {
        // ดึง token จาก header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'ไม่พบ token การยืนยันตัวตน'
            });
        }

        const token = authHeader.substring(7); // ตัด "Bearer " ออก

        // ตรวจสอบ token
        const decoded = jwt.verify(token, JWT_SECRET);

        // เพิ่มข้อมูล user ใน request
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            status: decoded.status
        };

        // Check if user is suspended
        if (decoded.status === 'suspended') {
            return res.status(403).json({
                success: false,
                error: 'บัญชีของคุณถูกระงับการใช้งาน'
            });
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่'
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Token ไม่ถูกต้อง'
        });
    }
};

// Middleware สำหรับตรวจสอบว่าเป็น admin
export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'ไม่มีสิทธิ์เข้าถึง'
        });
    }
    next();
};

// Middleware แบบไม่บังคับ (ถ้ามี token ก็เก็บ user info, ถ้าไม่มีก็ผ่านไป)
export const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
            };
        }
        next();
    } catch (error) {
        // ถ้า token ไม่ถูกต้อง หรือหมดอายุ ก็แค่ปล่อยผ่านไปโดยไม่มี req.user
        next();
    }
};
