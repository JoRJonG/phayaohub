/**
 * Simple logger utility to standardize logging across the application.
 * Can be easily replaced with a more robust library like Winston or Pino in the future.
 */

const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({
            level: 'info',
            timestamp: new Date().toISOString(),
            message,
            ...meta
        }));
    },
    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta
        }));
    },
    error: (message, error = null, meta = {}) => {
        console.error(JSON.stringify({
            level: 'error',
            timestamp: new Date().toISOString(),
            message,
            error: error instanceof Error ? {
                message: error.message,
                stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
                ...error
            } : error,
            ...meta
        }));
    }
};

export default logger;
