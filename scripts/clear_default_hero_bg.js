import { db } from '../server/db.js';

async function migrate() {
    try {
        console.log('Clearing default hero background image...');
        await db.query(`
      UPDATE system_settings 
      SET setting_value = '' 
      WHERE setting_key = 'hero_bg_image' 
      AND setting_value LIKE '%picsum.photos%'
    `);
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
