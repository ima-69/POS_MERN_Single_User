import * as s from "../services/productService.js";
export const list = (req, res, next) =>
  s
    .listProd(req.query)
    .then((d) => res.json(d))
    .catch(next);
export const create = (req, res, next) =>
  s
    .addProd(req.body)
    .then((d) => res.status(201).json(d))
    .catch(next);
export const update = (req, res, next) =>
  s
    .editProd(req.params.id, req.body)
    .then((d) => res.json(d))
    .catch(next);
export const remove = (req, res, next) =>
  s
    .removeProd(req.params.id)
    .then(() => res.json({ message: "Deleted" }))
    .catch(next);
export const byBarcode = (req, res, next) =>
  s
    .getByBarcode(req.params.barcode)
    .then((p) =>
      p ? res.json(p) : res.status(404).json({ message: "Not found" })
    )
    .catch(next);
export const addQuantity = (req, res, next) =>
  s
    .addQuantity(req.params.id, req.body.quantity)
    .then((d) => res.json(d))
    .catch(next);
