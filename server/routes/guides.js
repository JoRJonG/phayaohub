import express from 'express';
import { db } from '../db.js';
import logger from '../utils/logger.js';
import { checkAndIncrementView } from '../services/viewService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const router = express.Router();

/**
 * @route   GET /api/guides
 * @desc    Get guides
 * @access  Public
 */
router.get('/', async (req, res) => {
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

        const safeLimit = Math.min(parseInt(limit) || 50, 100);
        const safeOffset = parseInt(offset) || 0;

        params.push(safeLimit, safeOffset);

        const [guides] = await db.query(query, params);
        sendSuccess(res, guides);
    } catch (error) {
        sendError(res, 'Get guides error', 500, error);
    }
});

/**
 * @route   GET /api/guides/:id
 * @desc    Get single guide
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const [guides] = await db.query(
            'SELECT * FROM guides WHERE id = ?',
            [req.params.id]
        );

        if (guides.length === 0) {
            return sendError(res, 'ไม่พบข้อมูล', 404);
        }

        const guide = guides[0];

        // Fetch images
        const [images] = await db.query('SELECT id, image_url FROM guide_images WHERE guide_id = ? ORDER BY display_order ASC', [guide.id]);
        guide.images = images;

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'guide', req.params.id, async () => {
            await db.query('UPDATE guides SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        sendSuccess(res, guide);
    } catch (error) {
        sendError(res, 'Get guide error', 500, error);
    }
});

export default router;
