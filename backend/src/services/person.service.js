import Person from '../models/Person.model.js';
import { AppError } from '../utils/AppError.js';
import { normalizeName } from '../utils/name.util.js';
import { getUTCDayRange } from '../utils/date.util.js';
import { findMatchingPerson } from '../utils/identity.util.js';

export const addPersonService = async (user, data) => {
  if (!user.familyId) {
    throw new Error('User does not belong to a family');
  }

  const {
    name,
    gender,
    birthDate,
    fatherId,
    motherId,
    isDeceased
  } = data;

  // 🔒 ENFORCE REQUIRED IDENTITY FIELDS
  if (!name || !name.trim()) {
    throw new AppError(
      'Name is required',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (!gender) {
    throw new AppError(
      'Gender is required',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (!birthDate) {
    throw new AppError(
      'Birth date is required',
      400,
      'VALIDATION_ERROR'
    );
  }

  // 🔒 CHECK FOR DUPLICATES: Use centralized identity matching (SINGLE SOURCE OF TRUTH)
  const normalizedName = normalizeName(name);
  const existingPerson = await findMatchingPerson(user.familyId, name, birthDate, gender);

  if (existingPerson) {
    throw new AppError(
      'A person with this name, birth date, and gender already exists in your family',
      409,
      'DUPLICATE_PERSON'
    );
  }

  try {
    const person = await Person.create({
      familyId: user.familyId,
      name: normalizedName,
      gender,
      birthDate,
      fatherId: fatherId || null,
      motherId: motherId || null,
      isDeceased: isDeceased || false
    });

    return person;
  } catch (err) {
    // 🔒 HANDLE DB UNIQUE INDEX VIOLATION (race condition safety)
    if (err.code === 11000) {
      throw new AppError(
        'A person with this name, birth date, and gender already exists in your family',
        409,
        'DUPLICATE_PERSON'
      );
    }
    throw err;
  }
};

export const getFamilyPersonsService = async (user) => {
  if (!user.familyId) {
    throw new Error('User does not belong to a family');
  }

  return Person.find({ familyId: user.familyId });
};


export const getFamilyTreeService = async (user) => {
  if (!user.familyId) {
    throw new Error('User does not belong to a family');
  }

  // 1️⃣ Fetch all persons in family
  const persons = await Person.find({ familyId: user.familyId }).lean();

  // 2️⃣ Create map for fast lookup
  const personMap = {};
  persons.forEach(person => {
    person.children = [];
    personMap[person._id.toString()] = person;
  });

  // 3️⃣ Build tree
  const roots = [];

  persons.forEach(person => {
    if (person.fatherId) {
      const father = personMap[person.fatherId.toString()];
      if (father) father.children.push(person);
    } else if (person.motherId) {
      const mother = personMap[person.motherId.toString()];
      if (mother) mother.children.push(person);
    } else {
      // no parents → root
      roots.push(person);
    }
  });

  return roots;
};
export const editPersonService = async (user, personId, data) => {
  // 1️⃣ User must belong to a family
  if (!user.familyId) {
    throw new AppError(
      'User does not belong to a family',
      403,
      'NOT_AUTHORIZED'
    );
  }

  // 2️⃣ Only family owner can edit
  if (!user.isHonor) {
    throw new AppError(
      'Only family owner can edit person details',
      403,
      'NOT_AUTHORIZED'
    );
  }

  // 3️⃣ Find person
  const person = await Person.findById(personId);
  if (!person) {
    throw new AppError(
      'Person not found',
      404,
      'NOT_FOUND'
    );
  }

  // 4️⃣ Person must belong to same family
  if (person.familyId.toString() !== user.familyId.toString()) {
    throw new AppError(
      'Cannot edit person from another family',
      403,
      'NOT_AUTHORIZED'
    );
  }

  // 5️⃣ Allow only safe fields
  const allowedFields = ['name', 'gender', 'birthDate', 'isDeceased'];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      person[field] = data[field];
    }
  });

  await person.save();
  return person;
};


/* =========================
   SET FATHER
========================= */
export const setFatherService = async (user, childId, fatherId) => {
  if (!user.isHonor) {
    throw new AppError(
      'Only family owner can modify relationships',
      403,
      'NOT_AUTHORIZED'
    );
  }

  if (childId === fatherId) {
    throw new AppError(
      'Person cannot be their own father',
      400,
      'BAD_REQUEST'
    );
  }

  const child = await Person.findById(childId);
  const father = await Person.findById(fatherId);

  if (!child || !father) {
    throw new AppError('Person not found', 404, 'NOT_FOUND');
  }

  // 🔒 ENFORCE GENDER RULE: Father must be male
  if (father.gender !== 'male') {
    throw new AppError(
      'Father must have male gender',
      400,
      'INVALID_GENDER_FOR_PARENT'
    );
  }

  if (
    child.familyId.toString() !== user.familyId.toString() ||
    father.familyId.toString() !== user.familyId.toString()
  ) {
    throw new AppError(
      'Persons must belong to same family',
      403,
      'NOT_AUTHORIZED'
    );
  }

  child.fatherId = father._id;
  await child.save();

  return child;
};

/* =========================
   SET MOTHER
========================= */
export const setMotherService = async (user, childId, motherId) => {
  if (!user.isHonor) {
    throw new AppError(
      'Only family owner can modify relationships',
      403,
      'NOT_AUTHORIZED'
    );
  }

  if (childId === motherId) {
    throw new AppError(
      'Person cannot be their own mother',
      400,
      'BAD_REQUEST'
    );
  }

  const child = await Person.findById(childId);
  const mother = await Person.findById(motherId);

  if (!child || !mother) {
    throw new AppError('Person not found', 404, 'NOT_FOUND');
  }

  // 🔒 ENFORCE GENDER RULE: Mother must be female
  if (mother.gender !== 'female') {
    throw new AppError(
      'Mother must have female gender',
      400,
      'INVALID_GENDER_FOR_PARENT'
    );
  }

  if (
    child.familyId.toString() !== user.familyId.toString() ||
    mother.familyId.toString() !== user.familyId.toString()
  ) {
    throw new AppError(
      'Persons must belong to same family',
      403,
      'NOT_AUTHORIZED'
    );
  }

  child.motherId = mother._id;
  await child.save();

  return child;
};

/* =========================
   ADD CHILD (UX API)
========================= */
export const addChildService = async (user, parentId, childId, role) => {
  if (!user.isHonor) {
    throw new AppError(
      'Only family owner can modify relationships',
      403,
      'NOT_AUTHORIZED'
    );
  }

  const parent = await Person.findById(parentId);
  const child = await Person.findById(childId);

  if (!parent || !child) {
    throw new AppError('Person not found', 404, 'NOT_FOUND');
  }

  if (
    parent.familyId.toString() !== user.familyId.toString() ||
    child.familyId.toString() !== user.familyId.toString()
  ) {
    throw new AppError(
      'Persons must belong to same family',
      403,
      'NOT_AUTHORIZED'
    );
  }

  if (role === 'father') child.fatherId = parent._id;
  if (role === 'mother') child.motherId = parent._id;

  await child.save();
  return child;
};
