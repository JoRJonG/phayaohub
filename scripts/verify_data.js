import { db } from '../server/db.js';

async function verifyData() {
    try {
        console.log('--- Verifying Users ---');
        const [users] = await db.query('SELECT id, username, email, role FROM users');
        console.table(users);

        console.log('\n--- Verifying Data Counts ---');
        const [items] = await db.query('SELECT COUNT(*) as count FROM market_items');
        const [jobs] = await db.query('SELECT COUNT(*) as count FROM jobs');
        const [posts] = await db.query('SELECT COUNT(*) as count FROM community_posts');

        console.log(`Market Items: ${items[0].count}`);
        console.log(`Jobs: ${jobs[0].count}`);
        console.log(`Community Posts: ${posts[0].count}`);

        const adminUser = users.find(u => u.role === 'admin');
        if (adminUser) {
            console.log(`\n✅ Found Admin User: ${adminUser.username}`);
        } else {
            console.log('\n❌ No Admin User Found!');
        }

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        process.exit();
    }
}

verifyData();
