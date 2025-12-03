-- ข้อมูลตัวอย่างเพิ่มเติมสำหรับการทดสอบ

USE phayaohub;

-- เพิ่ม Users ตัวอย่าง
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('somchai', 'somchai@example.com', '$2a$10$ExampleHash1', 'สมชาย ใจดี', '081-234-5678', 'user'),
('malee', 'malee@example.com', '$2a$10$ExampleHash2', 'มาลี สวยงาม', '082-345-6789', 'user'),
('somsak', 'somsak@example.com', '$2a$10$ExampleHash3', 'สมศักดิ์ รักเรียน', '083-456-7890', 'user');

-- เพิ่ม Market Items ตัวอย่าง
(1, '/uploads/iphone-2.jpg', FALSE, 2),
(2, '/uploads/macbook-1.jpg', TRUE, 1),
(3, '/uploads/desk-1.jpg', TRUE, 1),
(4, '/uploads/chair-1.jpg', TRUE, 1),
(5, '/uploads/wave-1.jpg', TRUE, 1),
(6, '/uploads/clothes-1.jpg', TRUE, 1),
(7, '/uploads/fridge-1.jpg', TRUE, 1),
(8, '/uploads/books-1.jpg', TRUE, 1);

-- เพิ่ม Jobs ตัวอย่าง
INSERT INTO jobs (user_id, category_id, title, company_name, description, job_type, salary_min, salary_max, salary_type, location, contact_email, contact_phone, status) VALUES
(2, 9, 'โปรแกรมเมอร์ PHP/Laravel', 'บริษัท เทคโนโลยี จำกัด', 'รับสมัครโปรแกรมเมอร์ มีประสบการณ์ 1-3 ปี', 'full_time', 25000.00, 35000.00, 'monthly', 'เมืองพะเยา', 'hr@tech.com', '081-234-5678', 'open'),
(3, 10, 'พนักงานขาย Online', 'ร้านค้าออนไลน์พะเยา', 'รับสมัครพนักงานขายออนไลน์ ทำงานที่บ้านได้', 'part_time', 12000.00, 18000.00, 'monthly', 'ทำงานที่บ้าน', 'shop@example.com', '082-345-6789', 'open'),
(4, 11, 'พนักงานต้อนรับ', 'โรงแรมริมกว๊าน', 'รับสมัครพนักงานต้อนรับ หญิง อายุ 20-30 ปี', 'full_time', 15000.00, 18000.00, 'monthly', 'เมืองพะเยา', 'hotel@example.com', '083-456-7890', 'open'),
(2, 12, 'ครูสอนภาษาอังกฤษ', 'โรงเรียนกวดวิชา', 'รับสมัครครูสอนภาษาอังกฤษ', 'part_time', 300.00, 500.00, 'hourly', 'เมืองพะเยา', 'tutor@example.com', '081-234-5678', 'open'),
(3, 13, 'พนักงานเสิร์ฟ', 'ร้านอาหารริมกว๊าน', 'รับสมัครพนักงานเสิร์ฟ เพศหญิง', 'full_time', 12000.00, 15000.00, 'monthly', 'เมืองพะเยา', 'restaurant@example.com', '082-345-6789', 'open');

-- เพิ่ม Community Posts ตัวอย่าง
INSERT INTO community_posts (user_id, title, content, category, like_count, comment_count, view_count) VALUES
(2, 'แนะนำร้านอาหารอร่อยในพะเยา', 'วันนี้ขอแนะนำร้านอาหารอร่อยๆ ในพะเยากันค่ะ...', 'อาหาร', 15, 3, 120),
(3, 'ที่เที่ยวสวยๆ รอบกว๊านพะเยา', 'สวัสดีค่ะ วันนี้พาทุกคนไปเที่ยวรอบกว๊านพะเยากัน...', 'ท่องเที่ยว', 25, 5, 200),
(4, 'หางานในพะเยา มีที่ไหนแนะนำบ้างคะ', 'สวัสดีค่ะ อยากหางานทำในพะเยา มีที่ไหนแนะนำบ้างคะ', 'งาน', 8, 12, 85),
(2, 'ขายของมือสอง ต้องระวังอะไรบ้าง', 'มีเทคนิคในการขายของมือสองให้ได้ราคาดีไหมคะ', 'ซื้อขาย', 10, 7, 95);

-- เพิ่ม Comments ตัวอย่าง
INSERT INTO comments (user_id, post_id, content) VALUES
(3, 1, 'ขอบคุณสำหรับข้อมูลค่ะ จะลองไปทานดู'),
(4, 1, 'ร้านไหนอร่อยสุดคะ'),
(2, 2, 'สวยมากเลยค่ะ ขอบคุณที่แชร์'),
(3, 3, 'ลองดูที่ JobThai หรือ Indeed ดูค่ะ'),
(4, 4, 'ต้องถ่ายรูปให้สวยๆ แล้วตั้งราคาให้เหมาะสมค่ะ');

-- อัพเดท view_count และ comment_count
UPDATE community_posts SET view_count = view_count + FLOOR(RAND() * 100);
UPDATE market_items SET view_count = view_count + FLOOR(RAND() * 50);
UPDATE jobs SET view_count = view_count + FLOOR(RAND() * 30);
