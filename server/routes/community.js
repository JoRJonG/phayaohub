import express from 'express';
import { db } from '../db.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { checkAndIncrementView } from '../services/viewService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { sanitizeInput } from '../utils/sanitizers.js';

const router = express.Router();

/**
 * @route   GET /api/community-posts
 * @desc    Get community posts
 * @access  Public (Optional Auth)
 */
router.get('/', optionalAuthMiddleware, async (req, res) => {
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
        sendError(res, 'Get community posts error', 500, error);
    }
});

/**
 * @route   POST /api/community-posts
 * @desc    Create community post
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content, category, image_url } = req.body;

        // Note: sanitizeInput is used here to match original logic
        const [result] = await db.query(
            `INSERT INTO community_posts (user_id, title, content, category, image_url, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
            [
                req.user.id,
                sanitizeInput(title),
                sanitizeInput(content),
                category,
                image_url,
                new Date()
            ]
        );

        res.json({ success: true, message: 'สร้างโพสต์สำเร็จ', id: result.insertId });
    } catch (error) {
        sendError(res, 'Create post error', 500, error);
    }
});

/**
 * @route   GET /api/community-posts/:id
 * @desc    Get single community post
 * @access  Public
 */
router.get('/:id', async (req, res) => {
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
            return sendError(res, 'ไม่พบโพสต์', 404);
        }

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'post', req.params.id, async () => {
            await db.query('UPDATE community_posts SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        sendSuccess(res, posts[0]);
    } catch (error) {
        sendError(res, 'Get post error', 500, error);
    }
});

/**
 * @route   GET /api/community-posts/:id/comments
 * @desc    Get comments for a post
 * @access  Public
 */
router.get('/:id/comments', async (req, res) => {
    try {
        const [comments] = await db.query(
            `SELECT c.id, c.content, c.created_at, u.full_name, u.avatar_url
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.post_id = ?
             ORDER BY c.created_at ASC`,
            [req.params.id]
        );
        sendSuccess(res, comments);
    } catch (error) {
        sendError(res, 'Get comments error', 500, error);
    }
});

/**
 * @route   POST /api/community-posts/:id/comments
 * @desc    Create a comment
 * @access  Private
 */
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;

        const sanitizedContent = sanitizeInput(content);

        const [result] = await db.query(
            'INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, ?)',
            [req.user.id, postId, sanitizedContent, new Date()]
        );

        // Update comment count on post
        await db.query('UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = ?', [postId]);

        res.json({ success: true, message: 'แสดงความคิดเห็นสำเร็จ', id: result.insertId });
    } catch (error) {
        sendError(res, 'Create comment error', 500, error);
    }
});

export default router;
