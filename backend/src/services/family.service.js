import Family from '../models/Family.model.js';
import Person from '../models/Person.model.js';
import User from '../models/User.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { normalizeName } from '../utils/name.util.js';
import { getUTCDayRange } from '../utils/date.util.js';
import { AppError } from '../utils/AppError.js';
import { findMatchingPerson } from '../utils/identity.util.js';

/* ===============================
   CREATE FAMILY
================================ */
export const createFamilyService = async (user, { familyName, personName, gender, birthDate }) => {
  // 1️⃣ Hard check: user must not already be in a family
  if (user.familyId || user.personId) {
    throw new Error(
      'You already belong to a family. You cannot create another one.'
    );
  }

  // 🔒 ENFORCE REQUIRED IDENTITY FIELDS FOR FAMILY CREATOR
  if (!personName || !personName.trim()) {
    throw new Error('Your name is required');
  }

  if (!gender) {
    throw new Error('Gender is required');
  }

  if (!birthDate) {
    throw new Error('Birth date is required');
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
    name: normalizeName(personName),
    gender,
    birthDate,
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
   JOIN FAMILY (SILENT MATCHING)
================================ */
export const joinFamilyService = async (user, { inviteCode, personName, gender, birthDate }) => {
  // 1️⃣ Hard check: user must not already be in a family
  if (user.familyId || user.personId) {
    throw new Error(
      'You already belong to a family. You cannot join another family.'
    );
  }

  // 🔒 ENFORCE REQUIRED IDENTITY FIELDS
  if (!personName || !personName.trim()) {
    throw new Error('Your name is required');
  }

  if (!gender) {
    throw new Error('Gender is required');
  }

  if (!birthDate) {
    throw new Error('Birth date is required');
  }

  // 2️⃣ Validate invite code
  const family = await Family.findOne({ inviteCode });
  if (!family) {
    throw new Error('Invalid or expired invite code');
  }

  let person;

  // 3️⃣ TRY SILENT MATCHING: Use centralized identity matching (SINGLE SOURCE OF TRUTH)
  person = await findMatchingPerson(family._id, personName, birthDate, gender);

  if (person) {
    // 🔒 CHECK DOUBLE LINKAGE: Prevent two accounts from linking to same person
    const existingUser = await User.findOne({ personId: person._id });
    if (existingUser) {
      throw new AppError(
        'This person is already linked to another account. Each person can only belong to one user.',
        409,
        'PERSON_ALREADY_LINKED'
      );
    }
    // ✨ Silent match found! Will use this person below
  }

  // 4️⃣ IF NO MATCH: Create new person
  if (!person) {
    try {
      person = await Person.create({
        familyId: family._id,
        name: normalizeName(personName),
        gender,
        birthDate: new Date(birthDate),
        fatherId: null,
        motherId: null
      });
    } catch (err) {
      // 🔒 HANDLE DB UNIQUE INDEX VIOLATION (race condition safety)
      if (err.code === 11000) {
        // Re-query to find the person that was created (another request beat us)
        const raceConditionMatch = await Person.findOne({
          familyId: family._id,
          name: normalizeName(personName),
          birthDate: getUTCDayRange(birthDate),
          gender: gender
        });

        if (raceConditionMatch) {
          // Check if this person is already linked
          const existingUser = await User.findOne({ personId: raceConditionMatch._id });
          if (existingUser) {
            throw new AppError(
              'This person is already linked to another account. Each person can only belong to one user.',
              409,
              'PERSON_ALREADY_LINKED'
            );
          }
          
          person = raceConditionMatch;
        } else {
          // Should not happen, but fallback to generic error
          throw new AppError(
            'A person with this name, birth date, and gender already exists in your family',
            409,
            'DUPLICATE_PERSON'
          );
        }
      } else {
        throw err;
      }
    }
  }

  // 5️⃣ Update user
  const updatedUser = await User.findByIdAndUpdate(
    user.userId,
    {
      familyId: family._id,
      personId: person._id,
      isHonor: false
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
    message: 'Successfully joined family',
    token,
    familyId: family._id,
    personId: person._id
  };
};
