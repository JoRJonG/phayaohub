/**
 * Sanitize input string by escaping HTML characters
 * @param {string} text - Input text
 * @returns {string} Sanitized text
 */
export const sanitizeInput = (text) => {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
