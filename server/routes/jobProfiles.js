import express from 'express';
import * as jobProfileService from '../services/jobProfileService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { checkAndIncrementView } from '../services/viewService.js';

const router = express.Router();

// Get all profiles (public or admin only? Let's make it public for now as per "Job Board" style)
router.get('/', async (req, res) => {
    try {
        const profiles = await jobProfileService.getAllProfiles();
        res.json({ success: true, data: profiles });
    } catch (error) {
        logger.error('Error fetching job profiles:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Get current user's profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const profile = await jobProfileService.getProfileByUserId(req.user.id);
        // Return null instead of 404 if not found, to avoid console errors
        res.json({ success: true, data: profile || null });
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Rate limiting
import rateLimit from 'express-rate-limit';

const profileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

// Validation middleware
import { body, validationResult } from 'express-validator';

const validateProfile = [
    body('full_name').trim().notEmpty().withMessage('Full name is required').escape(),
    body('email').trim().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').optional().trim().escape(),
    body('address').optional().trim().escape(),
    body('experience').optional().trim().escape(),
    body('education').optional().trim().escape(),
    body('skills').optional().trim().escape(),
    body('resume_url').optional().trim().custom(value => {
        if (!value) return true;
        if (value.startsWith('/') || value.startsWith('http')) return true;
        throw new Error('Invalid resume URL or path');
    }),
    body('photo_url').optional().trim().custom(value => {
        if (!value) return true;
        if (value.startsWith('/') || value.startsWith('http')) return true;
        throw new Error('Invalid photo URL or path');
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Create profile
router.post('/', authMiddleware, profileLimiter, validateProfile, async (req, res) => {
    try {
        const existingProfile = await jobProfileService.getProfileByUserId(req.user.id);
        if (existingProfile) {
            return res.status(400).json({ success: false, error: 'User already has a profile' });
        }

        const profileData = {
            user_id: req.user.id,
            ...req.body
        };

        const newProfile = await jobProfileService.createProfile(profileData);
        res.status(201).json({ success: true, data: newProfile });
    } catch (error) {
        logger.error('Error creating job profile:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Update profile
router.put('/:id', authMiddleware, profileLimiter, validateProfile, async (req, res) => {
    try {
        const success = await jobProfileService.updateProfile(req.params.id, req.user.id, req.body);
        if (!success) {
            return res.status(404).json({ success: false, error: 'Profile not found or unauthorized' });
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        logger.error('Error updating job profile:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Delete profile
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const success = await jobProfileService.deleteProfile(req.params.id, req.user.id);
        if (!success) {
            return res.status(404).json({ success: false, error: 'Profile not found or unauthorized' });
        }
        res.json({ success: true, message: 'Profile deleted successfully' });
    } catch (error) {
        logger.error('Error deleting job profile:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
    try {
        await checkAndIncrementView(req, res, 'profile', req.params.id, async () => {
            const success = await jobProfileService.incrementViewCount(req.params.id);
            if (!success) {
                throw new Error('Profile not found');
            }
        });
        res.json({ success: true });
    } catch (error) {
        logger.error('Error incrementing view count:', error);
        if (error.message === 'Profile not found') {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
