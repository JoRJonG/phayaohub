import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import logger from './utils/logger.js';

dotenv.config({ path: '.env.local' });

// Helper: return first non-empty env value from the list of names
const getEnv = (...names) => {
  for (const n of names) {
    const v = process.env[n];
    if (v != null && String(v).trim() !== '') return v;
  }
  return undefined;
};

const parsedPort = (() => {
  const v = getEnv('DB_PORT', 'MYSQL_PORT');
  if (v == null || v === '') return 3306;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 3306;
})();

const dbConfig = {
  host: getEnv('DB_HOST', 'MYSQL_HOST') || 'localhost',
  user: getEnv('DB_USER', 'MYSQL_USER') || 'root',
  password: getEnv('DB_PASSWORD', 'MYSQL_PASSWORD') || '',
  database: getEnv('DB_NAME', 'MYSQL_DATABASE', 'MYSQL_DB') || 'phayaohub',
  port: parsedPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  dateStrings: true
};

// Add SSL configuration if enabled
if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = {
    rejectUnauthorized: false // Adjust based on your certificate needs
  };
}

export const db = mysql.createPool(dbConfig);

// ตั้งค่า Timezone ของ Session ให้เป็น +07:00 สำหรับทุก Connection
db.on('connection', (connection) => {
  connection.query('SET time_zone = "+07:00"');
});

// Test connection
db.getConnection()
  .then(connection => {
    logger.info('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    logger.error('❌ Database connection failed:', err);
  });
