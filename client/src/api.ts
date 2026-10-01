import axios from "axios";
import { Port, IInitiatives, KpiTargetLink, KPIS } from "@/lib/types";

const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;

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

export async function getPort(id: number): Promise<Port> {
  try {
    const response = await axios.get(`${baseUrl}/port/single-port/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching port with id ${id}:`, error);
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

export async function getKpi(id: number): Promise<KPIS> {
  try {
    const response = await axios.get(`${baseUrl}/kpi/single-kpi/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching KPI with id ${id}:`, error);
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

export async function getAllInitiatives(): Promise<IInitiatives[]> {
  try {
    const response = await axios.get(`${baseUrl}/initiative/all`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all initiatives:", error);
    throw error;
  }
}

export async function getInitiative(id: number): Promise<IInitiatives> {
  try {
    const response = await axios.get(`${baseUrl}/initiative/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching initiative with id ${id}:`, error);
    throw error;
  }
}

// KPI Target Links API methods
export async function getAllTargetLinks(): Promise<KpiTargetLink[]> {
  try {
    const response = await axios.get(`${baseUrl}/target-link/all`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all target links:", error);
    throw error;
  }
}

export async function getTargetLink(id: number): Promise<KpiTargetLink> {
  try {
    const response = await axios.get(`${baseUrl}/target-link/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching target link with id ${id}:`, error);
    throw error;
  }
}

export async function getS3File(fileName: string, fileType: string) {
  try {
    const response = await axios.get(
      `${baseUrl}/s3/file-url?fileName=${fileName}&fileType=${fileType}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching S3 file:", error);
    throw error;
  }
}
