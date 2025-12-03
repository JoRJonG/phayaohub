import { db } from '../server/db.js';

async function migrate() {
    try {
        console.log('Checking users table schema...');
        const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "status"');

        if (columns.length === 0) {
            console.log('Adding status column to users table...');
            await db.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active' AFTER role");
            console.log('✅ Status column added successfully.');
        } else {
            console.log('ℹ️ Status column already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
