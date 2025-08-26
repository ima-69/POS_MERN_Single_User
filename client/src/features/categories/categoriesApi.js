import { api } from "../../app/api";
export const categoriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query({
      query: (params) => ({ url: "/categories", params }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((c) => ({ type: "Category", id: c._id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
    createCategory: build.mutation({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
    updateCategory: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Category", id: arg.id },
        { type: "Category", id: "LIST" },
      ],
    }),
    deleteCategory: build.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: (r, e, arg) => [
        { type: "Category", id: arg },
        { type: "Category", id: "LIST" },
      ],
    }),
  }),
});
export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
