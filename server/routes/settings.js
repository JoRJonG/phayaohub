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
            const oldImagePath = path.join(__dirname, '..', '..', oldImageUrl);
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

export default router;
