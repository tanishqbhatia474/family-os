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

/**
 * GET RITUALS OF A SPECIFIC PERSON
 * - Only within same family
 * - Shows rituals written by that person
 */
export const getPersonRitualsService = async (user, personId) => {
  if (!user.familyId) {
    throw new Error('User does not belong to a family');
  }

  const person = await Person.findOne({
    _id: personId,
    familyId: user.familyId
  });

  if (!person) {
    throw new Error('Person not found in your family');
  }

  return Ritual.find({
    ownerPersonId: personId
  }).sort({ createdAt: -1 });
};
