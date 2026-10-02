import axios from "axios";
import { Initiative, KPIS, Port } from "@/lib/map/types";

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

// All of a port's green initiatives, for every KPI
export async function getPortInitiatives(portId: number): Promise<Initiative[]> {
  try {
    const response = await axios.get(`${baseUrl}/kpi/port-initiatives/${portId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching port initiatives:", error);
    throw error;
  }
}
