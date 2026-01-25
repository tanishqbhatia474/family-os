export function transformToD3Tree(person) {
  return {
    _id: person._id,
    name: person.name,
    raw: person,
    children: (person.children || []).map(transformToD3Tree)
  };
}
