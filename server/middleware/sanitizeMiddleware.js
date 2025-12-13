// Sanitize HTML input to prevent XSS (Fallback version - no external dependencies)
export const sanitizeHtml = (req, res, next) => {
    // Skip if no body (e.g., GET requests)
    if (!req.body || Object.keys(req.body).length === 0) {
        return next();
    }

    const fieldsToSanitize = ['title', 'description', 'content', 'message', 'full_name', 'company_name', 'location', 'requirements', 'benefits'];

    for (const field of fieldsToSanitize) {
        if (req.body[field] && typeof req.body[field] === 'string') {
            // Simple HTML tag removal (fallback)
            req.body[field] = req.body[field]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]+>/g, '')
                .trim();
        }
    }

    next();
};

// Sanitize SQL-like characters (extra layer of protection)
export const sanitizeSql = (req, res, next) => {
    const dangerousPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
        /(--|;|\/\*|\*\/|xp_|sp_|0x[0-9a-f]+)/gi,
        /(\bOR\b.*=.*|1=1|'=')/gi
    ];

    const checkValue = (value) => {
        if (typeof value === 'string') {
            for (const pattern of dangerousPatterns) {
                if (pattern.test(value)) {
                    return false;
                }
            }
        }
        return true;
    };

    // Check all body parameters (skip if no body)
    if (req.body && Object.keys(req.body).length > 0) {
        for (const key in req.body) {
            if (!checkValue(req.body[key])) {
                console.warn(`Blocked suspicious input in field: ${key}, value: ${req.body[key]}`);
                return res.status(400).json({
                    success: false,
                    error: 'ตรวจพบข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก'
                });
            }
        }
    }

    // Check query parameters (skip if no query)
    if (req.query && Object.keys(req.query).length > 0) {
        for (const key in req.query) {
            if (!checkValue(req.query[key])) {
                console.warn(`Blocked suspicious query param: ${key}, value: ${req.query[key]}`);
                return res.status(400).json({
                    success: false,
                    error: 'ตรวจพบข้อมูลที่ไม่ถูกต้อง'
                });
            }
        }
    }

    next();
};
