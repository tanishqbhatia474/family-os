export function transformToD3Tree(person) {
  return {
    id: person._id,     // used for click
    name: person.name,
    raw: person,       // full object for modal
    children: person.children?.map(transformToD3Tree) || [],
  };
}
