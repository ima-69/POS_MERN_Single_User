import { api } from "../../app/api";
export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query({
      query: (params) => ({ url: "/products", params }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((p) => ({ type: "Product", id: p._id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
    getProductByBarcode: build.query({
      query: (barcode) => ({ url: `/products/barcode/${barcode}` }),
    }),
    createProduct: build.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Product", id: arg.id },
        { type: "Product", id: "LIST" },
      ],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: (r, e, arg) => [
        { type: "Product", id: arg },
        { type: "Product", id: "LIST" },
      ],
    }),
    addQuantity: build.mutation({
      query: ({ id, quantity }) => ({
        url: `/products/${id}/add-quantity`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Product", id: arg.id },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});
export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddQuantityMutation,
  useLazyGetProductByBarcodeQuery,
} = productsApi;
