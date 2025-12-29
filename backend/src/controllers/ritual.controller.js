import {
  createRitualService,
  getFamilyRitualsService,
  getPersonRitualsService,
  updateRitualService,
  deleteRitualService
} from '../services/ritual.service.js';

export const createRitual = async (req, res) => {
  try {
    const ritual = await createRitualService(req.user, req.body);
    res.status(201).json(ritual);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFamilyRituals = async (req, res) => {
  try {
    const rituals = await getFamilyRitualsService(req.user);
    res.json(rituals);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPersonRituals = async (req, res) => {
  try {
    const rituals = await getPersonRitualsService(
      req.user,
      req.params.personId
    );
    res.json(rituals);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const updateRitual = async (req, res) => {
  try {
    const ritual = await updateRitualService(
      req.user,
      req.params.id,
      req.body
    );
    res.json(ritual);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
export const deleteRitual = async (req, res) => {
  try {
    await deleteRitualService(req.user, req.params.id);
    res.json({ message: 'Ritual deleted successfully' });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};