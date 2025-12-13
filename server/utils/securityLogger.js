import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logsDir, 'security.log');

// สร้างโฟลเดอร์ logs ถ้ายังไม่มี
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

export const logSecurityEvent = (event, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        ...details
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFile(logFile, logLine, (err) => {
        if (err) console.error('Failed to write security log:', err);
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Security Event:', event, details);
    }
};
