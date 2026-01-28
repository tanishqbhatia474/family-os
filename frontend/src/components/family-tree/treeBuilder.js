/**
 * Build a recursive family tree from flat people[]
 *
 * Root is derived dynamically from the OWNER person
 * (moves upward as parents are added)
 */
export function buildFamilyTree(people, ownerPersonId) {
  if (!Array.isArray(people) || people.length === 0 || !ownerPersonId) {
    return null;
  }

  const peopleById = new Map(people.map(p => [p._id, p]));
  const ownerPerson = peopleById.get(ownerPersonId);

  if (!ownerPerson) return null;

  // 🔑 Step 1: find dynamic root SAFELY
  const root = findDynamicRoot(ownerPerson, peopleById);
  if (!root) return null;

  // These MUST be scoped AFTER root is known
  const visited = new Set();
  const processedChildren = new Set();

  function buildNode(person) {
    if (!person || visited.has(person._id)) return null;

    const spouse =
      Array.isArray(person.spouseIds) && person.spouseIds.length > 0
        ? peopleById.get(person.spouseIds[person.spouseIds.length - 1]) || null
        : null;

    // mark visited (prevents duplication)
    visited.add(person._id);
    if (spouse) visited.add(spouse._id);

    const childPeople = people.filter(p => {
      if (processedChildren.has(p._id)) return false;

      const isChild =
        p.fatherId === person._id ||
        p.motherId === person._id ||
        (spouse &&
          (p.fatherId === spouse._id || p.motherId === spouse._id)) ||
        // NEW: allow children of spouse-only nodes
        (person.spouseIds?.includes(p.fatherId) ||
        person.spouseIds?.includes(p.motherId));

      if (isChild) {
        processedChildren.add(p._id);
        return true;
      }
      return false;
    });

    const children = childPeople
      .map(child => buildNode(child))
      .filter(Boolean);

    return {
      id: spouse ? `${person._id}_${spouse._id}` : person._id,
      parents: spouse ? [person, spouse] : [person],
      children
    };
  }

  return buildNode(root);
}

/* =========================
   Root selection helpers
========================= */

function chooseTopRoot(person, peopleById) {
  const father = person.fatherId
    ? peopleById.get(person.fatherId)
    : null;

  const mother = person.motherId
    ? peopleById.get(person.motherId)
    : null;

  // both parents exist → male wins
  if (father && mother) {
    return father.gender === "male" ? father : mother;
  }

  // otherwise whichever exists (often female)
  return father || mother || person;
}

function findDynamicRoot(startPerson, peopleById) {
  let current = startPerson;
  const seen = new Set();

  while (current && !seen.has(current._id)) {
    seen.add(current._id);

    const next = chooseTopRoot(current, peopleById);

    if (!next || next._id === current._id) break;
    current = next;
  }

  return current;
}