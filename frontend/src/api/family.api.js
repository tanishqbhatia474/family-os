import http from "./http";

export const createFamily = (data) =>
  http.post("/family", data);

export const joinFamily = (data) =>
  http.post("/family/join", data);
