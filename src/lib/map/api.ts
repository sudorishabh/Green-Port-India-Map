import axios from "axios";
import { Port, IInitiatives, KPIS } from "@/lib/map/types";

// Served by this app's own Route Handlers (src/app/api).
const baseUrl = "/api";

// Port API methods
export async function getPorts(): Promise<Port[]> {
  try {
    const response = await axios.get(`${baseUrl}/port/all-ports`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching ports:", error);
    throw error;
  }
}

// KPI API methods
export async function getKpis(): Promise<KPIS[]> {
  try {
    const response = await axios.get(`${baseUrl}/kpi/all-kpis`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    throw error;
  }
}

// KPI Initiatives API methods
export async function getKpiInitiatives({
  portId,
  kpiId,
}: {
  portId: string;
  kpiId: string;
}): Promise<IInitiatives[]> {
  try {
    const url = `${baseUrl}/kpi/initiatives?portId=${portId}&kpiId=${kpiId}`;
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching kpi-initiatives:", error);
    throw error;
  }
}
