import express from 'express';
import { createFamily } from '../controllers/family.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { joinFamily } from '../controllers/family.controller.js';
const router = express.Router();

router.post('/', protect, createFamily);
router.post('/join', protect, joinFamily);
export default router;
