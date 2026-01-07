import express from 'express';
import { createFamily, getFamilyDetails } from '../controllers/family.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { joinFamily } from '../controllers/family.controller.js';
const router = express.Router();

router.post('/', protect, createFamily);
router.post('/join', protect, joinFamily);
router.get('/', protect, getFamilyDetails);
export default router;
