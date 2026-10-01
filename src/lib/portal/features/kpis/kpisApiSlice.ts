import { api } from "../api";
import { Initiative, Kpis } from "@/lib/portal/types";

export const kpisApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getKpis: builder.query<{ data: Kpis[] }, void>({
      query: () => "/kpi/all-kpis",
      providesTags: ["Kpis"],
    }),
    // Query to get a single kpi (potentially including related data)
    getKpiById: builder.query<Kpis, number>({
      query: (kpi_id) => `/kpi/single-kpi/${kpi_id}`,
      providesTags: ["Kpis"],
    }),
    // Mutation to add a new kpi
    addKpi: builder.mutation({
      query: (newKpiCoreData) => ({
        url: "/kpi/create-kpi",
        method: "POST",
        body: JSON.stringify(newKpiCoreData),
      }),
      invalidatesTags: ["Kpis"],
    }),
    // Mutation to update an existing kpi (only core fields for now)
    updateKpi: builder.mutation({
      query: ({ kpi_id, data }) => ({
        url: `/kpi/update-kpi/${kpi_id}`,
        method: "POST",
        body: JSON.stringify(data), // Sending only the core form data
      }),
      invalidatesTags: ["Kpis"],
    }),
    // Mutation to delete a kpi
    deleteKpi: builder.mutation({
      query: (kpi_id) => ({
        url: `/kpi/delete-kpi/${kpi_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Kpis"],
    }),

    addGreenInitiative: builder.mutation({
      query: ({ kpi_id, port_id, initiative, initiative_url }) => ({
        url: `/kpi/initiatives/${kpi_id}/${port_id}`,
        method: "POST",
        body: { initiative, initiative_url },
      }),
      invalidatesTags: ["GreenInitiatives"],
    }),
    // Mutation to update an existing green initiative
    updateGreenInitiative: builder.mutation({
      query: ({ initiative_id, initiative }) => ({
        url: `/kpi/update-initiative/${initiative_id}`,
        method: "POST",
        body: JSON.stringify(initiative),
      }),
      invalidatesTags: ["GreenInitiatives"],
    }),
    // Mutation to delete a green initiative
    deleteGreenInitiative: builder.mutation<
      { success: boolean; initiative_id: number },
      number
    >({
      query: (initiative_id) => ({
        url: `/kpi/delete-initiative/${initiative_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GreenInitiatives"],
    }),

    getPortInitiatives: builder.query<{ data: Initiative[] }, number>({
      query: (port_id) => `/kpi/port-initiatives/${port_id}`,
      providesTags: ["GreenInitiatives"],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetKpisQuery,
  useGetKpiByIdQuery,
  useAddKpiMutation,
  useUpdateKpiMutation,
  useDeleteKpiMutation,
  useAddGreenInitiativeMutation,
  useUpdateGreenInitiativeMutation,
  useDeleteGreenInitiativeMutation,
  useGetPortInitiativesQuery,
} = kpisApiSlice;
