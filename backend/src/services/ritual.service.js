import Ritual from '../models/Ritual.model.js';
import Person from '../models/Person.model.js';

/**
 * CREATE RITUAL
 * - Owner is auto-added to viewAccessPersonIds
 */
export const createRitualService = async (
  user,
  { title, description, viewAccessPersonIds = [] }
) => {
  if (!user.familyId || !user.personId) {
    throw new Error('User does not belong to a family or person');
  }

  // Ensure owner always has access
  const accessSet = new Set(
    viewAccessPersonIds.map(id => id.toString())
  );
  accessSet.add(user.personId.toString());

  const ritual = await Ritual.create({
    familyId: user.familyId,
    ownerPersonId: user.personId,
    title,
    description,
    viewAccessPersonIds: Array.from(accessSet)
  });

  return ritual;
};

/**
 * GET FAMILY RITUALS (ACCESS-CONTROLLED)
 * - Owner can see
 * - Explicitly allowed person can see
 */
export const getFamilyRitualsService = async (user) => {
  if (!user.familyId || !user.personId) {
    throw new Error('User does not belong to a family or person');
  }

  return Ritual.find({
    familyId: user.familyId,
    $or: [
      { ownerPersonId: user.personId },
      { viewAccessPersonIds: user.personId }
    ]
  }).sort({ createdAt: -1 });
};

export const getPersonRitualsService = async (user, personId) => {
  if (!user.familyId) {
    throw new Error('User does not belong to a family');
  }

  return Ritual.find({
    familyId: user.familyId,
    ownerPersonId: personId
  }).sort({ createdAt: -1 });
};
export const updateRitualService = async (user, ritualId, data) => {
  const ritual = await Ritual.findById(ritualId);

  if (!ritual) {
    throw new Error('Ritual not found');
  }

  if (ritual.ownerPersonId.toString() !== user.personId.toString()) {
    throw new Error('Only ritual owner can edit this ritual');
  }

  // Ensure owner always has access
  if (data.viewAccessPersonIds) {
    const ids = data.viewAccessPersonIds.map(String);
    if (!ids.includes(user.personId.toString())) {
      data.viewAccessPersonIds.push(user.personId);
    }
  }

  Object.assign(ritual, data);
  await ritual.save();

  return ritual;
};
export const deleteRitualService = async (user, ritualId) => {
  const ritual = await Ritual.findById(ritualId);

  if (!ritual) {
    throw new Error('Ritual not found');
  }

  if (ritual.ownerPersonId.toString() !== user.personId.toString()) {
    throw new Error('Only ritual owner can delete this ritual');
  }

  await ritual.deleteOne();
};