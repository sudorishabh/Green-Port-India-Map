import type { portMaster } from "../schema.ts";

type PortRow = typeof portMaster.$inferInsert;

/**
 * Facts shown in the port modal. Capacity is the latest annual container
 * throughput in million TEU, rounded to whole numbers here. Turnaround time is
 * in whole days, as that column is an integer; most foreign turnaround times
 * are estimates.
 */
type PortFacts = Pick<
  PortRow,
  | "name"
  | "city"
  | "number_of_berths"
  | "port_type"
  | "average_tat"
  | "dominant_cargo"
> & { lat: number; lng: number; port_capacity: number };

export interface HubPort extends PortFacts {
  /** Colour of the route lines drawn to this port's partners. */
  polyline_color: string;
}

export interface PartnerPort extends PortFacts {
  country: string;
  hub: HubName;
  /** Latitude offset of the route curve's control point; higher arcs further north. */
  polyline_curve: number;
}

export const hubPorts = [
  {
    name: "Jawaharlal Nehru Port Authority",
    city: "Navi Mumbai",
    lat: 18.945,
    lng: 72.949,
    number_of_berths: 16,
    port_type: "Major port – container hub",
    average_tat: 1,
    port_capacity: 8,
    dominant_cargo: "Containers, liquid bulk (POL/chemicals), cement",
    polyline_color: "#00008b",
  },
  {
    name: "Visakhapatnam Port Authority",
    city: "Visakhapatnam",
    lat: 17.698,
    lng: 83.279,
    number_of_berths: 31,
    port_type: "Major port – bulk, liquid & container",
    average_tat: 3,
    port_capacity: 1,
    dominant_cargo: "Iron ore, coal, POL, fertilisers, containers",
    polyline_color: "#ff4800",
  },
  {
    name: "V.O. Chidambaranar Port Authority",
    city: "Thoothukudi",
    lat: 8.75,
    lng: 78.2,
    number_of_berths: 14,
    port_type: "Major port – coal, container & bulk",
    average_tat: 2,
    port_capacity: 1,
    dominant_cargo: "Thermal coal, containers, limestone, fertilisers",
    polyline_color: "#800080",
  },
  {
    name: "Deendayal Port Authority",
    city: "Kandla",
    lat: 23.005,
    lng: 70.218,
    number_of_berths: 24,
    port_type: "Major port – liquid & dry bulk",
    average_tat: 2,
    port_capacity: 1,
    dominant_cargo: "Crude oil & POL, coal, fertilisers, edible oil, salt",
    polyline_color: "#ff0000",
  },
] as const satisfies readonly HubPort[];

export type HubName = (typeof hubPorts)[number]["name"];

export const partnerPorts = [
  // Europe, connected to JNPA
  {
    name: "Port of Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    lat: 52.415,
    lng: 4.79,
    number_of_berths: 100,
    port_type: "Inland seaport (bulk and energy)",
    average_tat: 2,
    port_capacity: 0,
    dominant_cargo: "Oil products, coal, agribulk, construction materials",
    hub: "Jawaharlal Nehru Port Authority",
    polyline_curve: 22,
  },
  {
    name: "Port of Rotterdam",
    country: "Netherlands",
    city: "Rotterdam",
    lat: 51.954,
    lng: 4.029,
    number_of_berths: 500,
    port_type: "Multipurpose deep-sea port, industrial hub",
    average_tat: 1,
    port_capacity: 14,
    dominant_cargo: "Crude oil, oil products, containers, dry bulk, LNG",
    hub: "Jawaharlal Nehru Port Authority",
    polyline_curve: 20,
  },
  {
    name: "Port of Antwerp-Bruges",
    country: "Belgium",
    city: "Antwerp",
    lat: 51.293,
    lng: 4.262,
    number_of_berths: 600,
    port_type: "Multipurpose seaport (Antwerp + Zeebrugge)",
    average_tat: 1,
    port_capacity: 14,
    dominant_cargo: "Containers, liquid bulk/chemicals, ro-ro, breakbulk",
    hub: "Jawaharlal Nehru Port Authority",
    polyline_curve: 18,
  },
  {
    name: "Port of Gothenburg",
    country: "Sweden",
    city: "Gothenburg",
    lat: 57.693,
    lng: 11.855,
    number_of_berths: 49,
    port_type: "Multipurpose seaport, Nordic gateway",
    average_tat: 1,
    port_capacity: 1,
    dominant_cargo: "Crude oil/energy products, containers, ro-ro, vehicles",
    hub: "Jawaharlal Nehru Port Authority",
    polyline_curve: 20,
  },
  {
    name: "Port of Hamburg",
    country: "Germany",
    city: "Hamburg",
    lat: 53.533,
    lng: 9.922,
    number_of_berths: 320,
    port_type: "Tidal river seaport, container hub",
    average_tat: 2,
    port_capacity: 8,
    dominant_cargo: "Containers, dry bulk, liquid bulk",
    hub: "Jawaharlal Nehru Port Authority",
    polyline_curve: 22,
  },

  // Asia-Pacific and the US West Coast, connected to Visakhapatnam
  {
    name: "Port of Singapore",
    country: "Singapore",
    city: "Singapore",
    lat: 1.268,
    lng: 103.77,
    number_of_berths: 88,
    port_type: "Transshipment hub",
    average_tat: 1,
    port_capacity: 41,
    dominant_cargo: "Containers (about 90% transshipment), bunkers, general cargo",
    hub: "Visakhapatnam Port Authority",
    polyline_curve: 15,
  },
  {
    name: "Port of Shanghai",
    country: "China",
    city: "Shanghai",
    lat: 30.62,
    lng: 122.065,
    number_of_berths: 49,
    port_type: "Container gateway & transshipment hub",
    average_tat: 1,
    port_capacity: 52,
    dominant_cargo: "Containers, dry bulk (iron ore, coal), ro-ro vehicles",
    hub: "Visakhapatnam Port Authority",
    polyline_curve: 20,
  },
  {
    name: "Busan Port",
    country: "South Korea",
    city: "Busan",
    lat: 35.08,
    lng: 128.825,
    number_of_berths: 201,
    port_type: "Container gateway & transshipment hub",
    average_tat: 1,
    port_capacity: 24,
    dominant_cargo: "Containers, general cargo",
    hub: "Visakhapatnam Port Authority",
    polyline_curve: 25,
  },
  {
    name: "Port of Los Angeles",
    country: "United States",
    city: "Los Angeles",
    lat: 33.74,
    lng: -118.265,
    number_of_berths: 270,
    port_type: "Landlord port (container, cruise)",
    average_tat: 3,
    port_capacity: 10,
    dominant_cargo: "Containers (furniture, auto parts), autos, liquid bulk",
    hub: "Visakhapatnam Port Authority",
    polyline_curve: 55,
  },
  {
    name: "Port of Long Beach",
    country: "United States",
    city: "Long Beach",
    lat: 33.755,
    lng: -118.215,
    number_of_berths: 80,
    port_type: "Landlord port (container, bulk)",
    average_tat: 3,
    port_capacity: 10,
    dominant_cargo: "Containers, petroleum/liquid bulk, dry bulk, autos",
    hub: "Visakhapatnam Port Authority",
    polyline_curve: 40,
  },

  // Africa and the US East Coast, connected to V.O. Chidambaranar
  {
    name: "Port of Cape Town",
    country: "South Africa",
    city: "Cape Town",
    lat: -33.905,
    lng: 18.444,
    number_of_berths: 42,
    port_type: "State landlord port (multipurpose)",
    average_tat: 3,
    port_capacity: 1,
    dominant_cargo: "Containers (fruit reefers), petroleum, fish, breakbulk",
    hub: "V.O. Chidambaranar Port Authority",
    polyline_curve: 40,
  },
  {
    name: "Rivers Port, Port Harcourt",
    country: "Nigeria",
    city: "Port Harcourt",
    lat: 4.767,
    lng: 7.005,
    number_of_berths: 8,
    port_type: "Landlord multipurpose seaport",
    average_tat: 5,
    port_capacity: 0,
    dominant_cargo: "General cargo, dry bulk, petroleum products",
    hub: "V.O. Chidambaranar Port Authority",
    polyline_curve: 25,
  },
  {
    name: "Port of New York and New Jersey",
    country: "United States",
    city: "Newark",
    lat: 40.684,
    lng: -74.15,
    number_of_berths: 30,
    port_type: "Landlord port (container, ro-ro)",
    average_tat: 2,
    port_capacity: 9,
    dominant_cargo: "Containers (furniture, plastics, machinery), autos, bulk",
    hub: "V.O. Chidambaranar Port Authority",
    polyline_curve: 40,
  },
  {
    name: "Port of Savannah",
    country: "United States",
    city: "Savannah",
    lat: 32.128,
    lng: -81.14,
    number_of_berths: 11,
    port_type: "State operating port (container, ro-ro)",
    average_tat: 2,
    port_capacity: 6,
    dominant_cargo: "Containers (retail imports, agri/forest exports), ro-ro",
    hub: "V.O. Chidambaranar Port Authority",
    polyline_curve: 40,
  },
  {
    name: "PortMiami",
    country: "United States",
    city: "Miami",
    lat: 25.773,
    lng: -80.163,
    number_of_berths: 20,
    port_type: "Landlord port (cruise and container)",
    average_tat: 1,
    port_capacity: 1,
    dominant_cargo: "Containers (perishables, consumer goods), cruise",
    hub: "V.O. Chidambaranar Port Authority",
    polyline_curve: 40,
  },

  // Middle East, connected to Deendayal
  {
    name: "Jeddah Islamic Port",
    country: "Saudi Arabia",
    city: "Jeddah",
    lat: 21.47,
    lng: 39.162,
    number_of_berths: 62,
    port_type: "Multipurpose gateway & transshipment",
    average_tat: 2,
    port_capacity: 4,
    dominant_cargo: "Containers, general cargo, ro-ro vehicles, grain, livestock",
    hub: "Deendayal Port Authority",
    polyline_curve: 20,
  },
  {
    name: "Jebel Ali Port",
    country: "United Arab Emirates",
    city: "Dubai",
    lat: 25.011,
    lng: 55.061,
    number_of_berths: 67,
    port_type: "Container gateway & transshipment hub",
    average_tat: 1,
    port_capacity: 16,
    dominant_cargo: "Containers, breakbulk, ro-ro vehicles, project cargo",
    hub: "Deendayal Port Authority",
    polyline_curve: 5,
  },
  {
    name: "Hamad Port",
    country: "Qatar",
    city: "Doha",
    lat: 25.022,
    lng: 51.59,
    number_of_berths: 39,
    port_type: "Multipurpose gateway & transshipment",
    average_tat: 1,
    port_capacity: 1,
    dominant_cargo: "Containers, general cargo, ro-ro vehicles, livestock, grain",
    hub: "Deendayal Port Authority",
    polyline_curve: 8,
  },
] as const satisfies readonly PartnerPort[];

export type PortName = HubName | (typeof partnerPorts)[number]["name"];
