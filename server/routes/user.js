import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { deleteFile } from '../utils/fileHandler.js';
import logger from '../utils/logger.js';

// Note: MySQL prepared statements handle escaping automatically

const router = express.Router();

// ใช้ middleware ตรวจสอบการ login ทุก route
router.use(authMiddleware);

// --- Market Items ---

// Get User's Market Items
router.get('/market-items', async (req, res, next) => {
    try {
        const [items] = await db.query(
            `SELECT mi.*, c.name as category_name 
             FROM market_items mi 
             LEFT JOIN categories c ON mi.category_id = c.id 
             WHERE mi.user_id = ? 
             ORDER BY mi.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: items });
    } catch (error) {
        logger.error('Get user items error', error);
        next(error);
    }
});

// Get Single Market Item
router.get('/market-items/:id', async (req, res, next) => {
    try {
        const [items] = await db.query(
            `SELECT mi.*, c.name as category_name 
             FROM market_items mi 
             LEFT JOIN categories c ON mi.category_id = c.id 
             WHERE mi.id = ? AND mi.user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (items.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบสินค้า' });
        }

        const item = items[0];

        // Get images
        const [images] = await db.query(
            'SELECT id, image_url FROM market_images WHERE item_id = ? ORDER BY display_order ASC',
            [item.id]
        );

        item.images = images;

        res.json({ success: true, data: item });
    } catch (error) {
        logger.error('Get item error', error);
        next(error);
    }
});

// Create Market Item
router.post('/market-items', async (req, res, next) => {
    try {
        const { title, description, price, category_id, location, contact_phone, contact_line, images } = req.body;

        if (!title || !price || !category_id) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // Use first image as main image, or empty string
        const mainImage = (images && images.length > 0) ? images[0] : '';

        const [result] = await db.query(
            'INSERT INTO market_items (user_id, category_id, title, description, price, location, contact_phone, contact_line, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, category_id, title, description, price, location, contact_phone, contact_line, mainImage, 'available']
        );

        const itemId = result.insertId;

        // Insert gallery images
        if (images && Array.isArray(images) && images.length > 0) {
            const imageValues = images.map((url, index) => [itemId, url, index === 0, index]);
            await db.query(
                'INSERT INTO market_images (item_id, image_url, is_primary, display_order) VALUES ?',
                [imageValues]
            );
        }

        res.json({ success: true, message: 'สร้างสินค้าสำเร็จ' });
    } catch (error) {
        logger.error('Create item error', error);
        next(error);
    }
});

// Update Market Item
// Update Market Item
router.put('/market-items/:id', async (req, res, next) => {
    try {
        const { title, description, price, category_id, location, contact_phone, contact_line, image_url, images } = req.body;

        // Verify ownership
        const [item] = await db.query('SELECT id, image_url FROM market_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (item.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์แก้ไขสินค้านี้' });
        }

        if (!title || !price || !category_id) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // Delete old main image if changed
        if (item[0].image_url && item[0].image_url !== image_url) {
            deleteFile(item[0].image_url);
        }

        await db.query(
            'UPDATE market_items SET category_id=?, title=?, description=?, price=?, location=?, contact_phone=?, contact_line=?, image_url=? WHERE id=?',
            [category_id, title, description, price, location, contact_phone, contact_line, image_url, req.params.id]
        );

        // Update gallery images
        if (images && Array.isArray(images)) {
            // Get current images
            const [currentImages] = await db.query('SELECT image_url FROM market_images WHERE item_id = ?', [req.params.id]);

            // Delete removed images
            const imagesToDelete = currentImages.filter(img => !images.includes(img.image_url));
            imagesToDelete.forEach(img => deleteFile(img.image_url));

            // Delete existing from DB
            await db.query('DELETE FROM market_images WHERE item_id = ?', [req.params.id]);

            // Insert new
            if (images.length > 0) {
                const imageValues = images.map((url, index) => [req.params.id, url, index === 0, index]);
                await db.query(
                    'INSERT INTO market_images (item_id, image_url, is_primary, display_order) VALUES ?',
                    [imageValues]
                );
            }
        }

        res.json({ success: true, message: 'อัพเดทสินค้าสำเร็จ' });
    } catch (error) {
        logger.error('Update item error', error);
        next(error);
    }
});

// Update Market Item Status
router.put('/market-items/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;

        // Verify ownership
        const [item] = await db.query('SELECT id FROM market_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (item.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์แก้ไขสินค้านี้' });
        }

        if (!['available', 'sold', 'reserved'].includes(status)) {
            return res.status(400).json({ success: false, error: 'สถานะไม่ถูกต้อง' });
        }

        await db.query(
            'UPDATE market_items SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({ success: true, message: 'อัพเดทสถานะสำเร็จ' });
    } catch (error) {
        logger.error('Update item status error', error);
        next(error);
    }
});

// Delete Market Item
router.delete('/market-items/:id', async (req, res, next) => {
    try {
        // ตรวจสอบว่าเป็นเจ้าของสินค้าหรือไม่
        const [item] = await db.query('SELECT id, image_url FROM market_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

        if (item.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์ลบสินค้านี้' });
        }

        // Get additional images
        const [images] = await db.query('SELECT image_url FROM market_images WHERE item_id = ?', [req.params.id]);

        await db.query('DELETE FROM market_items WHERE id = ?', [req.params.id]);

        // Delete files
        if (item[0].image_url) {
            deleteFile(item[0].image_url);
        }

        if (images.length > 0) {
            images.forEach(img => deleteFile(img.image_url));
        }

        res.json({ success: true, message: 'ลบสินค้าสำเร็จ' });
    } catch (error) {
        logger.error('Delete item error', error);
        next(error);
    }
});

// --- Jobs ---

// Get User's Jobs
router.get('/jobs', async (req, res, next) => {
    try {
        const [jobs] = await db.query(
            `SELECT j.*, c.name as category_name 
             FROM jobs j 
             LEFT JOIN categories c ON j.category_id = c.id 
             WHERE j.user_id = ? 
             ORDER BY j.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: jobs });
    } catch (error) {
        logger.error('Get user jobs error', error);
        next(error);
    }
});

// Get Single Job
router.get('/jobs/:id', async (req, res, next) => {
    try {
        const [jobs] = await db.query(
            `SELECT j.*, c.name as category_name 
             FROM jobs j 
             LEFT JOIN categories c ON j.category_id = c.id 
             WHERE j.id = ? AND j.user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบประกาศงาน' });
        }

        res.json({ success: true, data: jobs[0] });
    } catch (error) {
        logger.error('Get job error', error);
        next(error);
    }
});

// Create Job
router.post('/jobs', async (req, res, next) => {
    try {
        const { title, company_name, description, job_type, salary_min, salary_max, salary_type, location, category_id, contact_email, contact_phone, contact_line } = req.body;

        if (!title || !company_name || !location) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        await db.query(
            'INSERT INTO jobs (user_id, category_id, title, company_name, description, job_type, salary_min, salary_max, salary_type, location, contact_email, contact_phone, contact_line, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, category_id, title, company_name, description, job_type, salary_min, salary_max, salary_type, location, contact_email, contact_phone, contact_line, 'open']
        );

        res.json({ success: true, message: 'สร้างประกาศงานสำเร็จ' });
    } catch (error) {
        logger.error('Create job error', error);
        next(error);
    }
});

// Update Job
router.put('/jobs/:id', async (req, res, next) => {
    try {
        const { title, company_name, description, job_type, salary_min, salary_max, salary_type, location, category_id, contact_email, contact_phone, contact_line } = req.body;

        // Verify ownership
        const [job] = await db.query('SELECT id FROM jobs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (job.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์แก้ไขประกาศงานนี้' });
        }

        if (!title || !company_name || !location) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        await db.query(
            'UPDATE jobs SET category_id=?, title=?, company_name=?, description=?, job_type=?, salary_min=?, salary_max=?, salary_type=?, location=?, contact_email=?, contact_phone=?, contact_line=? WHERE id=?',
            [category_id, title, company_name, description, job_type, salary_min, salary_max, salary_type, location, contact_email, contact_phone, contact_line, req.params.id]
        );

        res.json({ success: true, message: 'แก้ไขประกาศงานสำเร็จ' });
    } catch (error) {
        logger.error('Update job error', error);
        next(error);
    }
});

// Update Job Status
router.put('/jobs/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;

        // Verify ownership
        const [job] = await db.query('SELECT id FROM jobs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (job.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์แก้ไขประกาศงานนี้' });
        }

        if (!['open', 'closed'].includes(status)) {
            return res.status(400).json({ success: false, error: 'สถานะไม่ถูกต้อง' });
        }

        await db.query(
            'UPDATE jobs SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({ success: true, message: 'อัพเดทสถานะสำเร็จ' });
    } catch (error) {
        logger.error('Update job status error', error);
        next(error);
    }
});

// Delete Job
router.delete('/jobs/:id', async (req, res, next) => {
    try {
        const [job] = await db.query('SELECT id FROM jobs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

        if (job.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์ลบประกาศงานนี้' });
        }

        await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'ลบงานสำเร็จ' });
    } catch (error) {
        logger.error('Delete job error', error);
        next(error);
    }
});

// --- Posts ---

// Get User's Posts
router.get('/posts', async (req, res, next) => {
    try {
        const [posts] = await db.query(
            `SELECT * FROM community_posts WHERE user_id = ? ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: posts });
    } catch (error) {
        logger.error('Get user posts error', error);
        next(error);
    }
});

// Create Post
router.post('/posts', async (req, res, next) => {
    try {
        const { title, content, category, image_url } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        await db.query(
            'INSERT INTO community_posts (user_id, title, content, category, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, content, category, image_url, 'active']
        );

        res.json({ success: true, message: 'สร้างโพสต์สำเร็จ' });
    } catch (error) {
        logger.error('Create post error', error);
        next(error);
    }
});

// Update Post
router.put('/posts/:id', async (req, res, next) => {
    try {
        const { title, content, category, image_url } = req.body;

        // Verify ownership
        const [post] = await db.query('SELECT id, image_url FROM community_posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (post.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์แก้ไขโพสต์นี้' });
        }

        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // Delete old image if changed
        if (post[0].image_url && post[0].image_url !== image_url) {
            deleteFile(post[0].image_url);
        }

        await db.query(
            'UPDATE community_posts SET title=?, content=?, category=?, image_url=? WHERE id=?',
            [title, content, category, image_url, req.params.id]
        );

        res.json({ success: true, message: 'แก้ไขโพสต์สำเร็จ' });
    } catch (error) {
        logger.error('Update post error', error);
        next(error);
    }
});

// Update User Profile
router.put('/profile', async (req, res, next) => {
    try {
        const { full_name, phone, avatar_url } = req.body;

        await db.query(
            'UPDATE users SET full_name = ?, phone = ?, avatar_url = ? WHERE id = ?',
            [full_name, phone, avatar_url, req.user.id]
        );

        res.json({ success: true, message: 'อัพเดทข้อมูลส่วนตัวสำเร็จ' });
    } catch (error) {
        logger.error('Update profile error', error);
        next(error);
    }
});

// Update Post Status
router.put('/posts/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;

        // Verify ownership
        const [post] = await db.query('SELECT id FROM community_posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (post.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์แก้ไขโพสต์นี้' });
        }

        if (!['active', 'hidden'].includes(status)) {
            return res.status(400).json({ success: false, error: 'สถานะไม่ถูกต้อง' });
        }

        await db.query(
            'UPDATE community_posts SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({ success: true, message: 'อัพเดทสถานะสำเร็จ' });
    } catch (error) {
        logger.error('Update post status error', error);
        next(error);
    }
});

// Delete Post
router.delete('/posts/:id', async (req, res, next) => {
    try {
        const [post] = await db.query('SELECT id, image_url FROM community_posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

        if (post.length === 0) {
            return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์ลบโพสต์นี้' });
        }

        await db.query('DELETE FROM community_posts WHERE id = ?', [req.params.id]);

        // Delete file
        if (post[0].image_url) {
            deleteFile(post[0].image_url);
        }

        res.json({ success: true, message: 'ลบโพสต์สำเร็จ' });
    } catch (error) {
        logger.error('Delete post error', error);
        next(error);
    }
});

// --- Favorites ---

// Toggle Favorite (Add/Remove)
router.post('/favorites', async (req, res, next) => {
    try {
        const { item_type, item_id } = req.body;

        // Check if already favorited
        const [existing] = await db.query(
            'SELECT id FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
            [req.user.id, item_type, item_id]
        );

        if (existing.length > 0) {
            // Remove favorite
            await db.query('DELETE FROM favorites WHERE id = ?', [existing[0].id]);

            // Decrement like_count if it's a post
            if (item_type === 'post') {
                await db.query('UPDATE community_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [item_id]);
            }

            res.json({ success: true, isFavorited: false, message: 'ลบจากรายการโปรดแล้ว' });
        } else {
            // Add favorite
            await db.query(
                'INSERT INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?)',
                [req.user.id, item_type, item_id]
            );

            // Increment like_count if it's a post
            if (item_type === 'post') {
                await db.query('UPDATE community_posts SET like_count = like_count + 1 WHERE id = ?', [item_id]);
            }

            res.json({ success: true, isFavorited: true, message: 'เพิ่มในรายการโปรดแล้ว' });
        }
    } catch (error) {
        logger.error('Toggle favorite error', error);
        next(error);
    }
});

// Check Favorite Status
router.get('/favorites/:item_type/:item_id', async (req, res, next) => {
    try {
        const { item_type, item_id } = req.params;
        const [existing] = await db.query(
            'SELECT id FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
            [req.user.id, item_type, item_id]
        );
        res.json({ success: true, isFavorited: existing.length > 0 });
    } catch (error) {
        logger.error('Check favorite error', error);
        next(error);
    }
});

// Get User's Favorites
router.get('/favorites', async (req, res, next) => {
    try {
        const [favorites] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, data: favorites });
    } catch (error) {
        logger.error('Get favorites error', error);
        next(error);
    }
});

// --- Activities ---

// Get Recent Activities
router.get('/activities', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = 5;

        // 1. Get Market Items
        const [marketItems] = await db.query(
            'SELECT id, title, created_at, "market" as type FROM market_items WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
        );

        // 2. Get Jobs
        const [jobs] = await db.query(
            'SELECT id, title, created_at, "job" as type FROM jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
        );

        // 3. Get Posts
        const [posts] = await db.query(
            'SELECT id, title, created_at, "post" as type FROM community_posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
        );

        // Combine and Sort
        const allActivities = [...marketItems, ...jobs, ...posts];
        allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Take top 10
        const recentActivities = allActivities.slice(0, 10);

        res.json({ success: true, data: recentActivities });
    } catch (error) {
        logger.error('Get activities error', error);
        next(error);
    }
});

export default router;
