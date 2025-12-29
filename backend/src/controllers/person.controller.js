import {
  addPersonService,
  getFamilyPersonsService,getFamilyTreeService
} from '../services/person.service.js';

export const addPerson = async (req, res, next) => {
  try {
    const person = await addPersonService(req.user, req.body);
    res.status(201).json(person);
  } catch (err) {
    next(err);
  }
};

export const getFamilyPersons = async (req, res, next) => {
  try {
    const persons = await getFamilyPersonsService(req.user);
    res.json(persons);
  } catch (err) {
    next(err);
  }
};
export const getFamilyTree = async (req, res, next) => {
  try {
    const tree = await getFamilyTreeService(req.user);
    res.json(tree);
  } catch (err) {
    next(err);
  }
};
import { editPersonService } from '../services/person.service.js';

export const editPerson = async (req, res, next) => {
  try {
    const updatedPerson = await editPersonService(
      req.user,
      req.params.id,
      req.body
    );
    res.json(updatedPerson);
  } catch (err) {
    next(err);
  }
};
