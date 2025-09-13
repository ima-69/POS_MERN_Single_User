import mongoose from "mongoose";
import Product from "../models/Product.js";
import InvoiceCounter from "../models/InvoiceCounter.js";
import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";


const err = (m, s = 400) => {
  const e = new Error(m);
  e.status = s;
  return e;
};

async function nextInvoiceNo() {
  const c = await InvoiceCounter.findOneAndUpdate(
    { name: "sale" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return c.seq;
}

export async function createSale(userId, payload) {
  const items = payload.items || [];
  if (!Array.isArray(items) || items.length === 0) throw err("Cart is empty");

  // Fetch products in one go
  const ids = items.map((i) => new mongoose.Types.ObjectId(i.productId));
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [String(p._id), p]));

  // Build sale items + validate stock/qty
  const saleItems = items.map((i) => {
    const p = map.get(String(i.productId));
    if (!p) throw err("Product not found", 404);
    const qty = Number(i.qty || 0);
    if (qty <= 0) throw err(`Invalid qty for ${p.name}`);
    if (p.qty < qty)
      throw err(`Insufficient stock for ${p.name} (in stock: ${p.qty})`);
    const unitPrice = Number(i.unitPrice ?? p.retailPrice);
    const lineTotal = +(qty * unitPrice).toFixed(2);
    return {
      product: p._id,
      name: p.name,
      barcode: p.barcode,
      qty,
      unitPrice,
      costPrice: Number(p.costPrice || 0),
      lineTotal,
    };
  });

  const subTotal = saleItems.reduce((s, it) => s + it.lineTotal, 0);
  const discount = Number(payload.discount || 0);
  const tax = Number(payload.tax || 0);
  const grandTotal = +(subTotal - discount + tax).toFixed(2);
  const paidAmount = Number(payload.paidAmount || 0);
  const balance = +(grandTotal - paidAmount).toFixed(2);

  // Decrement stock safely using bulkWrite (with qty guard)
  const ops = saleItems.map((si) => ({
    updateOne: {
      filter: { _id: si.product, qty: { $gte: si.qty } },
      update: { $inc: { qty: -si.qty } },
    },
  }));
  const bulk = await Product.bulkWrite(ops);
  if (bulk.modifiedCount !== saleItems.length) {
    throw err("Stock update conflict. Try again.");
  }

  const invoiceNo = await nextInvoiceNo();
  const sale = await Sale.create({
    invoiceNo,
    items: saleItems,
    subTotal,
    discount,
    tax,
    grandTotal,
    paidAmount,
    balance,
    customer: payload.customerId || null,
    cashier: userId,
  });

  // Update customer's financial details if customer is selected
  if (payload.customerId) {
    try {
      console.log(`Updating customer ${payload.customerId} with purchasedAmount: +${grandTotal}, paidAmount: +${paidAmount}`);
      
      const customerUpdate = {
        $inc: { purchasedAmount: grandTotal }
      };
      
      // Always update paidAmount if there's any payment (even if it's 0, it's still a valid payment)
      customerUpdate.$inc.paidAmount = paidAmount;
      
      const updatedCustomer = await Customer.findByIdAndUpdate(
        payload.customerId,
        customerUpdate,
        { new: true }
      );
      
      if (!updatedCustomer) {
        console.warn(`Customer with ID ${payload.customerId} not found during sale update`);
      } else {
        console.log(`Successfully updated customer ${updatedCustomer.name}: purchasedAmount=${updatedCustomer.purchasedAmount}, paidAmount=${updatedCustomer.paidAmount}`);
      }
    } catch (error) {
      console.error('Error updating customer financial details:', error);
      // Don't throw error here as sale is already completed
    }
  }

  return sale;
}

export async function peekNextInvoiceNo() {
  const c = await InvoiceCounter.findOne({ name: 'sale' })
  return (c?.seq || 0) + 1
}