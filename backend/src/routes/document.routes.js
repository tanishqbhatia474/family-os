import express from 'express';
import { uploadDocument, downloadDocument, listDocuments,deleteDocument} from '../controllers/document.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  upload.single('file'),
  uploadDocument
);

router.get('/:id/download', protect, downloadDocument);
router.get('/family', protect, listDocuments);
router.delete('/:id', protect, deleteDocument);
export default router;