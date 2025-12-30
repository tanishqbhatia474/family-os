import express from 'express';
import { addPerson, getFamilyPersons,getFamilyTree } from '../controllers/person.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { editPerson } from '../controllers/person.controller.js';
import {
  setFather,
  setMother,
  addChild
} from '../controllers/person.controller.js';

const router = express.Router();

// Specific routes first (before dynamic :id routes)
router.get('/family', protect, getFamilyPersons);
router.get('/tree', protect, getFamilyTree);

// Dynamic routes
router.post('/', protect, addPerson);
router.patch('/:id', protect, editPerson);
router.patch('/:childId/set-father', protect, setFather);
router.patch('/:childId/set-mother', protect, setMother);
router.patch('/:parentId/add-child', protect, addChild);

export default router;
