import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { checkAndIncrementView } from '../services/viewService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { sanitizeInput } from '../utils/sanitizers.js';

const router = express.Router();

/**
 * @route   GET /api/market-items
 * @desc    Get market items
 * @access  Public
 */
router.get('/', async (req, res) => {
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

        const safeLimit = Math.min(parseInt(limit) || 20, 100);
        const safeOffset = parseInt(offset) || 0;

        query += ' ORDER BY mi.created_at DESC LIMIT ? OFFSET ?';
        params.push(safeLimit, safeOffset);

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

        res.json({ success: true, data: items, total }); // Keeping original format for list + total
    } catch (error) {
        sendError(res, 'Get market items error', 500, error);
    }
});

/**
 * @route   GET /api/market-items/:id/images
 * @desc    Get item images
 * @access  Public
 */
router.get('/:id/images', async (req, res) => {
    try {
        const [images] = await db.query(
            'SELECT * FROM market_images WHERE item_id = ? ORDER BY is_primary DESC, display_order',
            [req.params.id]
        );
        sendSuccess(res, images);
    } catch (error) {
        sendError(res, 'Get item images error', 500, error);
    }
});

/**
 * @route   GET /api/market-items/:id
 * @desc    Get single market item
 * @access  Public
 */
router.get('/:id', async (req, res) => {
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
            return sendError(res, 'ไม่พบสินค้า', 404);
        }

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'market', req.params.id, async () => {
            await db.query('UPDATE market_items SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        sendSuccess(res, items[0]);
    } catch (error) {
        sendError(res, 'Get market item error', 500, error);
    }
});

/**
 * @route   POST /api/market-items
 * @desc    Create market item
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { category_id, title, description, price, condition_type, location, contact_phone, contact_line } = req.body;

        const [result] = await db.query(
            `INSERT INTO market_items 
      (user_id, category_id, title, description, price, condition_type, location, contact_phone, contact_line, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
            [
                req.user.id,
                category_id,
                sanitizeInput(title),
                sanitizeInput(description),
                price,
                condition_type,
                sanitizeInput(location),
                sanitizeInput(contact_phone),
                sanitizeInput(contact_line)
            ]
        );

        // Standard success response but with id field
        res.json({ success: true, message: 'เพิ่มสินค้าสำเร็จ', id: result.insertId });
    } catch (error) {
        sendError(res, 'Create market item error', 500, error);
    }
});

export default router;
