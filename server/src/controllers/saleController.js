import { createSale, peekNextInvoiceNo } from "../services/saleService.js";
export const createCtrl = (req, res, next) =>
  createSale(req.user.id, req.body)
    .then((sale) => res.status(201).json(sale))
    .catch(next);

export const nextCtrl = (req, res, next) =>
  peekNextInvoiceNo()
    .then((n) => res.json({ next: n }))
    .catch(next);
