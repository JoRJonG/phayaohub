import { db } from '../server/db.js';

async function migrate() {
    try {
        console.log('Creating system_settings table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(50) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        // Insert default hero background if not exists
        await db.query(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value)
      VALUES ('hero_bg_image', 'https://picsum.photos/1920/1080?blur=2')
    `);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
