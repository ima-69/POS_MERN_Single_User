import * as s from "../services/categoryService.js";
export const list = (req, res, next) =>
  s
    .listCat(req.query)
    .then((d) => res.json(d))
    .catch(next);
export const create = (req, res, next) =>
  s
    .addCat(req.body)
    .then((d) => res.status(201).json(d))
    .catch(next);
export const update = (req, res, next) =>
  s
    .editCat(req.params.id, req.body)
    .then((d) => res.json(d))
    .catch(next);
export const remove = (req, res, next) =>
  s
    .removeCat(req.params.id)
    .then(() => res.json({ message: "Deleted" }))
    .catch(next);
