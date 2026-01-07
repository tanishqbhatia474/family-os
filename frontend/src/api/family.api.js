import http from "./http";

export const createFamily = (data) =>
  http.post("/family", data);

export const joinFamily = (data) =>
  http.post("/family/join", data);

/* fetch family details (inviteCode, name, etc.) */
export const getFamilyDetails = () =>
  http.get("/family");