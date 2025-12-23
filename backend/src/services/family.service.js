import Family from '../models/Family.model.js';
import Person from '../models/Person.model.js';
import User from '../models/User.model.js';
import crypto from 'crypto';

export const createFamilyService = async (user, { familyName, personName }) => {
  // 🚨 1️⃣ CHECK: User already in a family?
  if (user.familyId) {
    throw new Error('User already belongs to a family');
  }

  // 2️⃣ Generate invite code
  const inviteCode = crypto.randomBytes(4).toString('hex');

  // 3️⃣ Create family
  const family = await Family.create({
    familyName,
    createdBy: user.userId,
    inviteCode
  });

  // 4️⃣ Create first person
  const person = await Person.create({
    familyId: family._id,
    name: personName
  });

  // 5️⃣ Update user
  await User.findByIdAndUpdate(user.userId, {
    familyId: family._id,
    personId: person._id,
    isHonor: true
  });

  return {
    familyId: family._id,
    personId: person._id,
    inviteCode
  };
};
export const joinFamilyService = async (user, { inviteCode, personName }) => {
  // 1️⃣ User must NOT already belong to a family
  if (user.familyId) {
    throw new Error('User already belongs to a family');
  }

  // 2️⃣ Find family using invite code
  const family = await Family.findOne({ inviteCode });
  if (!family) {
    throw new Error('Invalid invite code');
  }

  // 3️⃣ Create person for this user
  const person = await Person.create({
    familyId: family._id,
    name: personName
  });

  // 4️⃣ Update user
  await User.findByIdAndUpdate(user.userId, {
    familyId: family._id,
    personId: person._id,
    isHonor: false
  });

  return {
    familyId: family._id,
    personId: person._id
  };
};