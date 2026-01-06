/**
 * Identity matching helper - SINGLE SOURCE OF TRUTH for person lookup
 * Ensures consistent matching logic across all services
 */
import Person from '../models/Person.model.js';
import { normalizeName } from './name.util.js';
import { getUTCDayRange } from './date.util.js';

export const findMatchingPerson = async (familyId, personName, birthDate, gender) => {
  if (!familyId || !personName || !birthDate || !gender) {
    return null;
  }

  const normalizedName = normalizeName(personName);
  const dobRange = getUTCDayRange(birthDate);

  // 🔍 IDENTITY MATCHING: Find person by all four identity fields
  const match = await Person.findOne({
    familyId,
    name: normalizedName,
    birthDate: dobRange,
    gender
  });

  return match || null;
};
