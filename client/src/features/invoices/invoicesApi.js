import { api } from '../../app/api'

export const invoicesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query({
      query: ({ page = 1, limit = 10, search = '', startDate = '', endDate = '', customerId = '' } = {}) => ({
        url: '/sales',
        params: { page, limit, search, startDate, endDate, customerId }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Invoice', id: _id })),
              { type: 'Invoice', id: 'LIST' },
            ]
          : [{ type: 'Invoice', id: 'LIST' }],
    }),
    getInvoiceById: build.query({
      query: (id) => ({ url: `/sales/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),
    getInvoiceStats: build.query({
      query: ({ startDate = '', endDate = '' } = {}) => ({
        url: '/sales/stats',
        params: { startDate, endDate }
      }),
    }),
    getMonthlyInvoices: build.query({
      query: ({ year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = {}) => ({
        url: '/sales/monthly',
        params: { year, month }
      }),
    }),
    getYearlyInvoices: build.query({
      query: ({ year = new Date().getFullYear() } = {}) => ({
        url: '/sales/yearly',
        params: { year }
      }),
    }),
  })
})

export const { 
  useGetInvoicesQuery, 
  useGetInvoiceByIdQuery, 
  useGetInvoiceStatsQuery,
  useGetMonthlyInvoicesQuery,
  useGetYearlyInvoicesQuery
} = invoicesApi
