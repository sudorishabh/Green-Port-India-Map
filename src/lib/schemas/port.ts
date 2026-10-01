import { z } from "zod";

// Mirrors the port_master table. Shared by the API and its clients.

export const PORT_LOCATION_TYPES = ["Indian", "Other"] as const;
export const PORT_STATUSES = ["Active", "Inactive"] as const;

/** Largest value a Postgres `integer` column holds. */
const MAX_INTEGER = 2_147_483_647;

export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const text = (maxLength: number) => z.string().trim().max(maxLength);

const requiredText = (maxLength: number) =>
  text(maxLength).min(1, "Required");

const count = z.int().min(0).max(MAX_INTEGER);

/**
 * A decimal column. The API returns decimals as strings (e.g. "19.076"), so
 * numeric strings are accepted as well as numbers. Parses to a string, which
 * is how Drizzle writes decimal columns.
 */
const decimal = (number: z.ZodNumber) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() !== "" ? Number(value) : value,
    number.transform(String),
  );

const latitude = () => decimal(z.number().min(-90).max(90));
const longitude = () => decimal(z.number().min(-180).max(180));

/**
 * Largest port capacity accepted, in million TEU a year. The busiest port
 * handles about 50; a larger value was almost certainly entered in TEU.
 */
export const MAX_PORT_CAPACITY = 1000;

export const portSchema = z.object({
  port_location_type: z.enum(PORT_LOCATION_TYPES).optional(),
  name: requiredText(100),
  country: requiredText(100),
  city: requiredText(100),
  status: z.enum(PORT_STATUSES).optional(),
  lat: latitude(),
  lng: longitude(),
  number_of_berths: count.optional(),
  port_type: text(100).optional(),
  /** Average turnaround time, in whole days. */
  average_tat: count.optional(),
  port_capacity: decimal(
    z
      .number()
      .min(0)
      .max(MAX_PORT_CAPACITY, "Enter the capacity in million TEU, e.g. 8.5"),
  ).optional(),
  dominant_cargo: text(200).optional(),
  /** The Indian hub a partner port connects to; empty for hubs. */
  ind_port_name: text(100).nullable().optional(),
  ind_port_lat: latitude().nullable().optional(),
  ind_port_lng: longitude().nullable().optional(),
  /** How far, in degrees, the route line bows away from a straight line. */
  polyline_curve: z.int().min(-90).max(90).optional(),
  polyline_color: z
    .string()
    .regex(HEX_COLOR, "Must be a hex colour such as #ff0000")
    .optional(),
  /** Google Maps zoom level. */
  zoom: z.int().min(0).max(22).optional(),
  zoom_center_lat: latitude().optional(),
  zoom_center_lng: longitude().optional(),
});

/** Updates may send any subset of the fields. */
export const portUpdateSchema = portSchema.partial();

export type PortInput = z.output<typeof portSchema>;
export type PortUpdate = z.output<typeof portUpdateSchema>;
