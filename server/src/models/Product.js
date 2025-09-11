import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    retailPrice: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 0 },
    grnNumber: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    image: {
      url: String,
      publicId: String,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", barcode: "text" });
productSchema.index({ grnNumber: 1 });

export default mongoose.model("Product", productSchema);
