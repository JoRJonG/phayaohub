import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to uploads directory (relative to this file: ../uploads)
const UPLOADS_DIR = path.join(__dirname, '../uploads');

/**
 * Deletes a file from the uploads directory
 * @param {string} fileUrl - The URL of the file (e.g., /uploads/filename.jpg)
 */
export const deleteFile = (fileUrl) => {
    if (!fileUrl) {
        console.log('⚠️ deleteFile called with empty fileUrl');
        return;
    }

    try {
        console.log('🔍 Attempting to delete file:', fileUrl);

        // Extract filename from URL
        const filename = fileUrl.split('/uploads/')[1];
        if (!filename) {
            console.log('⚠️ Could not extract filename from:', fileUrl);
            return;
        }

        const filePath = path.join(UPLOADS_DIR, filename);
        console.log('📁 Full path:', filePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Successfully deleted file: ${filename}`);
        } else {
            console.log(`⚠️ File not found at path: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error deleting file ${fileUrl}:`, error);
    }
};
