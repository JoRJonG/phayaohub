import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let errorMessage = err.message;

    // Handle MySQL specific errors
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        errorMessage = 'ข้อมูลนี้มีอยู่ในระบบแล้ว (Duplicate Entry)';
        // If we can extract the duplicate field from err.sqlMessage, we can be more specific
        if (err.sqlMessage && err.sqlMessage.includes('username')) {
            errorMessage = 'ชื่อผู้ใช้นี้มีคนใช้งานแล้ว';
        } else if (err.sqlMessage && err.sqlMessage.includes('email')) {
            errorMessage = 'อีเมลนี้มีคนใช้งานแล้ว';
        }
    } else if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        errorMessage = 'ไม่สามารถลบหรือแก้ไขข้อมูลได้ เนื่องจากมีข้อมูลอื่นอ้างอิงอยู่';
    }

    // Log the error
    logger.error('Unhandled Error', err, {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        mysqlCode: err.code
    });

    res.status(statusCode).json({
        success: false,
        error: statusCode === 500 ? 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' : errorMessage,
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
