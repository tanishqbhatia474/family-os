/**
 * Build a recursive family tree from flat people[]
 *
 * Output shape:
 * {
 *   id: string,
 *   parents: Person[],        // 1 or 2
 *   children: FamilyNode[]    // recursive
 * }
 */

export function buildFamilyTree(people) {
  if (!Array.isArray(people) || people.length === 0) {
    return null;
  }

  const peopleById = new Map(
    people.map(p => [p._id, p])
  );

  const visited = new Set();

  function buildNode(person) {
    if (!person || visited.has(person._id)) {
      return null;
    }

    // Find spouse (single spouse only for now)
    const spouse =
      person.spouseIds?.length
        ? peopleById.get(person.spouseIds[0]) || null
        : null;

    // Mark both as visited so couple is built only once
    visited.add(person._id);
    if (spouse) {
      visited.add(spouse._id);
    }

    // Find children from either parent
    const children = people.filter(p =>
      p.fatherId === person._id ||
      p.motherId === person._id ||
      (spouse &&
        (p.fatherId === spouse._id ||
        p.motherId === spouse._id))
    );

    return {
      id: spouse
        ? `${person._id}_${spouse._id}`
        : person._id,
      parents: spouse ? [person, spouse] : [person],
      children: children
        .map(child => buildNode(child))
        .filter(Boolean)
    };
  }


  // Find root people (no parents)
  const roots = people.filter(
    p => !p.fatherId && !p.motherId
  );

  if (roots.length === 0) {
    // fallback: pick anyone
    return buildNode(people[0]);
  }

  // Build from first root
  return buildNode(roots[0]);
}
