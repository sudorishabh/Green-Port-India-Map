import { Port } from "@/lib/portal/types";
import { api } from "../api";

export const portsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getPorts: builder.query<{ data: Port[] }, void>({
      query: () => "/port/all-ports",
      providesTags: ["Ports"],
    }),

    addPort: builder.mutation({
      query: (newPort) => ({
        url: "/port/create-port",
        method: "POST",
        body: JSON.stringify(newPort),
      }),
      invalidatesTags: ["Ports"],
    }),

    updatePort: builder.mutation({
      query: ({ port_id, data }) => ({
        url: `/port/update-port/${port_id}`,
        method: "POST",
        body: JSON.stringify(data),
      }),
      invalidatesTags: ["Ports"],
    }),

    deletePort: builder.mutation<{ success: boolean; port_id: number }, number>(
      {
        query: (port_id) => ({
          url: `/port/delete-port/${port_id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Ports"],
      }
    ),
  }),
});

export const {
  useGetPortsQuery,
  useAddPortMutation,
  useUpdatePortMutation,
  useDeletePortMutation,
} = portsApiSlice;
