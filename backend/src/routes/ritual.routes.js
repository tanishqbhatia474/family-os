import express from 'express';
import {
  createRitual,
  getFamilyRituals,
  getPersonRituals,
  updateRitual,
  deleteRitual
} from '../controllers/ritual.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create ritual
router.post('/', protect, createRitual);
router.get('/family', protect, getFamilyRituals);
router.get('/person/:personId', protect, getPersonRituals);
router.patch('/:id', protect, updateRitual);
router.delete('/:id', protect, deleteRitual);

export default router;
