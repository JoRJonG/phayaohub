import logger from '../utils/logger.js';

/**
 * Checks if a view should be incremented based on cookies.
 * If allowed, executes the increment function and sets a cookie.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} itemType - Type of item (e.g., 'market', 'job', 'post', 'guide', 'profile')
 * @param {number|string} itemId - ID of the item
 * @param {Function} incrementFn - Async function to increment view count in DB
 * @returns {Promise<boolean>} - True if incremented, False if blocked by cookie
 */
export const checkAndIncrementView = async (req, res, itemType, itemId, incrementFn) => {
    const cookieName = `viewed_${itemType}_${itemId}`;

    // Check if cookie exists
    if (req.cookies && req.cookies[cookieName]) {
        return false; // Already viewed recently
    }

    try {
        // Increment view count in DB
        await incrementFn();

        // Set cookie with 30 minutes expiration
        // maxAge is in milliseconds (30 * 60 * 1000 = 30 minutes)
        res.cookie(cookieName, 'true', {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return true;
    } catch (error) {
        logger.error(`Error incrementing view for ${itemType} ${itemId}:`, error);
        throw error;
    }
};
