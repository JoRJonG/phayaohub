import { db } from '../db.js';
import logger from '../utils/logger.js';

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
        } catch (err) {
            // Ignore error if column already exists
        }
        logger.info('✅ Job Profiles table checked/created successfully');
    } catch (error) {
        logger.error('❌ Error creating Job Profiles table:', error);
    }
};

export const createProfile = async (data) => {
    const { user_id, full_name, email, phone, address, experience, education, skills, resume_url } = data;
    const query = `
    INSERT INTO job_profiles
        (user_id, full_name, email, phone, address, experience, education, skills, resume_url)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const [result] = await db.query(query, [user_id, full_name, email, phone, address, experience, education, skills, resume_url]);
    return { id: result.insertId, ...data };
};

export const getProfileByUserId = async (userId) => {
    const query = `
      SELECT id, user_id, full_name, email, phone, address, experience, education, skills, resume_url, created_at 
      FROM job_profiles WHERE user_id = ?
        `;
    const [rows] = await db.query(query, [userId]);
    return rows[0];
};

export const getAllProfiles = async () => {
    const query = `
    SELECT
    jp.id, jp.full_name, jp.email, jp.phone, jp.address,
        jp.experience, jp.education, jp.skills, jp.resume_url, jp.view_count, jp.created_at
    FROM job_profiles jp 
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
    const { full_name, email, phone, address, experience, education, skills, resume_url } = data;
    const query = `
    UPDATE job_profiles 
    SET full_name = ?, email = ?, phone = ?, address = ?, experience = ?, education = ?, skills = ?, resume_url = ?
        WHERE id = ? AND user_id = ?
            `;
    const [result] = await db.query(query, [full_name, email, phone, address, experience, education, skills, resume_url, id, userId]);
    return result.affectedRows > 0;
};

export const deleteProfile = async (id, userId) => {
    const query = 'DELETE FROM job_profiles WHERE id = ? AND user_id = ?';
    const [result] = await db.query(query, [id, userId]);
    return result.affectedRows > 0;
};
