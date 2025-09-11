import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  findProductByBarcode,
  findProductById,
} from "../repositories/productRepo.js";
import Category from "../models/Category.js";
import Supplier from "../models/Supplier.js";

const err = (m, s = 400) => {
  const e = new Error(m);
  e.status = s;
  return e;
};

export const listProd = (params) => listProducts(params);
export const getByBarcode = (barcode) => findProductByBarcode(barcode);

export async function addProd(data) {
  const {
    name,
    barcode,
    costPrice,
    retailPrice,
    qty,
    grnNumber,
    category,
    supplier,
    image,
  } = data;
  if (!name || !barcode) throw err("name and barcode required");
  const exists = await findProductByBarcode(barcode);
  if (exists) throw err("Barcode already exists");
  if (!(await Category.findById(category))) throw err("Invalid category");
  if (supplier && !(await Supplier.findById(supplier)))
    throw err("Invalid supplier");

  return createProduct({
    name,
    barcode,
    costPrice: Number(costPrice),
    retailPrice: Number(retailPrice),
    qty: Number(qty),
    grnNumber: grnNumber || null,
    category,
    supplier: supplier || null,
    image: image?.url
      ? { url: image.url, publicId: image.publicId }
      : undefined,
  });
}

export async function editProd(id, data) {
  const prod = await findProductById(id);
  if (!prod) throw err("Product not found", 404);
  if (data.barcode && data.barcode !== prod.barcode) {
    const dupe = await findProductByBarcode(data.barcode);
    if (dupe) throw err("Barcode already exists");
  }
  if (data.category && !(await Category.findById(data.category)))
    throw err("Invalid category");
  if (data.supplier && !(await Supplier.findById(data.supplier)))
    throw err("Invalid supplier");

  return updateProduct(id, {
    ...data,
    costPrice: data.costPrice != null ? Number(data.costPrice) : prod.costPrice,
    retailPrice:
      data.retailPrice != null ? Number(data.retailPrice) : prod.retailPrice,
    qty: data.qty != null ? Number(data.qty) : prod.qty,
    grnNumber: data.grnNumber != null ? data.grnNumber : prod.grnNumber,
    image: data.image?.url
      ? { url: data.image.url, publicId: data.image.publicId }
      : prod.image,
  });
}

export const removeProd = (id) => deleteProduct(id);

export async function addQuantity(id, quantityToAdd) {
  const prod = await findProductById(id);
  if (!prod) throw err("Product not found", 404);
  
  const newQuantity = Number(prod.qty) + Number(quantityToAdd);
  if (newQuantity < 0) throw err("Quantity cannot be negative");
  
  return updateProduct(id, { qty: newQuantity });
}