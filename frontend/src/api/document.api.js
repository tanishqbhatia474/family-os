import http from "./http";

export const uploadDocument = (formData) =>
  http.post("/document", formData);

export const listDocuments = () =>
  http.get("/document/family");

export const getDownloadUrl = (id) =>
  http.get(`/document/${id}/download`);

export const deleteDocument = (id) =>
  http.delete(`/document/${id}`);

export const getViewUrl = (id) =>
  http.get(`/document/${id}/view`);

