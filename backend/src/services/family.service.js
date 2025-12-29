import Family from '../models/Family.model.js';
import Person from '../models/Person.model.js';
import User from '../models/User.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/* ===============================
   CREATE FAMILY
================================ */
export const createFamilyService = async (user, { familyName, personName }) => {
  // 1️⃣ Hard check: user must not already be in a family
  if (user.familyId || user.personId) {
    throw new Error(
      'You already belong to a family. You cannot create another one.'
    );
  }

  // 2️⃣ Generate invite code
  const inviteCode = crypto.randomBytes(4).toString('hex');

  // 3️⃣ Create family
  const family = await Family.create({
    familyName,
    createdBy: user.userId,
    inviteCode
  });

  // 4️⃣ Create first person (family owner)
  const person = await Person.create({
    familyId: family._id,
    name: personName,
    fatherId: null,
    motherId: null
  });

  // 5️⃣ Update user
  const updatedUser = await User.findByIdAndUpdate(
    user.userId,
    {
      familyId: family._id,
      personId: person._id,
      isHonor: true
    },
    { new: true }
  );

  // 6️⃣ Re-issue JWT (IMPORTANT)
  const token = jwt.sign(
    {
      userId: updatedUser._id,
      familyId: updatedUser.familyId,
      personId: updatedUser.personId,
      isHonor: updatedUser.isHonor
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: 'Family created successfully',
    token,
    familyId: family._id,
    personId: person._id,
    inviteCode
  };
};

/* ===============================
   JOIN FAMILY
================================ */
export const joinFamilyService = async (user, { inviteCode, personName }) => {
  // 1️⃣ Hard check: user must not already be in a family
  if (user.familyId || user.personId) {
    throw new Error(
      'You already belong to a family. You cannot join another family.'
    );
  }

  // 2️⃣ Validate invite code
  const family = await Family.findOne({ inviteCode });
  if (!family) {
    throw new Error('Invalid or expired invite code');
  }

  // 3️⃣ Create person for this user
  const person = await Person.create({
    familyId: family._id,
    name: personName,
    fatherId: null,
    motherId: null
  });

  // 4️⃣ Update user
  const updatedUser = await User.findByIdAndUpdate(
    user.userId,
    {
      familyId: family._id,
      personId: person._id,
      isHonor: false
    },
    { new: true }
  );

  // 5️⃣ Re-issue JWT (IMPORTANT)
  const token = jwt.sign(
    {
      userId: updatedUser._id,
      familyId: updatedUser.familyId,
      personId: updatedUser.personId,
      isHonor: updatedUser.isHonor
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: 'Successfully joined family',
    token,
    familyId: family._id,
    personId: person._id
  };
};
