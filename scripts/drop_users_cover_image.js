import { db } from '../server/db.js';

async function migrate() {
    try {
        console.log('Dropping cover_image column from users table...');
        await db.query(`
      ALTER TABLE users
      DROP COLUMN cover_image
    `);
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log('Column cover_image does not exist');
            process.exit(0);
        }
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
