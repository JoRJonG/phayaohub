import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authLimiter, validate, registerValidation, loginValidation, changePasswordValidation, forgotPasswordValidation, resetPasswordValidation } from '../middleware/securityMiddleware.js';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatUserDTO } from '../dtos/UserDTO.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SALT_ROUNDS = 10;

// สมัครสมาชิก
router.post('/register', authLimiter, validate(registerValidation), async (req, res, next) => {
    try {
        const { username, email, password, full_name, phone } = req.body;


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
            user: formatUserDTO({
                id: result.insertId,
                username,
                email,
                full_name,
                phone,
                role: 'user'
            })
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
            user: formatUserDTO(user)
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
            user: formatUserDTO(users[0])
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

// ขอรีเซ็ตรหัสผ่าน (ลืมรหัสผ่าน)
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), async (req, res, next) => {
    try {
        const { email } = req.body;

        // ค้นหาผู้ใช้ด้วยอีเมล
        const [users] = await db.query('SELECT id, username FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            // เพื่อความปลอดภัย ไม่ควรบอกว่ามีหรือไม่มีอีเมลในระบบ แต่ให้ตอบกลับสำเร็จไปเลย
            return res.json({
                success: true,
                message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว'
            });
        }

        const user = users[0];

        // สร้าง Token (ใช้ crypto สุ่ม string 64 ตัวอักษร)
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // กำหนดเวลาหมดอายุ (1 ชั่วโมง)
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1);

        // บันทึก Token ลงในฐานข้อมูล
        await db.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, resetExpires, user.id]
        );

        // ส่งอีเมล (จะ Console log หรือส่งจริงขึ้นอยู่กับค่าคอนฟิกใน .env)
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        const emailHtml = `
            <h2>ตั้งรหัสผ่านใหม่ PhayaoHub</h2>
            <p>เราได้รับการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
            <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1e3a8a; color: white; text-decoration: none; border-radius: 5px;">ตั้งรหัสผ่านใหม่</a>
            <p>หากปุ่มกดไม่ได้ ให้คัดลอกลิงก์ด้านล่างไปวางบนเบราว์เซอร์:</p>
            <p>${resetUrl}</p>
        `;
        
        await sendEmail(email, 'รีเซ็ตรหัสผ่านบัญชี PhayaoHub', emailHtml);

        res.json({
            success: true,
            message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว'
        });
    } catch (error) {
        logger.error('Forgot password error', error);
        next(error);
    }
});

// ตั้งรหัสผ่านใหม่ด้วย Token
router.post('/reset-password', authLimiter, validate(resetPasswordValidation), async (req, res, next) => {
    try {
        const { token, password } = req.body;

        // ค้นหาผู้ใช้ด้วย Token และยังไม่หมดอายุ
        const [users] = await db.query(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือหมดอายุแล้ว'
            });
        }

        const user = users[0];

        // เข้ารหัสรหัสผ่านใหม่
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // อัปเดตรหัสผ่าน และเคลียร์ Token ทิ้ง
        await db.query(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [password_hash, user.id]
        );

        res.json({
            success: true,
            message: 'เปลี่ยนรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที'
        });
    } catch (error) {
        logger.error('Reset password error', error);
        next(error);
    }
});

export default router;
