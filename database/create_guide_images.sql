-- Create guide_images table
CREATE TABLE IF NOT EXISTS guide_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guide_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE
);
