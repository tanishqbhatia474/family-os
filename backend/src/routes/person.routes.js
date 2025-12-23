import express from 'express';
import { addPerson, getFamilyPersons,getFamilyTree } from '../controllers/person.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, addPerson);
router.get('/family', protect, getFamilyPersons);
router.get('/tree', protect, getFamilyTree);
export default router;
