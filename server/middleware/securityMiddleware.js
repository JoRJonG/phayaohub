import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Rate Limiting
// General limiter for most routes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per 15 minutes (reduced from 1000)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    skip: (req) => {
        // Skip rate limiting for static files
        return req.path.startsWith('/uploads');
    }
});



// Bot Blocker Middleware
export const botBlocker = (req, res, next) => {
    const userAgent = req.get('User-Agent');
    if (!userAgent) {
        return next();
    }

    const botPatterns = [
        'bot', 'spider', 'crawl', 'scanner', 'curl', 'wget', 'python', 'ruby', 'go-http-client',
        'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'bingbot', 'googlebot', 'slurp', 'baiduspider',
        'yandex', 'sogou', 'exabot', 'facebot', 'ia_archiver'
    ];

    // Allow legitimate bots if needed (e.g., Googlebot for SEO)
    // For now, we are blocking "unsafe" bots as requested. 
    // Note: Blocking 'googlebot' might hurt SEO. The user asked to block "unsafe bots".
    // I will filter out known good bots from the block list if the user wants "unsafe" ones blocked.
    // However, the user said "block unsafe bot IPs auto". 
    // Let's stick to a list of generally aggressive/useless bots for a private app or just block suspicious ones.
    // Given the request "block unsafe bots", I'll block common scanners and tools, but maybe keep search engines?
    // The user said "unsafe bots". I'll block generic 'bot' pattern but maybe exclude known search engines if this was a public site.
    // But for "Phayao Hub", it's likely a public site.
    // Let's refine the list to be "bad bots".

    const badBots = [
        'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'blexbot', 'seokicks', 'megaindex', 'waitify',
        'python-requests', 'curl', 'wget', 'netcraft', 'nmap', 'sqlmap', 'nikto', 'masscan'
    ];

    const isBadBot = badBots.some(bot => userAgent.toLowerCase().includes(bot));

    if (isBadBot) {
        console.log(`Blocked bad bot: ${userAgent} from IP: ${req.ip}`);
        return res.status(403).json({ success: false, error: 'Access denied' });
    }

    next();
};

// Sensitive File Blocker Middleware
export const sensitiveFileBlocker = (req, res, next) => {
    const sensitivePatterns = [
        /\.env/, /\.git/, /\.vscode/, /\.idea/,
        /package\.json/, /package-lock\.json/,
        /node_modules/, /server\//, /src\//
    ];

    const isSensitive = sensitivePatterns.some(pattern => pattern.test(req.path));

    if (isSensitive) {
        console.log(`Blocked sensitive file access: ${req.path} from IP: ${req.ip}`);
        return res.status(403).json({ success: false, error: 'Access denied' });
    }

    next();
};

// Stricter limiter for auth routes (login/register)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 login/register requests per hour (reduced from 100)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many login attempts from this IP, please try again after an hour'
    },
    skipSuccessfulRequests: true // Don't count successful logins against limit
});

// Input Validation Middleware
export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(400).json({
            success: false,
            error: 'ข้อมูลไม่ถูกต้อง',
            details: errors.array()
        });
    };
};

// Validation Rules
export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('ชื่อผู้ใช้ต้องมีความยาว 3-20 ตัวอักษร')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น'),
    body('email')
        .trim()
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข'),
    body('full_name')
        .trim()
        .notEmpty().withMessage('กรุณากรอกชื่อ-นามสกุล')
        .escape(), // Prevent XSS
    body('phone')
        .optional()
        .trim()
        .escape() // Prevent XSS
];

export const loginValidation = [
    body('username') // Can be username or email
        .trim()
        .notEmpty().withMessage('กรุณากรอกชื่อผู้ใช้หรืออีเมล'),
    body('password')
        .notEmpty().withMessage('กรุณากรอกรหัสผ่าน')
];

export const changePasswordValidation = [
    body('current_password')
        .notEmpty().withMessage('กรุณากรอกรหัสผ่านปัจจุบัน'),
    body('new_password')
        .isLength({ min: 8 }).withMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข')
        .not().equals('current_password').withMessage('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม')
];
