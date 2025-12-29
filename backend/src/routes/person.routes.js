import express from 'express';
import { addPerson, getFamilyPersons,getFamilyTree } from '../controllers/person.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { editPerson } from '../controllers/person.controller.js';

const router = express.Router();

router.post('/', protect, addPerson);
router.patch('/:id', protect, editPerson);
router.get('/family', protect, getFamilyPersons);
router.get('/tree', protect, getFamilyTree);
export default router;
