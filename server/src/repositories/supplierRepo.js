import Supplier from "../models/Supplier.js";
export const listSuppliers = (search) =>
  Supplier.find(search ? { name: { $regex: search, $options: "i" } } : {}).sort(
    { createdAt: -1 }
  );
export const createSupplier = (data) => Supplier.create(data);
export const updateSupplier = (id, data) =>
  Supplier.findByIdAndUpdate(id, data, { new: true });
export const deleteSupplier = (id) => Supplier.findByIdAndDelete(id);
export const findSupplierById = (id) => Supplier.findById(id);
export const findSupplierBySID = (sid) => Supplier.findOne({ sid });
