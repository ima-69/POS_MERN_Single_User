import Product from "../models/Product.js";

export const listProducts = ({ search, barcode, category, supplier } = {}) => {
  const q = {};
  if (search) q.name = { $regex: search, $options: "i" };
  if (barcode) q.barcode = barcode;
  if (category) q.category = category;
  if (supplier) q.supplier = supplier;
  return Product.find(q)
    .populate("category", "name")
    .populate("supplier", "name")
    .sort({ createdAt: -1 });
};
export const createProduct = (data) => Product.create(data);
export const updateProduct = (id, data) =>
  Product.findByIdAndUpdate(id, data, { new: true })
    .populate("category", "name")
    .populate("supplier", "name");
export const deleteProduct = (id) => Product.findByIdAndDelete(id);
export const findProductById = (id) => Product.findById(id);
export const findProductByBarcode = (code) =>
  Product.findOne({ barcode: code });
