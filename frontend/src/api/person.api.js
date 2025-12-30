import http from "./http";

export const addPerson = (data) => {
  return http.post("/person", data);
};

export const getFamilyPersons = () => {
  return http.get("/person/family");
};

export const getFamilyTree = () => {
  return http.get("/person/tree");
};

export const editPerson = (personId, payload) => {
  return http.patch(`/person/${personId}`, payload);
};

export const setFather = (childId, fatherId) =>
  http.patch(`/person/${childId}/set-father`, { fatherId });

export const setMother = (childId, motherId) =>
  http.patch(`/person/${childId}/set-mother`, { motherId });