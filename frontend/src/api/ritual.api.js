import http from "./http";

/**
 * Create a ritual
 * body: { title, description, viewAccessPersonIds }
 */
export const createRitual = (data) =>
  http.post("/ritual", data);

/**
 * Get all rituals visible to current user (family scope)
 * Includes:
 * - rituals owned by user
 * - rituals shared with user
 */
export const listFamilyRituals = () =>
  http.get("/ritual/family");

/**
 * Get rituals created by a specific person
 */
export const listPersonRituals = (personId) =>
  http.get(`/ritual/person/${personId}`);

/**
 * Update ritual (owner only)
 */
export const updateRitual = (id, data) =>
  http.patch(`/ritual/${id}`, data);

/**
 * Delete ritual (owner only)
 */
export const deleteRitual = (id) =>
  http.delete(`/ritual/${id}`);
