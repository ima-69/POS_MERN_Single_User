import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  findCustomerById,
  findCustomerByCID,
} from "../repositories/customerRepo.js";
const err = (m, s = 400) => {
  const e = new Error(m);
  e.status = s;
  return e;
};

export const listCus = ({ search }) => listCustomers(search);

export async function addCus(data) {
  if (!data.name) throw err("Customer name required");
  if (data.cid) {
    const exists = await findCustomerByCID(data.cid);
    if (exists) throw err("Customer ID already exists");
  }
  return createCustomer(data);
}

export async function editCus(id, data) {
  const cus = await findCustomerById(id);
  if (!cus) throw err("Customer not found", 404);
  if (data.cid && data.cid !== cus.cid) {
    const exists = await findCustomerByCID(data.cid);
    if (exists) throw err("Customer ID already exists");
  }
  return updateCustomer(id, data);
}

export const removeCus = (id) => deleteCustomer(id);

export async function updatePaidAmount(id, paidAmount) {
  const customer = await findCustomerById(id);
  if (!customer) throw err("Customer not found", 404);
  
  if (paidAmount < 0) throw err("Paid amount cannot be negative");
  if (paidAmount > customer.purchasedAmount) throw err("Paid amount cannot exceed purchased amount");
  
  return updateCustomer(id, { paidAmount });
}