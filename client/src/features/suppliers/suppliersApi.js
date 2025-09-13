import { api } from '../../app/api'
export const suppliersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSuppliers: build.query({
      query: (params) => ({ url: '/suppliers', params }),
      providesTags: (res) =>
        res ? [...res.map(s => ({ type: 'Supplier', id: s._id })), { type: 'Supplier', id: 'LIST' }]
            : [{ type: 'Supplier', id: 'LIST' }]
    }),
    createSupplier: build.mutation({
      query: (body) => ({ url: '/suppliers', method: 'POST', body }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }]
    }),
    updateSupplier: build.mutation({
      query: ({ id, ...data }) => ({ url: `/suppliers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r,e,arg) => [{ type: 'Supplier', id: arg.id }, { type: 'Supplier', id: 'LIST' }]
    }),
    deleteSupplier: build.mutation({
      query: (id) => ({ url: `/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: (r,e,arg) => [{ type: 'Supplier', id: arg }, { type: 'Supplier', id: 'LIST' }]
    }),
    updatePaidAmount: build.mutation({
      query: ({ id, paidAmount }) => ({ url: `/suppliers/${id}/paid-amount`, method: 'PUT', body: { paidAmount } }),
      invalidatesTags: (r,e,arg) => [{ type: 'Supplier', id: arg.id }, { type: 'Supplier', id: 'LIST' }]
    })
  })
})
export const { useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation, useDeleteSupplierMutation, useUpdatePaidAmountMutation } = suppliersApi