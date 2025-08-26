import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api`,
    credentials: "include",
  }),
  tagTypes: ["Auth", "Category", "Supplier", "Customer", "Product", "Upload"],
  endpoints: () => ({}),
});
