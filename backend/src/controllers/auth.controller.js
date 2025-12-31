import { registerUser, loginUser } from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const token = await loginUser(req.body);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
export const getMe = async (req, res) => {
  res.json({
    userId: req.user.userId,
    familyId: req.user.familyId,
    personId: req.user.personId,
    isHonor: req.user.isHonor
  });
};
