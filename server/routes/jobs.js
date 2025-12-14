import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { checkAndIncrementView } from '../services/viewService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { sanitizeInput } from '../utils/sanitizers.js';

const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs
 * @access  Public
 */
router.get('/', async (req, res) => {
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

        const safeLimit = Math.min(parseInt(limit) || 20, 100);
        const safeOffset = parseInt(offset) || 0;

        query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
        params.push(safeLimit, safeOffset);

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
        sendError(res, 'Get jobs error', 500, error);
    }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job
 * @access  Public
 */
router.get('/:id', async (req, res) => {
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
            return sendError(res, 'ไม่พบงาน', 404);
        }

        // Increment view count with cookie check
        await checkAndIncrementView(req, res, 'job', req.params.id, async () => {
            await db.query('UPDATE jobs SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
        });

        sendSuccess(res, jobs[0]);
    } catch (error) {
        sendError(res, 'Get job error', 500, error);
    }
});

/**
 * @route   POST /api/jobs
 * @desc    Create new job
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
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
            [
                req.user.id,
                category_id,
                sanitizeInput(title),
                sanitizeInput(company_name),
                sanitizeInput(description),
                job_type,
                salary_min,
                salary_max,
                salary_type,
                sanitizeInput(location),
                sanitizeInput(contact_email),
                sanitizeInput(contact_phone),
                sanitizeInput(contact_line),
                sanitizeInput(requirements),
                sanitizeInput(benefits)
            ]
        );

        res.json({ success: true, message: 'เพิ่มประกาศงานสำเร็จ', id: result.insertId });
    } catch (error) {
        sendError(res, 'Create job error', 500, error);
    }
});

export default router;
