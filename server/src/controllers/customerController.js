import * as s from "../services/customerService.js";
export const list = (req, res, next) =>
  s
    .listCus(req.query)
    .then((d) => res.json(d))
    .catch(next);
export const create = (req, res, next) =>
  s
    .addCus(req.body)
    .then((d) => res.status(201).json(d))
    .catch(next);
export const update = (req, res, next) =>
  s
    .editCus(req.params.id, req.body)
    .then((d) => res.json(d))
    .catch(next);
export const remove = (req, res, next) =>
  s
    .removeCus(req.params.id)
    .then(() => res.json({ message: "Deleted" }))
    .catch(next);
export const updatePaidAmount = (req, res, next) => 
  s.updatePaidAmount(req.params.id, req.body.paidAmount)
    .then((d) => res.json(d))
    .catch(next);
