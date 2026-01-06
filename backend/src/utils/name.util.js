/**
 * Normalize person names for consistent matching
 * "D A", "d a", " D A " → "d a"
 */
export const normalizeName = (name) => {
  if (!name) return '';
  return name.trim().toLowerCase();
};
