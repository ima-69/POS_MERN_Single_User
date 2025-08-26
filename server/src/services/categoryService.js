import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  findCategoryById,
  findCategoryByName,
} from "../repositories/categoryRepo.js";
import Product from "../models/Product.js";

const err = (m, s = 400) => {
  const e = new Error(m);
  e.status = s;
  return e;
};

export const listCat = ({ search }) => listCategories(search);

export async function addCat({ name, code }) {
  if (!name) throw err("Category name required");
  const exists = await findCategoryByName(name);
  if (exists) throw err("Category already exists");
  return createCategory({ name, code });
}

export async function editCat(id, data) {
  const cat = await findCategoryById(id);
  if (!cat) throw err("Category not found", 404);
  if (data.name && data.name !== cat.name) {
    const exists = await findCategoryByName(data.name);
    if (exists) throw err("Category name already used");
  }
  return updateCategory(id, data);
}

export async function removeCat(id) {
  const used = await Product.countDocuments({ category: id });
  if (used > 0) throw err("Cannot delete: category used by products");
  return deleteCategory(id);
}
