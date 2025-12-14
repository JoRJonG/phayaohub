import express from 'express';
import { db } from '../db.js';
import logger from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', async (req, res) => {
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
        sendSuccess(res, categories);
    } catch (error) {
        sendError(res, 'Get categories error', 500, error);
    }
});

export default router;
