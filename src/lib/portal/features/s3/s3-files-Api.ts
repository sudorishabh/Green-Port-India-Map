import { api } from "../api";

const s3FilesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getS3File: builder.query<
      { success: boolean; url: string },
      { fileName: string | null | undefined; fileType: string | null | undefined }
    >({
      query: ({ fileName, fileType }) => ({
        url: "/s3/file-url",
        method: "GET",
        params: { fileName, fileType },
      }),
    }),
    getUploadUrl: builder.mutation<
      { success: boolean; uploadUrl: string },
      { fileName: string }
    >({
      query: (data) => ({
        url: "/s3/upload-url",
        method: "POST",
        body: data,
      }),
    }),

    deleteFileUrl: builder.mutation<{ success: boolean }, { fileName: string }>(
      {
        query: (data) => ({
          url: "/s3/delete",
          method: "DELETE",
          body: data,
        }),
      }
    ),
  }),
});

export const {
  useGetUploadUrlMutation,
  useGetS3FileQuery,
  useDeleteFileUrlMutation,
} = s3FilesApi;
