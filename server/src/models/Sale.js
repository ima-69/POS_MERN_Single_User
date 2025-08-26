import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    barcode: String,
    qty: Number,
    unitPrice: Number,
    costPrice: Number, 
    lineTotal: Number,
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNo: { type: Number, unique: true },
    date: { type: Date, default: Date.now },
    items: [saleItemSchema],
    subTotal: Number,
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: Number,
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
