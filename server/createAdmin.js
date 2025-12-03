import bcrypt from 'bcrypt';
import { db } from './db.js';

const createAdminUser = async () => {
    try {
        const username = 'admin';
        const email = 'admin@phayaohub.com';
        const password = 'admin123'; // รหัสผ่านเริ่มต้น
        const full_name = 'ผู้ดูแลระบบ';

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // ลบ admin เก่าถ้ามี
        await db.query('DELETE FROM users WHERE username = ? OR email = ?', [username, email]);

        // สร้าง admin ใหม่
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, password_hash, full_name, 'admin']
        );

        console.log('✅ สร้างผู้ใช้ Admin สำเร็จ!');
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role: admin');
        console.log('\n⚠️  กรุณาเปลี่ยนรหัสผ่านหลังจาก login ครั้งแรก');

        process.exit(0);
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error);
        process.exit(1);
    }
};

createAdminUser();
