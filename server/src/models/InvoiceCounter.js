import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("InvoiceCounter", invoiceCounterSchema);
