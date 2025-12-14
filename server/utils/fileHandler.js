import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to uploads directory (go up two levels: utils -> server -> root, then into uploads)
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * Deletes a file from the uploads directory
 * @param {string} fileUrl - The URL of the file (e.g., /uploads/filename.jpg or /uploads/guides/filename.webp)
 */
export const deleteFile = (fileUrl) => {
    if (!fileUrl) {
        console.log('⚠️ deleteFile called with empty fileUrl');
        return;
    }

    try {
        console.log('🔍 Attempting to delete file:', fileUrl);

        // Extract path after /uploads/
        const uploadsIndex = fileUrl.indexOf('/uploads/');
        if (uploadsIndex === -1) {
            console.log('⚠️ Invalid file URL format:', fileUrl);
            return;
        }

        // Get the relative path from /uploads/ onwards
        const relativePath = fileUrl.substring(uploadsIndex + '/uploads/'.length);
        if (!relativePath) {
            console.log('⚠️ Could not extract relative path from:', fileUrl);
            return;
        }

        // Normalize the path to handle different separators
        const filePath = path.normalize(path.join(UPLOADS_DIR, relativePath));
        console.log('📁 Full path:', filePath);

        // Security check: ensure the path is within UPLOADS_DIR
        const normalizedUploadsDir = path.normalize(UPLOADS_DIR);
        if (!filePath.startsWith(normalizedUploadsDir)) {
            console.log('⚠️ Security: Attempted to delete file outside uploads directory');
            return;
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Successfully deleted file: ${relativePath}`);
        } else {
            console.log(`⚠️ File not found at path: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error deleting file ${fileUrl}:`, error);
    }
};
