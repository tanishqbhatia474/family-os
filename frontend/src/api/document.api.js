import http from "./http";

export const uploadDocument = (formData) =>
  http.post("/documents", formData);

export const listDocuments = () =>
  http.get("/documents/family");

export const getDownloadUrl = (id) =>
  http.get(`/documents/${id}/download`);

export const deleteDocument = (id) =>
  http.delete(`/documents/${id}`);
