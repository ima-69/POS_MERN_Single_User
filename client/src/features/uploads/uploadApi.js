import { api } from "../../app/api";

export const uploadApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadImage: build.mutation({
      query: (file) => {
        const form = new FormData();
        form.append("file", file);
        return { url: "/upload/image", method: "POST", body: form };
      },
    }),
  }),
});
export const { useUploadImageMutation } = uploadApi;
