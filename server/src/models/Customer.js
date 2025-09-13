import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cid: { type: String, trim: true, unique: true, sparse: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    purchasedAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
