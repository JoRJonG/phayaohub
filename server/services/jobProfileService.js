import { db } from '../db.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTableIfNotExists = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS job_profiles(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    experience TEXT,
    education TEXT,
    skills TEXT,
    resume_url VARCHAR(255),
    photo_url VARCHAR(255),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
    `;
    try {
        await db.query(query);
        // Migration: Add view_count if not exists
        try {
            await db.query('ALTER TABLE job_profiles ADD COLUMN view_count INT DEFAULT 0');
        } catch (err) { }
        // Migration: Add photo_url if not exists
        try {
            await db.query('ALTER TABLE job_profiles ADD COLUMN photo_url VARCHAR(255)');
        } catch (err) { }
        logger.info('✅ Job Profiles table checked/created successfully');
    } catch (error) {
        logger.error('❌ Error creating Job Profiles table:', error);
    }
};

export const createProfile = async (data) => {
    const { user_id, full_name, email, phone, address, experience, education, skills, resume_url, photo_url } = data;
    const query = `
    INSERT INTO job_profiles
        (user_id, full_name, email, phone, address, experience, education, skills, resume_url, photo_url)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const [result] = await db.query(query, [user_id, full_name, email, phone, address, experience, education, skills, resume_url, photo_url]);
    return { id: result.insertId, ...data };
};

export const getProfileByUserId = async (userId) => {
    const query = `
      SELECT jp.id, jp.user_id, jp.full_name, jp.email, jp.phone, jp.address, jp.experience, jp.education, jp.skills, jp.resume_url, jp.photo_url, jp.created_at, u.avatar_url
      FROM job_profiles jp
      LEFT JOIN users u ON jp.user_id = u.id
      WHERE jp.user_id = ?
        `;
    const [rows] = await db.query(query, [userId]);
    return rows[0];
};

export const getAllProfiles = async () => {
    const query = `
    SELECT
    jp.id, jp.full_name, jp.email, jp.phone, jp.address,
        jp.experience, jp.education, jp.skills, jp.resume_url, jp.photo_url, jp.view_count, jp.created_at,
        u.avatar_url
    FROM job_profiles jp 
    LEFT JOIN users u ON jp.user_id = u.id
    ORDER BY jp.created_at DESC
        `;
    const [rows] = await db.query(query);
    return rows;
};

export const incrementViewCount = async (id) => {
    const query = 'UPDATE job_profiles SET view_count = view_count + 1 WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
};

export const updateProfile = async (id, userId, data) => {
    const { full_name, email, phone, address, experience, education, skills, resume_url, photo_url } = data;
    const query = `
    UPDATE job_profiles 
    SET full_name = ?, email = ?, phone = ?, address = ?, experience = ?, education = ?, skills = ?, resume_url = ?, photo_url = ?
        WHERE id = ? AND user_id = ?
            `;
    const [result] = await db.query(query, [full_name, email, phone, address, experience, education, skills, resume_url, photo_url, id, userId]);
    return result.affectedRows > 0;
};

export const deleteProfile = async (id, userId) => {
    // First, get the profile to find file URLs
    const selectQuery = 'SELECT resume_url, photo_url FROM job_profiles WHERE id = ? AND user_id = ?';
    const [rows] = await db.query(selectQuery, [id, userId]);

    if (rows.length > 0) {
        const { resume_url, photo_url } = rows[0];
        const uploadDir = path.join(__dirname, '../uploads');

        // Helper to delete file
        const deleteFile = (fileUrl) => {
            if (!fileUrl) return;
            // fileUrl format: /uploads/folder/filename.ext
            // We need to extract folder/filename.ext
            const relativePath = fileUrl.replace(/^\/uploads\//, '');
            const filePath = path.join(uploadDir, relativePath);

            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    logger.info(`Deleted file: ${filePath}`);
                } catch (err) {
                    logger.error(`Error deleting file ${filePath}:`, err);
                }
            }
        };

        deleteFile(resume_url);
        deleteFile(photo_url);
    }

    const query = 'DELETE FROM job_profiles WHERE id = ? AND user_id = ?';
    const [result] = await db.query(query, [id, userId]);
    return result.affectedRows > 0;
};
