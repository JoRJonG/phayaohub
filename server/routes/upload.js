import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { authMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Require login for all upload routes
router.use(authMiddleware);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ใช้ memory storage เพื่อนำไฟล์มา process ต่อด้วย sharp
const storage = multer.memoryStorage();

// กรองเฉพาะไฟล์รูปภาพ
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพและ PDF เท่านั้น!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // จำกัดขนาด 50MB
});

// ฟังก์ชันสำหรับ process และบันทึกไฟล์
const processAndSaveImage = async (buffer, originalName, folder = 'others') => {
  // Whitelist folders
  const allowedFolders = ['market', 'posts', 'users', 'guides', 'others'];
  const targetFolder = allowedFolders.includes(folder) ? folder : 'others';

  const targetDir = path.join(uploadDir, targetFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // ถ้าเป็น PDF ให้บันทึกไฟล์เลย ไม่ต้องใช้ sharp
  if (originalName.toLowerCase().endsWith('.pdf')) {
    const filename = uniqueSuffix + '.pdf';
    const filepath = path.join(targetDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `${targetFolder}/${filename}`;
  }

  const filename = uniqueSuffix + '.webp';
  const filepath = path.join(targetDir, filename);

  await sharp(buffer)
    .webp({ quality: 80 }) // แปลงเป็น webp คุณภาพ 80%
    .toFile(filepath);

  return `${targetFolder}/${filename}`;
};

// Helper middleware to handle single file upload errors
const handleSingleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      logger.error('Multer single upload error', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// Helper middleware to handle multiple file upload errors
const handleMultipleUpload = (req, res, next) => {
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      logger.error('Multer multiple upload error', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// Route สำหรับอัพโหลดไฟล์เดียว
router.post('/single', handleSingleUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'ไม่มีไฟล์ที่อัพโหลด' });
    }

    const folder = req.body.folder || req.query.folder || 'others';
    logger.info(`Processing single upload to folder: ${folder} by user: ${req.user.username}`);

    const filename = await processAndSaveImage(req.file.buffer, req.file.originalname, folder);
    const fileUrl = `/uploads/${filename}`;

    res.json({
      success: true,
      message: 'อัพโหลดไฟล์สำเร็จ',
      filename: filename,
      url: fileUrl,
      originalName: req.file.originalname
    });
  } catch (error) {
    logger.error('Upload handler error', error);
    next(error);
  }
});

// Route สำหรับอัพโหลดหลายไฟล์
router.post('/multiple', handleMultipleUpload, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'ไม่มีไฟล์ที่อัพโหลด' });
    }

    const folder = req.body.folder || req.query.folder || 'others';
    logger.info(`Processing multiple upload to folder: ${folder}, files: ${req.files.length} by user: ${req.user.username}`);

    const files = await Promise.all(req.files.map(async (file) => {
      const filename = await processAndSaveImage(file.buffer, file.originalname, folder);
      return {
        filename: filename,
        url: `/uploads/${filename}`,
        originalName: file.originalname
      };
    }));

    res.json({
      success: true,
      message: `อัพโหลด ${req.files.length} ไฟล์สำเร็จ`,
      files: files
    });
  } catch (error) {
    logger.error('Upload handler error', error);
    next(error);
  }
});

// Default route for backward compatibility (defaults to single upload)
router.post('/', handleSingleUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'ไม่มีไฟล์ที่อัพโหลด' });
    }

    const folder = req.body.folder || req.query.folder || 'others';
    logger.info(`Processing default upload to folder: ${folder} by user: ${req.user.username}`);

    const filename = await processAndSaveImage(req.file.buffer, req.file.originalname, folder);
    const fileUrl = `/uploads/${filename}`;

    res.json({
      success: true,
      message: 'อัพโหลดไฟล์สำเร็จ',
      filename: filename,
      fileUrl: fileUrl, // Support both naming conventions if needed
      url: fileUrl,
      originalName: req.file.originalname
    });
  } catch (error) {
    logger.error('Upload handler error', error);
    next(error);
  }
});

export default router;
