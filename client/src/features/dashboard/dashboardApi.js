import { api } from '../../app/api'

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query({
      query: () => ({ url: '/analytics/dashboard' })
    })
  })
})

export const { useGetDashboardQuery } = dashboardApi