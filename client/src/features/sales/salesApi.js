import { api } from '../../app/api'

export const salesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNextInvoice: build.query({
      query: () => ({ url: '/sales/next' })
    }),
    createSale: build.mutation({
      query: (body) => ({ url: '/sales', method: 'POST', body }),
      invalidatesTags: (result, error, arg) => {
        // If a customer is selected, invalidate their cache
        if (arg.customerId) {
          return [
            { type: 'Customer', id: arg.customerId },
            { type: 'Customer', id: 'LIST' }
          ];
        }
        return [];
      }
    })
  })
})

export const { useGetNextInvoiceQuery, useCreateSaleMutation } = salesApi