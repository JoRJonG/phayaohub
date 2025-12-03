import express from 'express';
import { db } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { deleteFile } from '../utils/fileHandler.js';
import logger from '../utils/logger.js';

// Helper function to sanitize input
const sanitizeInput = (text) => {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const router = express.Router();

// ใช้ middleware ตรวจสอบว่าเป็น admin ทุก route
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard Statistics
router.get('/stats', async (req, res, next) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        const [itemCount] = await db.query('SELECT COUNT(*) as count FROM market_items');
        const [jobCount] = await db.query('SELECT COUNT(*) as count FROM jobs');
        const [postCount] = await db.query('SELECT COUNT(*) as count FROM community_posts');

        const [recentUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
        const [recentItems] = await db.query('SELECT COUNT(*) as count FROM market_items WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');

        res.json({
            success: true,
            data: {
                totalUsers: userCount[0].count,
                totalItems: itemCount[0].count,
                totalJobs: jobCount[0].count,
                totalPosts: postCount[0].count,
                newUsersThisWeek: recentUsers[0].count,
                newItemsThisWeek: recentItems[0].count
            }
        });
    } catch (error) {
        logger.error('Get stats error', error);
        next(error);
    }
});

// Recent Activity
router.get('/recent-activity', async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT id, username as title, "user" as type, created_at FROM users ORDER BY created_at DESC LIMIT 5');
        const [items] = await db.query('SELECT id, title, "market" as type, created_at FROM market_items ORDER BY created_at DESC LIMIT 5');
        const [jobs] = await db.query('SELECT id, title, "job" as type, created_at FROM jobs ORDER BY created_at DESC LIMIT 5');
        const [posts] = await db.query('SELECT id, title, "post" as type, created_at FROM community_posts ORDER BY created_at DESC LIMIT 5');

        const activities = [...users, ...items, ...jobs, ...posts]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 6);

        res.json({ success: true, data: activities });
    } catch (error) {
        logger.error('Get recent activity error', error);
        next(error);
    }
});

// Get Categories
router.get('/categories', async (req, res, next) => {
    try {
        const { type } = req.query;
        let query = 'SELECT id, name, slug, icon, type FROM categories';
        const params = [];

        if (type) {
            query += ' WHERE type = ?';
            params.push(type);
        }

        query += ' ORDER BY name';
        const [categories] = await db.query(query, params);
        res.json({ success: true, data: categories });
    } catch (error) {
        logger.error('Get categories error', error);
        next(error);
    }
});


// User Management
router.get('/users', async (req, res, next) => {
    try {
        const { search, role, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT id, username, email, full_name, phone, role, status, created_at FROM users WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await db.query(query, params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];

        if (search) {
            countQuery += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            countQuery += ' AND role = ?';
            countParams.push(role);
        }

        const [totalResult] = await db.query(countQuery, countParams);

        res.json({ success: true, data: users, total: totalResult[0].total });
    } catch (error) {
        logger.error('Get users error', error);
        next(error);
    }
});

router.put('/users/:id/role', async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Role ไม่ถูกต้อง' });
        }

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ success: true, message: 'อัพเดท role สำเร็จ' });
    } catch (error) {
        logger.error('Update role error', error);
        next(error);
    }
});

router.delete('/users/:id', async (req, res, next) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
    } catch (error) {
        logger.error('Delete user error', error);
        next(error);
    }
});

router.post('/users', async (req, res, next) => {
    try {
        const { username, email, password, full_name, phone, role = 'user' } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // ตรวจสอบว่า username หรือ email ซ้ำหรือไม่
        const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'Username หรือ Email นี้มีอยู่ในระบบแล้ว' });
        }

        // Hash password
        const bcrypt = await import('bcrypt');
        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [sanitizeInput(username), sanitizeInput(email), password_hash, sanitizeInput(full_name), sanitizeInput(phone), role]
        );

        res.json({ success: true, message: 'สร้างผู้ใช้สำเร็จ' });
    } catch (error) {
        logger.error('Create user error', error);
        next(error);
    }
});

// Update User Details
router.put('/users/:id', async (req, res, next) => {
    try {
        const { full_name, phone, status } = req.body;

        await db.query(
            'UPDATE users SET full_name = ?, phone = ?, status = ? WHERE id = ?',
            [sanitizeInput(full_name), sanitizeInput(phone), status, req.params.id]
        );

        res.json({ success: true, message: 'อัพเดทข้อมูลผู้ใช้สำเร็จ' });
    } catch (error) {
        logger.error('Update user error', error);
        next(error);
    }
});

// Reset User Password
router.put('/users/:id/password', async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
        }

        const bcrypt = await import('bcrypt');
        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [password_hash, req.params.id]
        );

        res.json({ success: true, message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
    } catch (error) {
        logger.error('Reset password error', error);
        next(error);
    }
});


// Market Items Management
router.get('/market-items', async (req, res, next) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT mi.*, u.username, c.name as category_name
      FROM market_items mi
      LEFT JOIN users u ON mi.user_id = u.id
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND mi.status = ?';
            params.push(status);
        }

        query += ' ORDER BY mi.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [items] = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM market_items mi WHERE 1=1';
        const countParams = [];

        if (status) {
            countQuery += ' AND mi.status = ?';
            countParams.push(status);
        }

        const [totalResult] = await db.query(countQuery, countParams);

        res.json({ success: true, data: items, total: totalResult[0].total });
    } catch (error) {
        logger.error('Get market items error', error);
        next(error);
    }
});

router.post('/market-items', async (req, res, next) => {
    try {
        const { title, description, price, category_id, location, contact_phone, contact_line, condition_type, image_url, images } = req.body;

        if (!title || !price || !category_id) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const [result] = await db.query(
            'INSERT INTO market_items (user_id, title, description, price, category_id, location, contact_phone, contact_line, condition_type, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, sanitizeInput(title), sanitizeInput(description), price, category_id, sanitizeInput(location), sanitizeInput(contact_phone), sanitizeInput(contact_line), condition_type, image_url, 'available']
        );

        const itemId = result.insertId;

        // Insert images if provided
        if (images && Array.isArray(images) && images.length > 0) {
            const imageValues = images.map((url, index) => [itemId, url, index === 0, index]);
            await db.query(
                'INSERT INTO market_images (item_id, image_url, is_primary, display_order) VALUES ?',
                [imageValues]
            );
        }

        res.json({ success: true, message: 'สร้างสินค้าสำเร็จ' });
    } catch (error) {
        logger.error('Create market item error', error);
        next(error);
    }
});

router.put('/market-items/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE market_items SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'อัพเดทสถานะสำเร็จ' });
    } catch (error) {
        logger.error('Update item status error', error);
        next(error);
    }
});

router.delete('/market-items/:id', async (req, res, next) => {
    try {
        // Get item info to delete files
        const [item] = await db.query('SELECT image_url FROM market_items WHERE id = ?', [req.params.id]);
        const [images] = await db.query('SELECT image_url FROM market_images WHERE item_id = ?', [req.params.id]);

        // Delete from database
        await db.query('DELETE FROM market_items WHERE id = ?', [req.params.id]);

        // Delete files after successful DB deletion
        if (item.length > 0 && item[0].image_url) {
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

router.get('/market-items/:id', async (req, res, next) => {
    try {
        const [items] = await db.query(`
            SELECT mi.*, u.username, c.name as category_name 
            FROM market_items mi
            LEFT JOIN users u ON mi.user_id = u.id
            LEFT JOIN categories c ON mi.category_id = c.id
            WHERE mi.id = ?
        `, [req.params.id]);

        if (items.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบสินค้า' });
        }
        const item = items[0];

        // Fetch images
        const [images] = await db.query('SELECT id, image_url FROM market_images WHERE item_id = ? ORDER BY display_order ASC', [item.id]);
        item.images = images;

        res.json({ success: true, data: item });
    } catch (error) {
        logger.error('Get item details error', error);
        next(error);
    }
});

router.put('/market-items/:id', async (req, res, next) => {
    try {
        const { title, description, price, category_id, location, contact_phone, contact_line, condition_type, image_url, status, images } = req.body;

        console.log('Updating market item:', req.params.id, req.body);

        if (!title || !price || !category_id) {
            return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
        }

        // Get current item to check for image change
        const [currentItem] = await db.query('SELECT image_url FROM market_items WHERE id = ?', [req.params.id]);

        console.log('Current image_url:', currentItem[0]?.image_url);
        console.log('New image_url:', image_url);

        // If image_url changed, delete old file
        // This handles: replacing with new image, or clearing image (empty/null)
        if (currentItem.length > 0 && currentItem[0].image_url && currentItem[0].image_url !== image_url) {
            console.log('Deleting old main image:', currentItem[0].image_url);
            deleteFile(currentItem[0].image_url);
        }

        await db.query(
            'UPDATE market_items SET title=?, description=?, price=?, category_id=?, location=?, contact_phone=?, contact_line=?, condition_type=?, image_url=?, status=? WHERE id=?',
            [sanitizeInput(title), sanitizeInput(description), price, category_id, sanitizeInput(location), sanitizeInput(contact_phone), sanitizeInput(contact_line), condition_type, image_url, status, req.params.id]
        );

        // Update images if provided
        if (images && Array.isArray(images)) {
            console.log('Updating images for item:', req.params.id, images);

            // Get current images to delete removed ones
            const [currentImages] = await db.query('SELECT image_url FROM market_images WHERE item_id = ?', [req.params.id]);
            console.log('Current images in DB:', currentImages.map(img => img.image_url));

            // Find images to delete (present in DB but not in new list)
            const imagesToDelete = currentImages.filter(img => !images.includes(img.image_url));
            console.log('Images to delete:', imagesToDelete.map(img => img.image_url));

            if (imagesToDelete.length > 0) {
                console.log(`Found ${imagesToDelete.length} images to delete`);
                imagesToDelete.forEach(img => {
                    console.log('Calling deleteFile for:', img.image_url);
                    deleteFile(img.image_url);
                });
            } else {
                console.log('No images to delete');
            }

            // Delete existing images from DB
            await db.query('DELETE FROM market_images WHERE item_id = ?', [req.params.id]);

            // Insert new images
            if (images.length > 0) {
                const imageValues = images.map((url, index) => [req.params.id, url, index === 0, index]);
                await db.query(
                    'INSERT INTO market_images (item_id, image_url, is_primary, display_order) VALUES ?',
                    [imageValues]
                );
            }
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลสินค้าสำเร็จ' });
    } catch (error) {
        logger.error('Update item details error', error);
        next(error);
    }
});

// Jobs Management
router.get('/jobs', async (req, res, next) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT j.*, u.username, c.name as category_name
            FROM jobs j
            LEFT JOIN users u ON j.user_id = u.id
            LEFT JOIN categories c ON j.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND j.status = ?';
            params.push(status);
        }

        query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [jobs] = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM jobs j WHERE 1=1';
        const countParams = [];

        if (status) {
            countQuery += ' AND j.status = ?';
            countParams.push(status);
        }

        const [totalResult] = await db.query(countQuery, countParams);

        res.json({ success: true, data: jobs, total: totalResult[0].total });
    } catch (error) {
        logger.error('Get jobs error', error);
        next(error);
    }
});

router.put('/jobs/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE jobs SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'อัพเดทสถานะสำเร็จ' });
    } catch (error) {
        logger.error('Update job status error', error);
        next(error);
    }
});

router.delete('/jobs/:id', async (req, res, next) => {
    try {
        await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'ลบงานสำเร็จ' });
    } catch (error) {
        logger.error('Delete job error', error);
        next(error);
    }
});

// Update Job Details
router.put('/jobs/:id', async (req, res, next) => {
    try {
        const { title, company_name, description, job_type, salary_min, salary_max, salary_type, location, category_id, contact_email, contact_phone, contact_line, requirements, benefits, status } = req.body;

        await db.query(
            'UPDATE jobs SET title=?, company_name=?, description=?, job_type=?, salary_min=?, salary_max=?, salary_type=?, location=?, category_id=?, contact_email=?, contact_phone=?, contact_line=?, requirements=?, benefits=?, status=? WHERE id=?',
            [sanitizeInput(title), sanitizeInput(company_name), sanitizeInput(description), job_type, salary_min, salary_max, salary_type, sanitizeInput(location), category_id, sanitizeInput(contact_email), sanitizeInput(contact_phone), sanitizeInput(contact_line), sanitizeInput(requirements), sanitizeInput(benefits), status, req.params.id]
        );

        res.json({ success: true, message: 'อัพเดทข้อมูลงานสำเร็จ' });
    } catch (error) {
        logger.error('Update job details error', error);
        next(error);
    }
});

router.post('/jobs', async (req, res, next) => {
    try {
        const { title, company_name, description, job_type, salary_min, salary_max, salary_type, location, category_id, contact_email, contact_phone, contact_line, requirements, benefits } = req.body;

        if (!title || !company_name || !job_type) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        await db.query(
            'INSERT INTO jobs (user_id, title, company_name, description, job_type, salary_min, salary_max, salary_type, location, category_id, contact_email, contact_phone, contact_line, requirements, benefits, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, sanitizeInput(title), sanitizeInput(company_name), sanitizeInput(description), job_type, salary_min, salary_max, salary_type, sanitizeInput(location), category_id, sanitizeInput(contact_email), sanitizeInput(contact_phone), sanitizeInput(contact_line), sanitizeInput(requirements), sanitizeInput(benefits), 'open']
        );

        res.json({ success: true, message: 'สร้างประกาศงานสำเร็จ' });
    } catch (error) {
        logger.error('Create job error', error);
        next(error);
    }
});

// Posts Management
router.get('/posts', async (req, res, next) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT cp.*, u.username, u.full_name
            FROM community_posts cp
            LEFT JOIN users u ON cp.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND cp.status = ?';
            params.push(status);
        }

        query += ' ORDER BY cp.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [posts] = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM community_posts cp WHERE 1=1';
        const countParams = [];

        if (status) {
            countQuery += ' AND cp.status = ?';
            countParams.push(status);
        }

        const [totalResult] = await db.query(countQuery, countParams);

        res.json({ success: true, data: posts, total: totalResult[0].total });
    } catch (error) {
        logger.error('Get posts error', error);
        next(error);
    }
});

router.delete('/posts/:id', async (req, res, next) => {
    try {
        // Get post info to delete image
        const [post] = await db.query('SELECT image_url FROM community_posts WHERE id = ?', [req.params.id]);

        await db.query('DELETE FROM community_posts WHERE id = ?', [req.params.id]);

        // Delete file if exists
        if (post.length > 0 && post[0].image_url) {
            deleteFile(post[0].image_url);
        }

        res.json({ success: true, message: 'ลบโพสต์สำเร็จ' });
    } catch (error) {
        logger.error('Delete post error', error);
        next(error);
    }
});

router.post('/posts/bulk-delete', async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: 'กรุณาเลือกรายการที่ต้องการลบ' });
        }

        // Get posts info to delete images
        const [posts] = await db.query('SELECT image_url FROM community_posts WHERE id IN (?)', [ids]);

        // Delete from database
        await db.query('DELETE FROM community_posts WHERE id IN (?)', [ids]);

        // Delete files
        posts.forEach(post => {
            if (post.image_url) {
                deleteFile(post.image_url);
            }
        });

        res.json({ success: true, message: `ลบโพสต์ ${ids.length} รายการสำเร็จ` });
    } catch (error) {
        logger.error('Bulk delete posts error', error);
        next(error);
    }
});

// Update Post Details
router.put('/posts/:id', async (req, res, next) => {
    try {
        const { title, content, category, image_url, status } = req.body;

        await db.query(
            'UPDATE community_posts SET title=?, content=?, category=?, image_url=?, status=? WHERE id=?',
            [sanitizeInput(title), sanitizeInput(content), category, image_url, status, req.params.id]
        );

        res.json({ success: true, message: 'อัพเดทข้อมูลโพสต์สำเร็จ' });
    } catch (error) {
        logger.error('Update post details error', error);
        next(error);
    }
});

// Get Comments for a Post
router.get('/posts/:id/comments', async (req, res, next) => {
    try {
        const [comments] = await db.query(
            `SELECT c.*, u.username, u.full_name, u.avatar_url
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.post_id = ?
             ORDER BY c.created_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, data: comments });
    } catch (error) {
        logger.error('Get comments error', error);
        next(error);
    }
});

// Delete Comment
router.delete('/comments/:id', async (req, res, next) => {
    try {
        // Get post_id before deleting to update comment count
        const [comment] = await db.query('SELECT post_id FROM comments WHERE id = ?', [req.params.id]);

        if (comment.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบความคิดเห็น' });
        }

        const postId = comment[0].post_id;

        await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);

        // Update comment count
        await db.query('UPDATE community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?', [postId]);

        res.json({ success: true, message: 'ลบความคิดเห็นสำเร็จ' });
    } catch (error) {
        logger.error('Delete comment error', error);
        next(error);
    }
});

// Guides Management (เที่ยว พัก กิน)
router.get('/guides', async (req, res, next) => {
    try {
        const { category, status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM guides WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [guides] = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM guides WHERE 1=1';
        const countParams = [];

        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const [totalResult] = await db.query(countQuery, countParams);

        res.json({ success: true, data: guides, total: totalResult[0].total });
    } catch (error) {
        logger.error('Get guides error', error);
        next(error);
    }
});

router.get('/guides/:id', async (req, res, next) => {
    try {
        const [guides] = await db.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);

        if (guides.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล' });
        }

        const guide = guides[0];

        // Fetch images
        const [images] = await db.query('SELECT id, image_url FROM guide_images WHERE guide_id = ? ORDER BY display_order ASC', [guide.id]);
        guide.images = images;

        res.json({ success: true, data: guide });
    } catch (error) {
        logger.error('Get guide error', error);
        next(error);
    }
});

router.post('/guides', async (req, res, next) => {
    try {
        const { title, slug, description, content, category, image_url, is_featured, status, images } = req.body;

        if (!title || !category) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const [result] = await db.query(
            'INSERT INTO guides (title, slug, description, content, category, image_url, is_featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [sanitizeInput(title), slug || title.toLowerCase().replace(/\s+/g, '-'), sanitizeInput(description), sanitizeInput(content), category, image_url, is_featured || false, status || 'published']
        );

        const guideId = result.insertId;

        // Insert images if provided
        if (images && Array.isArray(images) && images.length > 0) {
            const imageValues = images.map((url, index) => [guideId, url, index === 0, index]);
            await db.query(
                'INSERT INTO guide_images (guide_id, image_url, is_primary, display_order) VALUES ?',
                [imageValues]
            );
        }

        res.json({ success: true, message: 'สร้างข้อมูลสำเร็จ' });
    } catch (error) {
        logger.error('Create guide error', error);
        next(error);
    }
});

router.put('/guides/:id', async (req, res, next) => {
    try {
        const { title, slug, description, content, category, image_url, is_featured, status, images } = req.body;

        // Auto-generate slug if not provided
        const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-');

        // Get current guide to check for image change (Main Image)
        const [currentGuide] = await db.query('SELECT image_url FROM guides WHERE id = ?', [req.params.id]);

        // Delete old main image if changed
        if (currentGuide.length > 0 && currentGuide[0].image_url && currentGuide[0].image_url !== image_url) {
            deleteFile(currentGuide[0].image_url);
        }

        await db.query(
            'UPDATE guides SET title=?, slug=?, description=?, content=?, category=?, image_url=?, is_featured=?, status=? WHERE id=?',
            [sanitizeInput(title), finalSlug, sanitizeInput(description), sanitizeInput(content), category, image_url, is_featured, status, req.params.id]
        );

        // Update additional images
        if (images && Array.isArray(images)) {
            // Get current images to delete removed ones
            const [currentImages] = await db.query('SELECT image_url FROM guide_images WHERE guide_id = ?', [req.params.id]);

            // Find images to delete (present in DB but not in new list)
            const imagesToDelete = currentImages.filter(img => !images.includes(img.image_url));

            if (imagesToDelete.length > 0) {
                imagesToDelete.forEach(img => deleteFile(img.image_url));
            }

            // Delete existing images from DB
            await db.query('DELETE FROM guide_images WHERE guide_id = ?', [req.params.id]);

            // Insert new images
            if (images.length > 0) {
                const imageValues = images.map((url, index) => [req.params.id, url, index === 0, index]);
                await db.query(
                    'INSERT INTO guide_images (guide_id, image_url, is_primary, display_order) VALUES ?',
                    [imageValues]
                );
            }
        }

        res.json({ success: true, message: 'อัพเดทข้อมูลสำเร็จ' });
    } catch (error) {
        console.error('Update guide error:', error);
        res.status(500).json({ success: false, error: 'ไม่สามารถอัพเดทข้อมูลได้' });
    }
});

router.delete('/guides/:id', async (req, res) => {
    try {
        // Get guide info to delete image
        const [guide] = await db.query('SELECT image_url FROM guides WHERE id = ?', [req.params.id]);
        const [images] = await db.query('SELECT image_url FROM guide_images WHERE guide_id = ?', [req.params.id]);

        await db.query('DELETE FROM guides WHERE id = ?', [req.params.id]);

        // Delete main file if exists
        if (guide.length > 0 && guide[0].image_url) {
            deleteFile(guide[0].image_url);
        }

        // Delete additional images
        if (images.length > 0) {
            images.forEach(img => deleteFile(img.image_url));
        }

        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        console.error('Delete guide error:', error);
        res.status(500).json({ success: false, error: 'ไม่สามารถลบข้อมูลได้' });
    }
});

export default router;
