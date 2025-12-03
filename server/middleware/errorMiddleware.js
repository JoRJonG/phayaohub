import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log the error
    logger.error('Unhandled Error', err, {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(statusCode).json({
        success: false,
        error: statusCode === 500 ? 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

/**
 * Middleware to handle 404 Not Found
 */
export const notFound = (req, res, next) => {
    const error = new Error(`ไม่พบเส้นทาง - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
