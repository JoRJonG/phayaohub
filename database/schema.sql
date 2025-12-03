-- ฐานข้อมูล Phayao Hub
-- สร้างฐานข้อมูลและตารางที่จำเป็น

-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS phayaohub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phayaohub;

-- ตาราง users (ผู้ใช้งาน)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง categories (หมวดหมู่)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  type ENUM('market', 'job', 'community') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง market_items (สินค้าตลาดมือสอง)
CREATE TABLE IF NOT EXISTS market_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  condition_type ENUM('new', 'like_new', 'good', 'fair') DEFAULT 'good',
  location VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_line VARCHAR(100),
  status ENUM('available', 'sold', 'reserved', 'inactive') DEFAULT 'available',
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_category (category_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง market_images (รูปภาพสินค้า)
CREATE TABLE IF NOT EXISTS market_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES market_items(id) ON DELETE CASCADE,
  INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง jobs (ประกาศงาน)
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  description TEXT,
  job_type ENUM('full_time', 'part_time', 'freelance', 'internship') DEFAULT 'full_time',
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_type ENUM('monthly', 'daily', 'hourly', 'project') DEFAULT 'monthly',
  location VARCHAR(255),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_line VARCHAR(100),
  requirements TEXT,
  benefits TEXT,
  status ENUM('open', 'closed', 'inactive') DEFAULT 'open',
  view_count INT DEFAULT 0,
  application_count INT DEFAULT 0,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_category (category_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง job_applications (การสมัครงาน)
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  user_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  resume_url VARCHAR(500),
  cover_letter TEXT,
  status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (job_id, user_id),
  INDEX idx_job (job_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง guides (คู่มือท่องเที่ยว/ข้อมูลพะเยา)
CREATE TABLE IF NOT EXISTS guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  category VARCHAR(100),
  image_url VARCHAR(500),
  view_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  status ENUM('draft', 'published', 'archived') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง community_posts (โพสต์ชุมชน)
CREATE TABLE IF NOT EXISTS community_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100),
  image_url VARCHAR(500),
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง comments (ความคิดเห็น)
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  INDEX idx_post (post_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง favorites (รายการโปรด)
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('market', 'job', 'guide', 'post') NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, item_type, item_id),
  INDEX idx_user (user_id),
  INDEX idx_item (item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- เพิ่มข้อมูลตัวอย่าง Categories
INSERT INTO categories (name, slug, description, icon, type) VALUES
('อิเล็กทรอนิกส์', 'electronics', 'มือถือ คอมพิวเตอร์ อุปกรณ์ไอที', '📱', 'market'),
('เฟอร์นิเจอร์', 'furniture', 'โต๊ะ เก้าอี้ ตู้ ชั้นวางของ', '🪑', 'market'),
('ยานพาหนะ', 'vehicles', 'รถยนต์ รถมอเตอร์ไซค์ จักรยาน', '🚗', 'market'),
('เสื้อผ้าแฟชั่น', 'fashion', 'เสื้อผ้า รองเท้า กระเป๋า', '👕', 'market'),
('ของใช้ในบ้าน', 'home', 'ของใช้ในครัว ของตกแต่งบ้าน', '🏠', 'market'),
('หนังสือ', 'books', 'หนังสือ นิตยสาร การ์ตูน', '📚', 'market'),
('กีฬาและกิจกรรม', 'sports', 'อุปกรณ์กีฬา ฟิตเนส กลางแจ้ง', '⚽', 'market'),
('อื่นๆ', 'others', 'สินค้าอื่นๆ', '📦', 'market'),

('IT/เทคโนโลยี', 'it-tech', 'โปรแกรมเมอร์ นักพัฒนา IT Support', '💻', 'job'),
('การตลาด/ขาย', 'marketing-sales', 'การตลาด ขาย ประชาสัมพันธ์', '📊', 'job'),
('บริการลูกค้า', 'customer-service', 'งานบริการ ต้อนรับ', '🤝', 'job'),
('การศึกษา', 'education', 'ครู อาจารย์ ติวเตอร์', '📖', 'job'),
('ร้านอาหาร/โรงแรม', 'hospitality', 'พนักงานเสิร์ฟ พ่อครัว แม่บ้าน', '🍽️', 'job'),
('ก่อสร้าง', 'construction', 'ช่างก่อสร้าง วิศวกร', '🏗️', 'job'),
('สุขภาพ/ความงาม', 'health-beauty', 'พยาบาล นักกายภาพ ช่างทำผม', '💆', 'job'),
('งานทั่วไป', 'general', 'งานทั่วไป งานพาร์ทไทม์', '💼', 'job');

-- เพิ่มข้อมูลตัวอย่าง User (Admin)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@phayaohub.com', '$2a$10$YourHashedPasswordHere', 'ผู้ดูแลระบบ', 'admin');

-- ตาราง system_settings (เก็บค่า config เช่น hero background)
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  setting_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ค่า default hero background
INSERT IGNORE INTO system_settings (setting_key, setting_value)
VALUES ('hero_bg_image', 'https://picsum.photos/1920/1080?blur=2');

-- เพิ่มข้อมูลตัวอย่าง Guides
INSERT INTO guides (title, slug, description, content, category, is_featured, status) VALUES
('สถานที่ท่องเที่ยวในพะเยา', 'tourist-attractions', 'แนะนำสถานที่ท่องเที่ยวยอดนิยมในจังหวัดพะเยา', 
'<h2>กว๊านพะเยา</h2><p>แหล่งท่องเที่ยวที่สำคัญที่สุดของจังหวัดพะเยา มีความสวยงามทั้งกลางวันและกลางคืน</p>', 
'ท่องเที่ยว', TRUE, 'published'),

('ร้านอาหารแนะนำ', 'recommended-restaurants', 'ร้านอาหารอร่อยในพะเยา', 
'<h2>ร้านอาหารริมกว๊าน</h2><p>ร้านอาหารที่มีวิวสวยริมกว๊านพะเยา</p>', 
'อาหาร', TRUE, 'published'),

('วัฒนธรรมและประเพณี', 'culture-tradition', 'วัฒนธรรมและประเพณีของชาวพะเยา', 
'<h2>ประเพณีไหลเรือไฟ</h2><p>ประเพณีสำคัญของจังหวัดพะเยา จัดในช่วงเดือนตุลาคมของทุกปี</p>', 
'วัฒนธรรม', FALSE, 'published');

-- สร้าง View สำหรับสถิติ
CREATE OR REPLACE VIEW market_stats AS
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN status = 'available' THEN 1 END) as available_items,
  COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_items,
  AVG(price) as avg_price
FROM market_items;

CREATE OR REPLACE VIEW job_stats AS
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_jobs,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_jobs,
  AVG(application_count) as avg_applications
FROM jobs;
