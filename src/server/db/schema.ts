import {
  varchar,
  decimal,
  timestamp,
  text,
  pgTable,
  serial,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  refreshToken: text("refresh_token"),
  /** Carried by every session token; incrementing it revokes all of the user's sessions. */
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portMaster = pgTable("port_master", {
  port_id: serial("port_id").primaryKey(),
  port_location_type: varchar("port_location_type", { length: 100 })
    .notNull()
    .default("Indian"),
  /** Unique: partner ports refer to their Indian hub by name (ind_port_name). */
  name: varchar("name", { length: 100 }).notNull().default("").unique(),
  country: varchar("country", { length: 100 }).notNull().default(""),
  city: varchar("city", { length: 100 }).notNull().default(""),
  number_of_berths: integer("number_of_berths").notNull().default(0),
  port_type: varchar("port_type", { length: 100 }).notNull().default(""),
  average_tat: integer("average_tat").notNull().default(0),
  /** Annual container throughput in million TEU. */
  port_capacity: decimal("port_capacity", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  dominant_cargo: varchar("dominant_cargo", { length: 200 })
    .notNull()
    .default(""),
  lat: decimal("lat", { precision: 6, scale: 3 }).notNull().default("0.000"),
  lng: decimal("lng", { precision: 6, scale: 3 }).notNull().default("0.000"),
  status: varchar("status", { length: 10 }).notNull().default("Active"),
  ind_port_name: varchar("ind_port_name", { length: 100 }).default(""),
  ind_port_lat: decimal("ind_port_lat", { precision: 6, scale: 3 }).default(
    "0.000"
  ),
  ind_port_lng: decimal("ind_port_lng", { precision: 6, scale: 3 }).default(
    "0.000"
  ),
  polyline_curve: integer("polyline_curve").notNull().default(4),
  zoom: integer("zoom").notNull().default(3),
  polyline_color: varchar("polyline_color", { length: 100 })
    .notNull()
    .default("#000000"),
  zoom_center_lat: decimal("zoom_center_lat", {
    precision: 6,
    scale: 3,
  })
    .notNull()
    .default("5.6"),
  zoom_center_lng: decimal("zoom_center_lng", {
    precision: 6,
    scale: 3,
  })
    .notNull()
    .default("5.6"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const portKpis = pgTable("port_kpis", {
  kpi_id: serial("kpi_id").primaryKey(),
  kpi_category: varchar("kpi_category", { length: 500 }).notNull(),
  kpi: varchar("kpi", { length: 500 }).notNull(),
  kpi_international_target: varchar("kpi_international_target", {
    length: 500,
  }).notNull(),
  kpi_national_target: varchar("kpi_national_target", {
    length: 500,
  }).notNull(),
  current_status: varchar("current_status", { length: 500 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const kpiTargetsLinks = pgTable("kpi_target_links", {
  link_id: serial("link_id").primaryKey(),
  target_type: varchar("target_type", { length: 50 }).notNull(),
  link_url: varchar("link_url", { length: 500 }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  kpi_id: integer("kpi_id").references(() => portKpis.kpi_id, {
    onDelete: "cascade",
  }),
});

export const portGreenInitiatives = pgTable("port_green_initiatives", {
  initiative_id: serial("initiative_id").primaryKey(),
  initiative: text("initiative").notNull(),
  initiative_url: varchar("initiative_url", { length: 200 }).notNull(),
  kpi: varchar("kpi", { length: 500 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  kpi_id: integer("kpi_id").references(() => portKpis.kpi_id, {
    onDelete: "cascade",
  }),
  port_id: integer("portId")
    .references(() => portMaster.port_id, { onDelete: "cascade" })
    .notNull(),
});
