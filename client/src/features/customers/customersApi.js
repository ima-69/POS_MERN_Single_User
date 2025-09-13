import { api } from "../../app/api";
export const customersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query({
      query: (params) => ({ url: "/customers", params }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((c) => ({ type: "Customer", id: c._id })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),
    createCustomer: build.mutation({
      query: (body) => ({ url: "/customers", method: "POST", body }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),
    updateCustomer: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Customer", id: arg.id },
        { type: "Customer", id: "LIST" },
      ],
    }),
    deleteCustomer: build.mutation({
      query: (id) => ({ url: `/customers/${id}`, method: "DELETE" }),
      invalidatesTags: (r, e, arg) => [
        { type: "Customer", id: arg },
        { type: "Customer", id: "LIST" },
      ],
    }),
    updatePaidAmount: build.mutation({
      query: ({ id, paidAmount }) => ({ 
        url: `/customers/${id}/paid-amount`, 
        method: 'PUT', 
        body: { paidAmount } 
      }),
      invalidatesTags: (r,e,arg) => [
        { type: 'Customer', id: arg.id }, 
        { type: 'Customer', id: 'LIST' }
      ]
    }),
  }),
});
export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useUpdatePaidAmountMutation,
} = customersApi;
