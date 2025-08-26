import { api } from '../../app/api'

export const salesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNextInvoice: build.query({
      query: () => ({ url: '/sales/next' })
    }),
    createSale: build.mutation({
      query: (body) => ({ url: '/sales', method: 'POST', body })
    })
  })
})

export const { useGetNextInvoiceQuery, useCreateSaleMutation } = salesApi