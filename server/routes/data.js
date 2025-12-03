import express from 'express';
import { db } from '../db.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { checkAndIncrementView } from '../services/viewService.js';


const router = express.Router();


// ดึงหมวดหมู่ทั้งหมด
router.get('/categories', async (req, res, next) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM categories';
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

// ดึงสินค้าตลาดมือสอง
router.get('/market-items', async (req, res, next) => {
    try {
        const { category_id, status, search, limit = 20, offset = 0 } = req.query;

        let query = `
      SELECT 
        mi.id, mi.category_id, mi.title, mi.description, mi.price, 
        mi.condition_type, mi.location, mi.status, mi.created_at, mi.view_count,
        u.full_name as seller_full_name,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT image_url FROM market_images WHERE item_id = mi.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM market_items mi
      LEFT JOIN users u ON mi.user_id = u.id
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE 1=1
    `;
        const params = [];

        if (category_id) {
            query += ' AND mi.category_id = ?';
            params.push(category_id);
        }

        if (status) {
            query += ' AND mi.status = ?';
            params.push(status);
        } else {
            query += ' AND mi.status = "available"';
        }

        if (search) {
            query += ' AND (mi.title LIKE ? OR mi.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY mi.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [items] = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM market_items mi
            WHERE 1=1
        `;
        const countParams = [];

        if (category_id) {
            countQuery += ' AND mi.category_id = ?';
            countParams.push(category_id);
        }

        if (status) {
            countQuery += ' AND mi.status = ?';
            countParams.push(status);
        } else {
            countQuery += ' AND mi.status = "available"';
        }

        if (search) {
            countQuery += ' AND (mi.title LIKE ? OR mi.description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({ success: true, data: items, total });
    } catch (error) {
        logger.error('Get market items error', error);
        next(error);
    }
});

// ดึงรูปภาพของสินค้า
router.get('/market-items/:id/images', async (req, res, next) => {
    try {
        const [images] = await db.query(
            'SELECT * FROM market_images WHERE item_id = ? ORDER BY is_primary DESC, display_order',
            [req.params.id]
        );
        res.json({ success: true, data: images });
    } catch (error) {
        logger.error('Get item images error', error);
        next(error);
    }
});

// Get single market item
router.get('/market-items/:id', async (req, res, next) => {
    try {
        const [items] = await db.query(
            `SELECT mi.id, mi.category_id, mi.title, mi.description, mi.price, 
                    mi.condition_type, mi.location, mi.contact_phone, mi.contact_line, 
                    mi.status, mi.created_at, mi.view_count,
                    u.full_name as seller_full_name,
                    c.name as category_name, c.slug as category_slug,
                    (SELECT image_url FROM market_images WHERE item_id = mi.id AND is_primary = TRUE LIMIT 1) as primary_image
             FROM market_items mi
             LEFT JOIN users u ON mi.user_id = u.id
             LEFT JOIN categories c ON mi.category_id = c.id
             WHERE mi.id = ?`,
            [req.params.id]
        );

        if (items.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบสินค้า' });
        }

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'market', req.params.id, async () => {
            await db.query('UPDATE market_items SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        res.json({ success: true, data: items[0] });
    } catch (error) {
        logger.error('Get market item error', error);
        next(error);
    }
});

// สร้างสินค้าใหม่ (ต้อง login)
router.post('/market-items', authMiddleware, async (req, res, next) => {
    try {
        const { category_id, title, description, price, condition_type, location, contact_phone, contact_line } = req.body;

        const [result] = await db.query(
            `INSERT INTO market_items 
      (user_id, category_id, title, description, price, condition_type, location, contact_phone, contact_line, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
            [req.user.id, category_id, sanitizeInput(title), sanitizeInput(description), price, condition_type, sanitizeInput(location), sanitizeInput(contact_phone), sanitizeInput(contact_line)]
        );

        res.json({ success: true, message: 'เพิ่มสินค้าสำเร็จ', id: result.insertId });
    } catch (error) {
        logger.error('Create market item error', error);
        next(error);
    }
});

// ดึงประกาศงาน
router.get('/jobs', async (req, res, next) => {
    try {
        const { category_id, job_type, status, search, limit = 20, offset = 0 } = req.query;

        let query = `
      SELECT 
        j.id, j.category_id, j.title, j.company_name, j.description, j.job_type,
        j.salary_min, j.salary_max, j.salary_type, j.location, j.created_at, j.view_count,
        u.full_name as poster_full_name,
        c.name as category_name,
        c.slug as category_slug
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      LEFT JOIN categories c ON j.category_id = c.id
      WHERE 1=1
    `;
        const params = [];

        if (category_id) {
            query += ' AND j.category_id = ?';
            params.push(category_id);
        }

        if (job_type) {
            query += ' AND j.job_type = ?';
            params.push(job_type);
        }

        if (status) {
            query += ' AND j.status = ?';
            params.push(status);
        } else {
            query += ' AND j.status = "open"';
        }

        if (search) {
            query += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.company_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [jobs] = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM jobs j
            WHERE 1=1
        `;
        const countParams = [];

        if (category_id) {
            countQuery += ' AND j.category_id = ?';
            countParams.push(category_id);
        }

        if (job_type) {
            countQuery += ' AND j.job_type = ?';
            countParams.push(job_type);
        }

        if (status) {
            countQuery += ' AND j.status = ?';
            countParams.push(status);
        } else {
            countQuery += ' AND j.status = "open"';
        }

        if (search) {
            countQuery += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.company_name LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({ success: true, data: jobs, total });
    } catch (error) {
        logger.error('Get jobs error', error);
        next(error);
    }
});

// Get single job
router.get('/jobs/:id', async (req, res, next) => {
    try {
        const [jobs] = await db.query(
            `SELECT j.id, j.category_id, j.title, j.company_name, j.description, j.job_type,
                    j.salary_min, j.salary_max, j.salary_type, j.location, 
                    j.contact_email, j.contact_phone, j.contact_line,
                    j.requirements, j.benefits, j.status, j.created_at, j.view_count,
                    c.name as category_name, c.slug as category_slug
             FROM jobs j
             LEFT JOIN categories c ON j.category_id = c.id
             WHERE j.id = ?`,
            [req.params.id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบงาน' });
        }

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'job', req.params.id, async () => {
            await db.query('UPDATE jobs SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        res.json({ success: true, data: jobs[0] });
    } catch (error) {
        logger.error('Get job error', error);
        next(error);
    }
});

// สร้างประกาศงานใหม่ (ต้อง login)
router.post('/jobs', authMiddleware, async (req, res, next) => {
    try {
        const {
            category_id, title, company_name, description, job_type,
            salary_min, salary_max, salary_type, location,
            contact_email, contact_phone, contact_line, requirements, benefits
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO jobs 
      (user_id, category_id, title, company_name, description, job_type, 
       salary_min, salary_max, salary_type, location, contact_email, contact_phone, contact_line,
       requirements, benefits, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
            [req.user.id, category_id, sanitizeInput(title), sanitizeInput(company_name), sanitizeInput(description), job_type,
                salary_min, salary_max, salary_type, sanitizeInput(location), sanitizeInput(contact_email), sanitizeInput(contact_phone), sanitizeInput(contact_line),
            sanitizeInput(requirements), sanitizeInput(benefits)]
        );

        res.json({ success: true, message: 'เพิ่มประกาศงานสำเร็จ', id: result.insertId });
    } catch (error) {
        logger.error('Create job error', error);
        next(error);
    }
});

// ดึงโพสต์ชุมชน
router.get('/community-posts', optionalAuthMiddleware, async (req, res, next) => {
    try {
        const { category, status, search, limit = 20, offset = 0 } = req.query;
        const userId = req.user ? req.user.id : 0;

        let query = `
      SELECT 
        cp.id, cp.title, cp.content, cp.category, cp.image_url, cp.status, cp.created_at, cp.view_count, cp.comment_count,
        u.full_name,
        u.avatar_url,
        (SELECT COUNT(*) FROM favorites f WHERE f.item_type = 'post' AND f.item_id = cp.id AND f.user_id = ?) > 0 as is_favorited
      FROM community_posts cp
      LEFT JOIN users u ON cp.user_id = u.id
      WHERE 1=1
    `;
        const params = [userId];

        if (category) {
            query += ' AND cp.category = ?';
            params.push(category);
        }

        if (status) {
            query += ' AND cp.status = ?';
            params.push(status);
        } else {
            query += ' AND cp.status = "active"';
        }

        if (search) {
            query += ' AND (cp.title LIKE ? OR cp.content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY cp.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [posts] = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM community_posts cp
            WHERE 1=1
        `;
        const countParams = [userId]; // userId is needed if we were filtering by favorites, but basic filters don't use it. 
        // However, looking at the main query, userId is only used for is_favorited subquery.
        // For count, we just need the filters.
        // Let's reset countParams to empty for the count query as it doesn't need userId for filtering unless we add "my favorites" filter later.
        // But wait, the main query uses `params` which starts with `[userId]`.
        // The count query doesn't select is_favorited, so it doesn't need userId.

        const countParamsClean = [];

        if (category) {
            countQuery += ' AND cp.category = ?';
            countParamsClean.push(category);
        }

        if (status) {
            countQuery += ' AND cp.status = ?';
            countParamsClean.push(status);
        } else {
            countQuery += ' AND cp.status = "active"';
        }

        if (search) {
            countQuery += ' AND (cp.title LIKE ? OR cp.content LIKE ?)';
            countParamsClean.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.query(countQuery, countParamsClean);
        const total = countResult[0].total;

        // Convert is_favorited to boolean
        const postsWithBool = posts.map(post => ({
            ...post,
            is_favorited: !!post.is_favorited
        }));

        res.json({ success: true, data: postsWithBool, total });
    } catch (error) {
        logger.error('Get community posts error', error);
        next(error);
    }
});

// สร้างโพสต์ชุมชนใหม่ (ต้อง login)
router.post('/community-posts', authMiddleware, async (req, res, next) => {
    try {
        const { title, content, category, image_url } = req.body;

        const [result] = await db.query(
            `INSERT INTO community_posts (user_id, title, content, category, image_url, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
            [req.user.id, sanitizeInput(title), sanitizeInput(content), category, image_url, new Date()]
        );

        res.json({ success: true, message: 'สร้างโพสต์สำเร็จ', id: result.insertId });
    } catch (error) {
        logger.error('Create post error', error);
        next(error);
    }
});

// Get single community post
router.get('/community-posts/:id', async (req, res, next) => {
    try {
        const [posts] = await db.query(
            `SELECT cp.id, cp.title, cp.content, cp.category, cp.image_url, cp.status, cp.created_at, cp.view_count, cp.comment_count,
                    u.full_name, u.avatar_url
             FROM community_posts cp
             LEFT JOIN users u ON cp.user_id = u.id
             WHERE cp.id = ?`,
            [req.params.id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบโพสต์' });
        }

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'post', req.params.id, async () => {
            await db.query('UPDATE community_posts SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        res.json({ success: true, data: posts[0] });
    } catch (error) {
        logger.error('Get post error', error);
        next(error);
    }
});

// Get comments for a post
router.get('/community-posts/:id/comments', async (req, res, next) => {
    try {
        const [comments] = await db.query(
            `SELECT c.id, c.content, c.created_at, u.full_name, u.avatar_url
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.post_id = ?
             ORDER BY c.created_at ASC`,
            [req.params.id]
        );
        res.json({ success: true, data: comments });
    } catch (error) {
        logger.error('Get comments error', error);
        next(error);
    }
});

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

// Create a comment
router.post('/community-posts/:id/comments', authMiddleware, async (req, res, next) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;

        // Sanitize content
        const sanitizedContent = sanitizeInput(content);

        const [result] = await db.query(
            'INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, ?)',
            [req.user.id, postId, sanitizedContent, new Date()]
        );

        // Update comment count on post
        await db.query('UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = ?', [postId]);

        res.json({ success: true, message: 'แสดงความคิดเห็นสำเร็จ', id: result.insertId });
    } catch (error) {
        logger.error('Create comment error', error);
        next(error);
    }
});

// ดึงคู่มือท่องเที่ยว (เที่ยว พัก กิน)
router.get('/guides', async (req, res, next) => {
    try {
        const { category, status, is_featured, sort, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM guides WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        } else {
            query += ' AND status = "published"';
        }

        if (is_featured === 'true') {
            query += ' AND is_featured = TRUE';
        }

        if (sort === 'latest') {
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        } else {
            query += ' ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?';
        }
        params.push(parseInt(limit), parseInt(offset));

        const [guides] = await db.query(query, params);
        res.json({ success: true, data: guides });
    } catch (error) {
        logger.error('Get guides error', error);
        next(error);
    }
});

// Get single guide
router.get('/guides/:id', async (req, res, next) => {
    try {
        const [guides] = await db.query(
            'SELECT * FROM guides WHERE id = ?',
            [req.params.id]
        );

        if (guides.length === 0) {
            return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล' });
        }

        const guide = guides[0];

        // Fetch images
        const [images] = await db.query('SELECT id, image_url FROM guide_images WHERE guide_id = ? ORDER BY display_order ASC', [guide.id]);
        guide.images = images;

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'guide', req.params.id, async () => {
            await db.query('UPDATE guides SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        res.json({ success: true, data: guide });
    } catch (error) {
        logger.error('Get guide error', error);
        next(error);
    }
});



export default router;
