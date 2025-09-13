import { useEffect, useRef, useState } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddQuantityMutation,
  useLazyGetProductByBarcodeQuery,
} from "./productsApi";
import { useGetCategoriesQuery } from "../categories/categoriesApi";
import { useGetSuppliersQuery } from "../suppliers/suppliersApi";
import { useUploadImageMutation } from "../uploads/uploadApi";

export default function ProductsPage() {
  const { data: categories = [] } = useGetCategoriesQuery({});
  const { data: suppliers = [] } = useGetSuppliersQuery({});
  const [search, setSearch] = useState("");
  const { data: products = [] } = useGetProductsQuery({ search });

  const [form, setForm] = useState({
    barcode: "",
    name: "",
    costPrice: "",
    retailPrice: "",
    qty: "",
    qtyToAdd: "",
    grnNumber: "",
    category: "",
    supplier: "",
    image: null,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [addQuantity] = useAddQuantityMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [triggerBarcode] = useLazyGetProductByBarcodeQuery();

  // Focus barcode input so scanner text goes here
  const barcodeRef = useRef(null);
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  // Helper functions
  const calculateProfitMargin = (costPrice, retailPrice) => {
    if (!costPrice || !retailPrice || costPrice === 0) return 0;
    return ((retailPrice - costPrice) / costPrice * 100).toFixed(1);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: "Out of Stock", color: "red" };
    if (quantity <= 5) return { status: "Low Stock", color: "yellow" };
    return { status: "In Stock", color: "green" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewMore = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  function onEdit(p) {
    setSelectedId(p._id);
    setForm({
      barcode: p.barcode,
      name: p.name,
      costPrice: p.costPrice,
      retailPrice: p.retailPrice,
      qty: p.qty,
      qtyToAdd: "",
      grnNumber: p.grnNumber || "",
      category: p.category?._id || p.category,
      supplier: p.supplier?._id || p.supplier || "",
      image: p.image || null,
    });
    setErrorMsg("");
    setSuccessMsg("");
    barcodeRef.current?.focus();
  }

  function clear() {
    setSelectedId(null);
    setForm({
      barcode: "",
      name: "",
      costPrice: "",
      retailPrice: "",
      qty: "",
      qtyToAdd: "",
      grnNumber: "",
      category: "",
      supplier: "",
      image: null,
    });
    setErrorMsg("");
    setSuccessMsg("");
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file).unwrap();
      setForm((prev) => ({
        ...prev,
        image: { url: res.url, publicId: res.public_id || res.publicId },
      }));
    } catch (e) {
      setErrorMsg("Image upload failed");
    }
  }

  async function handleBarcodeSearch() {
    if (!form.barcode) return;
    try {
      const p = await triggerBarcode(form.barcode).unwrap();
      onEdit(p); // If found, fill the form for editing
      setSuccessMsg("Product loaded from barcode");
    } catch {
      // Not found: keep current form to allow creating a new product
      setSuccessMsg(
        "No existing product with this barcode. You can create one."
      );
    }
  }

  async function handleSave() {
    setErrorMsg("");
    setSuccessMsg("");
    if (!form.name.trim() || !form.barcode.trim() || !form.category) {
      setErrorMsg("Please enter Product Name, Barcode and select a Category.");
      return;
    }
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice || 0),
        retailPrice: Number(form.retailPrice || 0),
        qty: Number(form.qty || 0),
        grnNumber: form.grnNumber || undefined,
        supplier: form.supplier || undefined,
      };
      await createProduct(payload).unwrap();
      setSuccessMsg("Product saved");
      clear();
    } catch (err) {
      setErrorMsg(err?.data?.message || "Failed to save product");
    }
  }

  async function handleUpdate() {
    setErrorMsg("");
    setSuccessMsg("");
    if (!selectedId) return;
    try {
      const payload = {
        id: selectedId,
        ...form,
        costPrice: Number(form.costPrice || 0),
        retailPrice: Number(form.retailPrice || 0),
        qty: Number(form.qty || 0),
        grnNumber: form.grnNumber || undefined,
        supplier: form.supplier || undefined,
      };
      await updateProduct(payload).unwrap();
      setSuccessMsg("Product updated");
      clear();
    } catch (err) {
      setErrorMsg(err?.data?.message || "Failed to update product");
    }
  }

  async function handleAddQuantity() {
    setErrorMsg("");
    setSuccessMsg("");
    if (!selectedId || !form.qtyToAdd) return;
    try {
      await addQuantity({ id: selectedId, quantity: Number(form.qtyToAdd) }).unwrap();
      setSuccessMsg(`Added ${form.qtyToAdd} units to product`);
      // Update the current quantity display
      setForm(prev => ({ ...prev, qty: Number(prev.qty) + Number(form.qtyToAdd), qtyToAdd: "" }));
    } catch (err) {
      setErrorMsg(err?.data?.message || "Failed to add quantity");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 lg:p-4">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Product Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your product inventory
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 self-start sm:self-auto">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="text-xs font-medium text-orange-800">
                {new Date().toDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {selectedId ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-sm text-orange-100 mt-1">
              {selectedId
                ? "Update product information"
                : "Fill in product details"}
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Barcode Number
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={barcodeRef}
                      value={form.barcode}
                      onChange={(e) =>
                        setForm({ ...form, barcode: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleBarcodeSearch();
                        }
                      }}
                      placeholder="Scan or type barcode, then press Enter"
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleBarcodeSearch}
                      className="flex items-center gap-2 px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg sm:rounded-xl font-medium hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base whitespace-nowrap"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Search
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tip: click this field and scan with your USB barcode
                    scanner.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Product Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Cost Price
                    </label>
                    <input
                      type="number"
                      value={form.costPrice}
                      onChange={(e) =>
                        setForm({ ...form, costPrice: e.target.value })
                      }
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Retail Price
                    </label>
                    <input
                      type="number"
                      value={form.retailPrice}
                      onChange={(e) =>
                        setForm({ ...form, retailPrice: e.target.value })
                      }
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Current Quantity
                  </label>
                  <input
                    type="number"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value })}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="0"
                    readOnly={selectedId ? true : false}
                  />
                </div>

                {selectedId && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Add Quantity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={form.qtyToAdd}
                        onChange={(e) => setForm({ ...form, qtyToAdd: e.target.value })}
                        className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        placeholder="Enter quantity to add"
                      />
                      <button
                        type="button"
                        onClick={handleAddQuantity}
                        disabled={!form.qtyToAdd || Number(form.qtyToAdd) <= 0}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Select Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Select Supplier
                  </label>
                  <select
                    value={form.supplier}
                    onChange={(e) =>
                      setForm({ ...form, supplier: e.target.value })
                    }
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    GRN Number
                  </label>
                  <input
                    type="text"
                    value={form.grnNumber}
                    onChange={(e) => setForm({ ...form, grnNumber: e.target.value })}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter GRN number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Upload Image
                  </label>
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4">
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center w-24 h-20 xs:w-28 xs:h-22 sm:w-32 sm:h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                          <svg
                            className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-xs text-gray-500 text-center px-1">
                            <span className="font-semibold block xs:inline">
                              Upload
                            </span>
                            <span className="text-xs block xs:inline">
                              Max 2MB
                            </span>
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </div>
                    )}

                    {form.image?.url && (
                      <div className="relative">
                        <img
                          src={form.image.url}
                          alt="Product preview"
                          className="h-20 w-20 xs:h-22 xs:w-22 sm:h-24 sm:w-24 rounded-lg sm:rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          onClick={() =>
                            setForm((prev) => ({ ...prev, image: null }))
                          }
                          className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons and Search */}
            <div className="mt-6 sm:mt-8 space-y-4">
              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg sm:rounded-xl font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="hidden xs:inline">Save</span>
                  <span className="xs:hidden">Save</span>
                </button>

                <button
                  disabled={!selectedId}
                  onClick={handleUpdate}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="hidden xs:inline">Update</span>
                  <span className="xs:hidden">Update</span>
                </button>

                <button
                  disabled={!selectedId}
                  onClick={async () => {
                    try {
                      await deleteProduct(selectedId).unwrap();
                      clear();
                      setSuccessMsg("Product deleted");
                    } catch (e) {
                      setErrorMsg(e?.data?.message || "Delete failed");
                    }
                  }}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg sm:rounded-xl font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="hidden xs:inline">Delete</span>
                  <span className="xs:hidden">Delete</span>
                </button>

                <button
                  onClick={clear}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="hidden xs:inline">Clear</span>
                  <span className="xs:hidden">Clear</span>
                </button>
              </div>

              {/* Status Messages */}
              {(errorMsg || successMsg) && (
                <div className="space-y-2">
                  {errorMsg && (
                    <div className="flex items-center gap-2 text-red-600 text-sm p-2 bg-red-50 rounded-lg">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="break-words">{errorMsg}</span>
                    </div>
                  )}
                  {successMsg && (
                    <div className="flex items-center gap-2 text-green-600 text-sm p-2 bg-green-50 rounded-lg">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="break-words">{successMsg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Product List
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Click on any product to edit
                </p>
              </div>

              {/* Search Field */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                  placeholder="Search product name"
                />
              </div>
            </div>
          </div>

          {/* Mobile Card View (Hidden on larger screens) */}
          <div className="block sm:hidden">
            {products.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500">
                    Start by adding your first product above.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {products.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => onEdit(p)}
                    className={`cursor-pointer transition-all duration-200 rounded-lg border-2 p-4 ${
                      selectedId === p._id
                        ? "bg-orange-50 border-orange-300 shadow-md"
                        : "bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {p.image?.url ? (
                          <img
                            src={p.image.url}
                            alt="Product"
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {p.name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          #{p.barcode}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">Cost:</span>
                              <span className="font-medium text-gray-700">
                                Rs {Number(p.costPrice).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">Retail:</span>
                              <span className="font-medium text-gray-700">
                                Rs {Number(p.retailPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                getStockStatus(Number(p.qty)).color === "green"
                                  ? "bg-green-100 text-green-800"
                                  : getStockStatus(Number(p.qty)).color === "yellow"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {getStockStatus(Number(p.qty)).status}
                            </span>
                            <div className="text-xs text-gray-500">
                              Qty: {p.qty}
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMore(p);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View More Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Retail
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    View More
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p) => {
                  const stockStatus = getStockStatus(Number(p.qty));
                  
                  return (
                    <tr
                      key={p._id}
                      onClick={() => onEdit(p)}
                      className={`cursor-pointer transition-all duration-200 hover:bg-orange-50 ${
                        selectedId === p._id
                          ? "bg-orange-100 border-l-4 border-orange-500"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          {p.image?.url ? (
                            <img
                              src={p.image.url}
                              alt="Product"
                              className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm flex-shrink-0">
                              {p.name?.charAt(0)?.toUpperCase() || "P"}
                            </div>
                          )}
                          <div className="font-medium text-gray-900 text-sm lg:text-base truncate">
                            {p.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs lg:text-sm text-gray-700 font-mono">
                        {p.barcode}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            stockStatus.color === "green"
                              ? "bg-green-100 text-green-800"
                              : stockStatus.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {p.qty}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs lg:text-sm text-gray-700 font-mono">
                        Rs {Number(p.costPrice).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-xs lg:text-sm text-gray-700 font-mono">
                        Rs {Number(p.retailPrice).toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMore(p);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                          title="View Details"
                        >
                          View More
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No products found
                        </h3>
                        <p className="text-gray-500">
                          Start by adding your first product above.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Details Modal */}
        {showProductModal && selectedProduct && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
            onClick={handleBackdropClick}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 transform">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedProduct.image?.url ? (
                      <img
                        src={selectedProduct.image.url}
                        alt="Product"
                        className="h-16 w-16 rounded-lg object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {selectedProduct.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                      <p className="text-orange-100">Barcode: {selectedProduct.barcode}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-orange-200 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Basic Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product Name:</span>
                        <span className="font-medium text-gray-900">{selectedProduct.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Barcode:</span>
                        <span className="font-mono text-gray-900">{selectedProduct.barcode}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium text-gray-900">
                          {selectedProduct.category?.name || "Not assigned"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supplier:</span>
                        <span className="font-medium text-gray-900">
                          {selectedProduct.supplier?.name || "Not assigned"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">GRN Number:</span>
                        <span className="font-medium text-gray-900">
                          {selectedProduct.grnNumber || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Financial Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Financial Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Price:</span>
                        <span className="font-mono text-gray-900">
                          Rs {Number(selectedProduct.costPrice).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retail Price:</span>
                        <span className="font-mono text-gray-900">
                          Rs {Number(selectedProduct.retailPrice).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit Margin:</span>
                        <span className={`font-medium ${
                          calculateProfitMargin(Number(selectedProduct.costPrice), Number(selectedProduct.retailPrice)) > 20
                            ? "text-green-600"
                            : calculateProfitMargin(Number(selectedProduct.costPrice), Number(selectedProduct.retailPrice)) > 10
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}>
                          {calculateProfitMargin(Number(selectedProduct.costPrice), Number(selectedProduct.retailPrice))}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit Amount:</span>
                        <span className="font-mono text-gray-900">
                          Rs {(Number(selectedProduct.retailPrice) - Number(selectedProduct.costPrice)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="text-2xl font-bold text-blue-900">{selectedProduct.qty}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Stock Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          getStockStatus(Number(selectedProduct.qty)).color === "green"
                            ? "bg-green-100 text-green-800"
                            : getStockStatus(Number(selectedProduct.qty)).color === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {getStockStatus(Number(selectedProduct.qty)).status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-mono text-purple-900 font-semibold">
                          Rs {(Number(selectedProduct.qty) * Number(selectedProduct.costPrice)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedProduct.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedProduct.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      onEdit(selectedProduct);
                      closeModal();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
