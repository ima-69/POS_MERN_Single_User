import Customer from "../models/Customer.js";
export const listCustomers = (search) =>
  Customer.find(search ? { name: { $regex: search, $options: "i" } } : {}).sort(
    { createdAt: -1 }
  );
export const createCustomer = (data) => Customer.create(data);
export const updateCustomer = (id, data) =>
  Customer.findByIdAndUpdate(id, data, { new: true });
export const deleteCustomer = (id) => Customer.findByIdAndDelete(id);
export const findCustomerById = (id) => Customer.findById(id);
export const findCustomerByCID = (cid) => Customer.findOne({ cid });
