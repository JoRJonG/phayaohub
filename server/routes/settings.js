import express from 'express';
import { db } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get Hero Background Image (Public)
router.get('/hero-bg', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = "hero_bg_image"');

        let imageUrl = ''; // Default
        if (rows.length > 0) {
            imageUrl = rows[0].setting_value;
        }

        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Get hero bg error:', error);
        res.status(500).json({ success: false, error: 'ไม่สามารถดึงข้อมูลรูปภาพพื้นหลังได้' });
    }
});

// Update Hero Background Image (Admin Only)
router.put('/hero-bg', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ success: false, error: 'กรุณาระบุ URL ของรูปภาพ' });
        }

        // 1. Fetch old image
        const [rows] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = "hero_bg_image"');
        const oldImageUrl = rows.length > 0 ? rows[0].setting_value : null;

        // 2. Update database
        await db.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES ("hero_bg_image", ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [imageUrl, imageUrl]
        );

        // 3. Delete old image if it exists and is different from new image
        if (oldImageUrl && oldImageUrl !== imageUrl && oldImageUrl.startsWith('/uploads/')) {
            // ตัด leading slash ออกเพื่อให้ path.join ทำงานถูกต้อง
            const relativePath = oldImageUrl.substring(1);
            const oldImagePath = path.join(__dirname, '..', '..', relativePath);
            // Check if file exists before deleting
            if (fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old hero image:', err);
                    else console.log('Deleted old hero image:', oldImagePath);
                });
            }
        }

        res.json({ success: true, message: 'อัพเดทรูปภาพพื้นหลังสำเร็จ' });
    } catch (error) {
        console.error('Update hero bg error:', error);
        res.status(500).json({ success: false, error: 'ไม่สามารถอัพเดทรูปภาพพื้นหลังได้' });
    }
});

// Record a new visit
router.post('/visit', async (req, res) => {
    try {
        await db.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES ("total_visitors", "1") ON DUPLICATE KEY UPDATE setting_value = CAST(setting_value AS UNSIGNED) + 1'
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Record visit error:', error);
        res.status(500).json({ success: false });
    }
});

// Get total visitors
router.get('/visitors', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = "total_visitors"');
        const count = rows.length > 0 ? parseInt(rows[0].setting_value, 10) : 0;
        res.json({ success: true, count });
    } catch (error) {
        console.error('Get visitors error:', error);
        res.status(500).json({ success: false, count: 0 });
    }
});

export default router;
