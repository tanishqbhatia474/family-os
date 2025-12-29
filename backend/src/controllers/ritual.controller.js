import {
  createRitualService,
  getFamilyRitualsService,
  getPersonRitualsService,
  updateRitualService,
  deleteRitualService
} from '../services/ritual.service.js';

export const createRitual = async (req, res, next) => {
  try {
    const ritual = await createRitualService(req.user, req.body);
    res.status(201).json(ritual);
  } catch (err) {
    next(err);
  }
};

export const getFamilyRituals = async (req, res, next) => {
  try {
    const rituals = await getFamilyRitualsService(req.user);
    res.json(rituals);
  } catch (err) {
    next(err);
  }
};

export const getPersonRituals = async (req, res, next) => {
  try {
    const rituals = await getPersonRitualsService(
      req.user,
      req.params.personId
    );
    res.json(rituals);
  } catch (err) {
    next(err);
  }
};
export const updateRitual = async (req, res, next) => {
  try {
    const ritual = await updateRitualService(
      req.user,
      req.params.id,
      req.body
    );
    res.json(ritual);
  } catch (err) {
    next(err);
  }
};
export const deleteRitual = async (req, res, next) => {
  try {
    await deleteRitualService(req.user, req.params.id);
    res.json({ message: 'Ritual deleted successfully' });
  } catch (err) {
    next(err);
  }
};