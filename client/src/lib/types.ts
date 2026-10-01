export interface Port {
  port_id: number;
  port_location_type?: string;
  name: string;
  country: string;
  city: string;
  image_s3_name: string;
  flag_s3_name: string;
  image_url: string;
  flag_url: string;
  number_of_berths: number;
  port_type: string;
  average_tat: number;
  port_capacity: number;
  dominant_cargo: string;
  lat: number;
  lng: number;
  status: string;
  ind_port_name?: string;
  ind_port_lat?: number;
  ind_port_lng?: number;
  polyline_curve?: number;
  zoom?: number;
  polyline_color?: string;
  zoom_center_lat?: number;
  zoom_center_lng?: number;
  created_at: string;
}

export interface KPIS {
  kpiData: {
    kpi_id: number;
    kpi_category: string;
    kpi: string;
    kpi_national_target: string;
    kpi_international_target: string;
  };
  targetsLinks: {
    international: {
      link_id: number;
      target_type: string;
      link_url: string;
      created_at: string;
      kpi_id: number;
    }[];
    national: {
      link_id: number;
      target_type: string;
      link_url: string;
      created_at: string;
      kpi_id: number;
    }[];
  };
}

export interface IInitiatives {
  created_at: string;
  initiative: string;
  initiative_id: number;
  initiative_url: string;
  kpi: string;
  kpi_id: number;
  port_id: number;
}

export interface TargetLinks {
  kpi_id: number;
  targets: {
    international: {
      link_id: number;
      target_type: string;
      link_url: string;
      created_at: string;
      kpi_id: number;
    }[];
    nation: {
      link_id: number;
      target_type: string;
      link_url: string;
      created_at: string;
      kpi_id: number;
    }[];
  };
}

export interface KpisByCategory {
  [category: string]: Array<{
    kpi_id: number;
    kpi: string;
    kpi_national_target: string;
    kpi_international_target: string;
    kpi_international_target_links: {
      link_id: number;
      target_type: string;
      link_url: string;
      created_at: string;
      kpi_id: number;
    }[];
    kpi_nation_target_links: {
      link_id: number;
      target_type: string;
      link_url: string;
      created_at: string;
      kpi_id: number;
    }[];
  }>;
}

export interface ITargetSection {
  label: string;
  targetText: string;
  links:
    | {
        link_id: number;
        target_type: string;
        link_url: string;
        created_at: string;
        kpi_id: number;
      }[]
    | undefined;
}

export interface S3File {
  url: string;
}

export interface KpiTargetLink {
  link_id: number;
  target_type: "national" | "international";
  link_url: string;
  created_at: string;
  kpi_id: number;
}
