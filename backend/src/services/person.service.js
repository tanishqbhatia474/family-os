import Person from '../models/Person.model.js';
import { AppError } from '../utils/AppError.js';

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

  const person = await Person.create({
    familyId: user.familyId,
    name,
    gender,
    birthDate,
    fatherId: fatherId || null,
    motherId: motherId || null,
    isDeceased: isDeceased || false
  });

  return person;
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
