import { db } from '../server/db.js';

async function checkIndexes() {
    try {
        const tables = ['market_items', 'jobs', 'community_posts', 'users'];
        for (const table of tables) {
            console.log(`\nIndexes for table: ${table}`);
            const [rows] = await db.query(`SHOW INDEX FROM ${table}`);
            console.table(rows.map(row => ({
                Key_name: row.Key_name,
                Column_name: row.Column_name,
                Non_unique: row.Non_unique
            })));
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkIndexes();
