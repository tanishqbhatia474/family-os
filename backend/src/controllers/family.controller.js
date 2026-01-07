import { createFamilyService, getFamilyDetailsService } from '../services/family.service.js';
import { joinFamilyService } from '../services/family.service.js';
export const createFamily = async (req, res, next) => {
  try {
    const result = await createFamilyService(req.user, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const joinFamily = async (req, res, next) => {
  try {
    const result = await joinFamilyService(req.user, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getFamilyDetails = async (req, res, next) => {
  try {
    const family = await getFamilyDetailsService(req.user);
    res.status(200).json(family);
  } catch (err) {
    next(err);
  }
};