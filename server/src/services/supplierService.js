import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  findSupplierById,
  findSupplierBySID,
} from "../repositories/supplierRepo.js";
import Product from "../models/Product.js";
const err = (m, s = 400) => {
  const e = new Error(m);
  e.status = s;
  return e;
};

export const listSup = ({ search }) => listSuppliers(search);

export async function addSup(data) {
  if (!data.name) throw err("Supplier name required");
  if (data.sid) {
    const exists = await findSupplierBySID(data.sid);
    if (exists) throw err("Supplier ID already exists");
  }
  return createSupplier(data);
}

export async function editSup(id, data) {
  const sup = await findSupplierById(id);
  if (!sup) throw err("Supplier not found", 404);
  if (data.sid && data.sid !== sup.sid) {
    const exists = await findSupplierBySID(data.sid);
    if (exists) throw err("Supplier ID already exists");
  }
  return updateSupplier(id, data);
}

export async function removeSup(id) {
  const used = await Product.countDocuments({ supplier: id });
  if (used > 0) throw err("Cannot delete: supplier used by products");
  return deleteSupplier(id);
}

export async function updatePaidAmount(id, paidAmount) {
  const sup = await findSupplierById(id);
  if (!sup) throw err("Supplier not found", 404);
  if (paidAmount < 0) throw err("Paid amount cannot be negative");
  if (paidAmount > sup.purchasedAmount) throw err("Paid amount cannot exceed purchased amount");
  return updateSupplier(id, { paidAmount });
}