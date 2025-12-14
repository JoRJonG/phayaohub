import logger from './logger.js';

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {any} data - Data to send
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Error} error - Optional error object for logging
 */
export const sendError = (res, message, statusCode = 500, error = null) => {
    if (error) {
        logger.error(message, error);
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
};
