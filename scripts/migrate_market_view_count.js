import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phayao_hub',
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Check if view_count column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'market_items' AND COLUMN_NAME = 'view_count'
        `, [dbConfig.database]);

        if (columns.length === 0) {
            console.log('Adding view_count column to market_items table...');
            await connection.query(`
                ALTER TABLE market_items
                ADD COLUMN view_count INT DEFAULT 0
            `);
            console.log('Successfully added view_count column.');
        } else {
            console.log('view_count column already exists.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
