import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authLimiter, validate, registerValidation, loginValidation, changePasswordValidation } from '../middleware/securityMiddleware.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SALT_ROUNDS = 10;

// สมัครสมาชิก
router.post('/register', authLimiter, validate(registerValidation), async (req, res, next) => {
    try {
        const { username, email, password, full_name, phone } = req.body;

        // ตรวจสอบว่า username หรือ email ซ้ำหรือไม่
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว'
            });
        }

        // เข้ารหัสรหัสผ่าน
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // บันทึกข้อมูลผู้ใช้
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, full_name || null, phone || null, 'user']
        );

        // สร้าง JWT token
        const token = jwt.sign(
            {
                userId: result.insertId,
                username,
                email,
                role: 'user'
            },
            JWT_SECRET,
            { expiresIn: '24h' } // ลดเหลือ 24 ชม. เพื่อความปลอดภัย
        );

        res.json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จ',
            token,
            user: {
                id: result.insertId,
                username,
                email,
                full_name: full_name || null,
                phone: phone || null,
                role: 'user'
            }
        });
    } catch (error) {
        logger.error('Register error', error);
        next(error);
    }
});

// เข้าสู่ระบบ
router.post('/login', authLimiter, validate(loginValidation), async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // ตรวจสอบข้อมูล
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
            });
        }

        // ค้นหาผู้ใช้
        const [users] = await db.query(
            'SELECT id, username, email, password_hash, full_name, phone, avatar_url, role, status FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        const user = users[0];

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                error: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'
            });
        }

        // สร้าง JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            },
            JWT_SECRET,
            { expiresIn: '24h' } // ลดเหลือ 24 ชม. เพื่อความปลอดภัย
        );

        res.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                avatar_url: user.avatar_url,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Login error', error);
        next(error);
    }
});

// ดึงข้อมูลผู้ใช้ปัจจุบัน (ต้อง login)
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, full_name, phone, avatar_url, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        logger.error('Get user error', error);
        next(error);
    }
});

// อัพเดทข้อมูลผู้ใช้
router.put('/profile', authMiddleware, async (req, res, next) => {
    try {
        const { full_name, phone, avatar_url } = req.body;

        console.log('=== Profile Update Debug ===');
        console.log('New avatar_url from request:', avatar_url);

        // 1. ดึงข้อมูล avatar_url เก่าจากฐานข้อมูล
        const [users] = await db.query(
            'SELECT avatar_url FROM users WHERE id = ?',
            [req.user.id]
        );

        const oldAvatarUrl = users.length > 0 ? users[0].avatar_url : null;
        console.log('Old avatar_url from DB:', oldAvatarUrl);

        // 2. อัปเดตข้อมูลในฐานข้อมูล
        await db.query(
            'UPDATE users SET full_name = ?, phone = ?, avatar_url = ? WHERE id = ?',
            [full_name || null, phone || null, avatar_url || null, req.user.id]
        );

        // 3. ลบรูปเก่าถ้ามีการเปลี่ยนรูปและรูปเก่าอยู่ในโฟลเดอร์ /uploads/
        console.log('Checking deletion conditions:');
        console.log('  - oldAvatarUrl exists?', !!oldAvatarUrl);
        console.log('  - URLs are different?', oldAvatarUrl !== avatar_url);
        console.log('  - Starts with /uploads/?', oldAvatarUrl?.startsWith('/uploads/'));

        if (oldAvatarUrl && oldAvatarUrl !== avatar_url && oldAvatarUrl.startsWith('/uploads/')) {
            // ตัด leading slash ออกเพื่อให้ path.join ทำงานถูกต้อง
            const relativePath = oldAvatarUrl.substring(1);
            const oldImagePath = path.join(__dirname, '..', '..', relativePath);
            console.log('Attempting to delete old avatar at:', oldImagePath);

            // ตรวจสอบว่าไฟล์มีอยู่จริงก่อนลบ
            if (fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old avatar:', err);
                    else console.log('✓ Deleted old avatar:', oldImagePath);
                });
            } else {
                console.log('✗ Old avatar file does not exist:', oldImagePath);
            }
        } else {
            console.log('✗ Deletion conditions not met, skipping deletion');
        }
        console.log('=== End Debug ===');

        res.json({
            success: true,
            message: 'อัพเดทข้อมูลสำเร็จ'
        });
    } catch (error) {
        logger.error('Update profile error', error);
        next(error);
    }
});

// เปลี่ยนรหัสผ่าน
router.put('/change-password', authMiddleware, validate(changePasswordValidation), async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        // ดึงรหัสผ่านปัจจุบัน
        const [users] = await db.query(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        // ตรวจสอบรหัสผ่านปัจจุบัน
        const isPasswordValid = await bcrypt.compare(current_password, users[0].password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
            });
        }

        // เข้ารหัสรหัสผ่านใหม่
        const new_password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);

        // อัพเดทรหัสผ่าน
        await db.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [new_password_hash, req.user.id]
        );

        res.json({
            success: true,
            message: 'เปลี่ยนรหัสผ่านสำเร็จ'
        });
    } catch (error) {
        logger.error('Change password error', error);
        next(error);
    }
});

export default router;
