import Category from "../models/Category.js";
export const listCategories = (search) =>
  Category.find(search ? { name: { $regex: search, $options: "i" } } : {}).sort(
    { createdAt: -1 }
  );
export const createCategory = (data) => Category.create(data);
export const updateCategory = (id, data) =>
  Category.findByIdAndUpdate(id, data, { new: true });
export const deleteCategory = (id) => Category.findByIdAndDelete(id);
export const findCategoryById = (id) => Category.findById(id);
export const findCategoryByName = (name) => Category.findOne({ name });
