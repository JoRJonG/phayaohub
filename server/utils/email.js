import nodemailer from 'nodemailer';
import logger from './logger.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// สร้าง Transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true สำหรับ port 465, false สำหรับ port อื่นๆ
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * ส่งอีเมล
 * @param {string} to - อีเมลผู้รับ
 * @param {string} subject - หัวข้ออีเมล
 * @param {string} html - เนื้อหาอีเมล (HTML)
 */
export const sendEmail = async (to, subject, html) => {
    try {
        // หากยังไม่ได้ตั้งค่า SMTP_USER ให้จำลองการส่ง (รันในโหมด Development)
        if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
            console.log('\n=============================================');
            console.log('📧 MOCK EMAIL (ไม่ได้ตั้งค่ารหัสผ่าน SMTP)');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content:\n${html}`);
            console.log('=============================================\n');
            return true;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"PhayaoHub" <noreply@phayaohub.com>',
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`อีเมลถูกส่งไปที่ ${to} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        logger.error('เกิดข้อผิดพลาดในการส่งอีเมล:', error);
        throw error;
    }
};
