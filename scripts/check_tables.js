import { db } from '../server/db.js';

async function checkTables() {
    try {
        const [rows] = await db.query('SHOW TABLES');
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkTables();
