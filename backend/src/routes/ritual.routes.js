import express from 'express';
import {
  createRitual,
  getFamilyRituals,
  getPersonRituals
} from '../controllers/ritual.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create ritual
router.post('/', protect, createRitual);

// View rituals you are allowed to see (family + access rules)
router.get('/family', protect, getFamilyRituals);

// View rituals written by a specific person (same family)
router.get('/person/:personId', protect, getPersonRituals);

export default router;
