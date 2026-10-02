export type Kpi = {
  kpi_id: number;
  kpi_category: string;
  kpi: string;
  kpi_international_target: string;
  kpi_national_target: string;
  created_at?: Date | string | null;
};

export type KpiTargetLink = {
  link_id?: number;
  target_type: string;
  link_url: string;
  created_at?: Date | string | null;
  kpi_id?: number;
};

export type Kpis = {
  kpiData: Kpi;
  targetsLinks: {
    national: KpiTargetLink[];
    international: KpiTargetLink[];
  };
};

export type Initiative = {
  created_at: Date | string | null;
  initiative: string;
  initiative_id: number;
  initiative_url: string;
  kpi: string | null;
  kpi_id: number;
  port_id: number;
};

/** A port as edited in the portal's port form. */
export type Port = {
  port_location_type: string;
  port_id?: number;
  name: string;
  country: string;
  city: string;
  number_of_berths?: number | null;
  port_type?: string | null;
  average_tat?: number | null;
  port_capacity?: number | null;
  dominant_cargo?: string | null;
  lat: number;
  lng: number;
  status: string;
  ind_port_name?: string | null;
  ind_port_lat?: number | null;
  ind_port_lng?: number | null;
  polyline_curve?: number | null;
  polyline_color?: string | null;
  created_at?: Date | string | null;
};

export interface PortFormProps {
  isOpen: boolean;
  onClose: () => void;
  portType?: "Indian" | "Other" | null;
  indianPorts?: Port[];
  editingPort?: Port | null;
}
