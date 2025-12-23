import { createFamilyService } from '../services/family.service.js';
import { joinFamilyService } from '../services/family.service.js';
export const createFamily = async (req, res) => {
  try {
    const result = await createFamilyService(req.user, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const joinFamily = async (req, res) => {
  try {
    const result = await joinFamilyService(req.user, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};