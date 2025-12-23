import {
  addPersonService,
  getFamilyPersonsService,getFamilyTreeService
} from '../services/person.service.js';

export const addPerson = async (req, res) => {
  try {
    const person = await addPersonService(req.user, req.body);
    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFamilyPersons = async (req, res) => {
  try {
    const persons = await getFamilyPersonsService(req.user);
    res.json(persons);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const getFamilyTree = async (req, res) => {
  try {
    const tree = await getFamilyTreeService(req.user);
    res.json(tree);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};