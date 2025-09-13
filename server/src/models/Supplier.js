import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sid: { type: String, trim: true, unique: true, sparse: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    purchasedAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
