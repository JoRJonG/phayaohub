import { db } from './db.js';

async function checkPosts() {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM community_posts');
        console.log(`Total posts: ${rows[0].count}`);

        if (rows[0].count === 0) {
            console.log('No posts found. Seeding data...');
            await seedPosts();
        } else {
            console.log('Posts already exist.');
        }
    } catch (error) {
        console.error('Error checking posts:', error);
    } finally {
        process.exit();
    }
}

async function seedPosts() {
    try {
        // Ensure users exist first (using IDs 1, 2, 3 as examples or creating dummy ones if needed)
        // For simplicity, assuming users 1, 2, 3 exist from previous seeds or we use existing ones.
        // Let's check users first.
        const [users] = await db.query('SELECT id FROM users LIMIT 1');
        let userId = 1;
        if (users.length > 0) {
            userId = users[0].id;
        } else {
            console.log('No users found. Creating a default user...');
            const [result] = await db.query("INSERT INTO users (username, email, password_hash, full_name, role) VALUES ('admin', 'admin@example.com', 'hash', 'Admin User', 'admin')");
            userId = result.insertId;
        }

        const posts = [
            {
                user_id: userId,
                title: 'แนะนำร้านอาหารอร่อยในพะเยา',
                content: 'วันนี้ขอแนะนำร้านอาหารอร่อยๆ ในพะเยากันค่ะ มีร้านก๋วยเตี๋ยวอันเจริญ ร้านซอย 5 และร้านอื่นๆ อีกมากมาย ใครมีร้านไหนแนะนำบ้างคะ?',
                category: 'อาหาร',
                like_count: 15,
                comment_count: 0,
                view_count: 120
            },
            {
                user_id: userId,
                title: 'ที่เที่ยวสวยๆ รอบกว๊านพะเยา',
                content: 'สวัสดีค่ะ วันนี้พาทุกคนไปเที่ยวรอบกว๊านพะเยากัน บรรยากาศดีมาก เหมาะแก่การพักผ่อนหย่อนใจ',
                category: 'ท่องเที่ยว',
                like_count: 25,
                comment_count: 0,
                view_count: 200
            },
            {
                user_id: userId,
                title: 'หางานในพะเยา มีที่ไหนแนะนำบ้างคะ',
                content: 'สวัสดีค่ะ อยากหางานทำในพะเยา มีที่ไหนแนะนำบ้างคะ จบปริญญาตรีบริหารธุรกิจค่ะ',
                category: 'งาน',
                like_count: 8,
                comment_count: 0,
                view_count: 85
            }
        ];

        for (const post of posts) {
            await db.query(
                'INSERT INTO community_posts (user_id, title, content, category, like_count, comment_count, view_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, "active")',
                [post.user_id, post.title, post.content, post.category, post.like_count, post.comment_count, post.view_count]
            );
        }
        console.log('Seeding completed.');
    } catch (error) {
        console.error('Error seeding posts:', error);
    }
}

checkPosts();
