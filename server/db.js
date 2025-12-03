import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import logger from './utils/logger.js';

dotenv.config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phayaohub',
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
