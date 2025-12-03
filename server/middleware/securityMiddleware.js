import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Rate Limiting
// General limiter for most routes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

// Stricter limiter for auth routes (login/register)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 login/register requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many login attempts from this IP, please try again after an hour'
    }
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
        .isLength({ min: 6 }).withMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
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
        .isLength({ min: 6 }).withMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
        .not().equals('current_password').withMessage('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม')
];
