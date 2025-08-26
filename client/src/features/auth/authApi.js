import { api } from '../../app/api'

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    signup: build.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth']
    }),
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth']
    }),
    logout: build.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth']
    }),
    me: build.query({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Auth']
    })
  })
})

export const { useSignupMutation, useLoginMutation, useLogoutMutation, useMeQuery } = authApi