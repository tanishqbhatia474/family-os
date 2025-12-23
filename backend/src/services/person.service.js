import Person from '../models/Person.model.js';

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
