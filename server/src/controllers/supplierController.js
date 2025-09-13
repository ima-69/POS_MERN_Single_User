import * as s from "../services/supplierService.js";
export const list = (req, res, next) =>
  s
    .listSup(req.query)
    .then((d) => res.json(d))
    .catch(next);
export const create = (req, res, next) =>
  s
    .addSup(req.body)
    .then((d) => res.status(201).json(d))
    .catch(next);
export const update = (req, res, next) =>
  s
    .editSup(req.params.id, req.body)
    .then((d) => res.json(d))
    .catch(next);
export const remove = (req, res, next) =>
  s
    .removeSup(req.params.id)
    .then(() => res.json({ message: "Deleted" }))
    .catch(next);
export const updatePaidAmount = (req, res, next) =>
  s
    .updatePaidAmount(req.params.id, req.body.paidAmount)
    .then((d) => res.json(d))
    .catch(next);
