# วิธีการใช้งาน Backend

## 🚀 การเริ่มต้นใช้งาน

### 1. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่มข้อมูลการเชื่อมต่อฐานข้อมูล:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=phayaohub
PORT=3001
```

### 2. สร้างฐานข้อมูล
สร้างฐานข้อมูลและตารางตัวอย่าง:

```sql
CREATE DATABASE phayaohub;
USE phayaohub;

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. รัน Backend Server
เปิด Terminal ใหม่และรันคำสั่ง:

```bash
npm run server
```

Server จะรันที่ `http://localhost:3001`

### 4. รัน Frontend (Terminal แยก)
```bash
npm run dev
```

Frontend จะรันที่ `http://localhost:3000`

---

## 📡 API Endpoints

### ทดสอบการเชื่อมต่อฐานข้อมูล
```
GET /api/test-db
```

### ดึงข้อมูลทั้งหมด
```
GET /api/items
```

### เพิ่มข้อมูลใหม่
```
POST /api/items
Content-Type: application/json

{
  "title": "ชื่อสินค้า",
  "description": "รายละเอียด",
  "image_url": "/uploads/xxx.jpg"
}
```

### อัพโหลดไฟล์เดียว
```
POST /api/upload/single
Content-Type: multipart/form-data

file: [File]
```

### อัพโหลดหลายไฟล์
```
POST /api/upload/multiple
Content-Type: multipart/form-data

files: [File, File, ...]
```

---

## 💡 ตัวอย่างการใช้งานใน React Component

```tsx
import { useState } from 'react';
import { uploadSingleFile, createItem } from './services/api';

function UploadForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadSingleFile(file);
      if (result.success) {
        setImageUrl(result.url);
        alert('อัพโหลดรูปภาพสำเร็จ!');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createItem({
        title,
        description,
        image_url: imageUrl
      });
      
      if (result.success) {
        alert('บันทึกข้อมูลสำเร็จ!');
        setTitle('');
        setDescription('');
        setImageUrl('');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="ชื่อสินค้า"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <textarea
        placeholder="รายละเอียด"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {imageUrl && <img src={imageUrl} alt="Preview" />}
      
      <button type="submit">บันทึก</button>
    </form>
  );
}
```

---

## 📁 โครงสร้างไฟล์

```
phayaohub/
├── server/
│   ├── index.js          # Main server file
│   ├── db.js             # Database connection
│   ├── routes/
│   │   └── upload.js     # Upload routes
│   └── uploads/          # Uploaded files (auto-created)
├── services/
│   └── api.ts            # Frontend API functions
├── .env.local            # Environment variables (ไม่ commit)
└── .env.example          # Template สำหรับ .env.local
```

---

## ⚙️ คุณสมบัติ

✅ ใช้ `mysql2` สำหรับเชื่อมต่อ MySQL  
✅ อัพโหลดรูปภาพไปที่โฟลเดอร์ `server/uploads`  
✅ รองรับการอัพโหลดทั้งไฟล์เดียวและหลายไฟล์  
✅ กรองเฉพาะไฟล์รูปภาพ (jpg, png, gif, webp)  
✅ จำกัดขนาดไฟล์ 5MB  
✅ สร้างชื่อไฟล์ที่ไม่ซ้ำกันอัตโนมัติ  
✅ Vite Proxy สำหรับ API และไฟล์ uploads  
✅ React Router DOM สำหรับการนำทาง
