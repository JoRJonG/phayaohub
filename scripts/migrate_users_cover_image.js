import { db } from '../server/db.js';

async function migrate() {
    try {
        console.log('Adding cover_image column to users table...');
        await db.query(`
      ALTER TABLE users
      ADD COLUMN cover_image varchar(500) DEFAULT NULL AFTER avatar_url
    `);
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column cover_image already exists');
            process.exit(0);
        }
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
