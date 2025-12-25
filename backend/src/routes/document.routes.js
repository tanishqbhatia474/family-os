import express from 'express';
import { uploadDocument } from '../controllers/document.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  upload.single('file'),
  uploadDocument
);

export default router;
