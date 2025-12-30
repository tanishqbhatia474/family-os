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

export const updatePersonParents = (personId, payload) => {
  return http.patch(`/person/${personId}`, payload);
};

export const getPersonById = (personId) => {
  return http.get(`/person/${personId}`);
};

export const editPerson = (personId, payload) => {
  return http.patch(`/person/${personId}`, payload);
};
