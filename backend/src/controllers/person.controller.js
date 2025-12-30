import {
  addPersonService,setFatherService,
  setMotherService,
  addChildService,
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
export const setFather = async (req, res, next) => {
  try {
    const person = await setFatherService(
      req.user,
      req.params.childId,
      req.body.fatherId
    );
    res.json(person);
  } catch (err) {
    next(err);
  }
};

export const setMother = async (req, res, next) => {
  try {
    const person = await setMotherService(
      req.user,
      req.params.childId,
      req.body.motherId
    );
    res.json(person);
  } catch (err) {
    next(err);
  }
};

export const addChild = async (req, res, next) => {
  try {
    const person = await addChildService(
      req.user,
      req.params.parentId,
      req.body.childId,
      req.body.role // "father" or "mother"
    );
    res.json(person);
  } catch (err) {
    next(err);
  }
};