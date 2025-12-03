import { db } from '../server/db.js';

async function checkSchema() {
    try {
        const [rows] = await db.query('DESCRIBE users');
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
