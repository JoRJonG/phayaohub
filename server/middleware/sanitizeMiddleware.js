import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML input to prevent XSS using DOMPurify
export const sanitizeHtml = (req, res, next) => {
    // Skip if no body (e.g., GET requests)
    if (!req.body || Object.keys(req.body).length === 0) {
        return next();
    }

    // List of fields that might contain user input needing sanitization
    const fieldsToSanitize = ['title', 'description', 'content', 'message', 'full_name', 'company_name', 'location', 'requirements', 'benefits'];

    for (const field of fieldsToSanitize) {
        if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = DOMPurify.sanitize(req.body[field], {
                // Allow basic formatting for rich text areas, strip everything else
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'u', 's', 'blockquote'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
                KEEP_CONTENT: true
            }).trim();
        }
    }

    next();
};
