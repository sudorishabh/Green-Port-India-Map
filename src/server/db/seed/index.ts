/**
 * Seeds the reference dataset: Indian hub ports and their partner ports, the
 * green port KPIs with target links, and each port's green initiatives.
 *
 * Run with `npm run db:seed`. Safe to re-run: ports are matched by name and
 * KPIs by title and reset to the values here, and initiatives are only added
 * when missing. Rows created through the portal are left alone.
 */
// @next/env is bundled CommonJS, so Node can't import its exports by name.
import nextEnv from "@next/env";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  kpiTargetsLinks,
  portGreenInitiatives,
  portKpis,
  portMaster,
} from "../schema.ts";
import { initiatives } from "./initiatives.ts";
import { kpis, type KpiKey, type SeedKpi } from "./kpis.ts";
import {
  hubPorts,
  partnerPorts,
  type HubPort,
  type PartnerPort,
} from "./ports.ts";

nextEnv.loadEnvConfig(process.cwd());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type PortRow = typeof portMaster.$inferInsert;

const coord = (value: number) => value.toFixed(3);

function hubRow({
  lat,
  lng,
  zoom_center,
  port_capacity,
  ...port
}: HubPort): PortRow {
  return {
    ...port,
    port_location_type: "Indian",
    country: "India",
    status: "Active",
    lat: coord(lat),
    lng: coord(lng),
    port_capacity: String(port_capacity),
    // Ports without an Indian port name are drawn as hubs on the map.
    ind_port_name: "",
    zoom_center_lat: coord(zoom_center.lat),
    zoom_center_lng: coord(zoom_center.lng),
  };
}

function partnerRow({
  lat,
  lng,
  hub,
  port_capacity,
  ...port
}: PartnerPort): PortRow {
  const hubPort = hubPorts.find(({ name }) => name === hub)!;
  return {
    ...port,
    port_location_type: "Other",
    status: "Active",
    lat: coord(lat),
    lng: coord(lng),
    port_capacity: String(port_capacity),
    ind_port_name: hubPort.name,
    ind_port_lat: coord(hubPort.lat),
    ind_port_lng: coord(hubPort.lng),
  };
}

async function upsertPorts(tx: Transaction) {
  const rows = [...hubPorts.map(hubRow), ...partnerPorts.map(partnerRow)];
  const ids = new Map<string, number>();
  let inserted = 0;

  for (const row of rows) {
    const [existing] = await tx
      .select({ port_id: portMaster.port_id })
      .from(portMaster)
      .where(eq(portMaster.name, row.name!))
      .limit(1);

    if (existing) {
      await tx
        .update(portMaster)
        .set(row)
        .where(eq(portMaster.port_id, existing.port_id));
      ids.set(row.name!, existing.port_id);
    } else {
      const [created] = await tx
        .insert(portMaster)
        .values(row)
        .returning({ port_id: portMaster.port_id });
      ids.set(row.name!, created.port_id);
      inserted++;
    }
  }

  return { ids, inserted, updated: rows.length - inserted };
}

async function upsertKpis(tx: Transaction) {
  const entries = Object.entries(kpis) as [KpiKey, SeedKpi][];
  const ids = new Map<KpiKey, number>();
  let inserted = 0;

  for (const [key, { links, ...kpi }] of entries) {
    const [existing] = await tx
      .select({ kpi_id: portKpis.kpi_id })
      .from(portKpis)
      .where(eq(portKpis.kpi, kpi.kpi))
      .limit(1);

    let kpiId: number;
    if (existing) {
      kpiId = existing.kpi_id;
      await tx.update(portKpis).set(kpi).where(eq(portKpis.kpi_id, kpiId));
      await tx.delete(kpiTargetsLinks).where(eq(kpiTargetsLinks.kpi_id, kpiId));
    } else {
      [{ kpi_id: kpiId }] = await tx
        .insert(portKpis)
        .values(kpi)
        .returning({ kpi_id: portKpis.kpi_id });
      inserted++;
    }

    await tx
      .insert(kpiTargetsLinks)
      .values(links.map((link) => ({ ...link, kpi_id: kpiId })));
    ids.set(key, kpiId);
  }

  return { ids, inserted, updated: entries.length - inserted };
}

async function addInitiatives(
  tx: Transaction,
  portIds: Map<string, number>,
  kpiIds: Map<KpiKey, number>,
) {
  let inserted = 0;

  for (const { port, kpi, initiative, initiative_url } of initiatives) {
    const row = {
      port_id: portIds.get(port)!,
      kpi_id: kpiIds.get(kpi)!,
      initiative,
      initiative_url,
    };

    const [existing] = await tx
      .select({ initiative_id: portGreenInitiatives.initiative_id })
      .from(portGreenInitiatives)
      .where(
        and(
          eq(portGreenInitiatives.port_id, row.port_id),
          eq(portGreenInitiatives.kpi_id, row.kpi_id),
          eq(portGreenInitiatives.initiative, row.initiative),
        ),
      )
      .limit(1);

    if (!existing) {
      await tx.insert(portGreenInitiatives).values(row);
      inserted++;
    }
  }

  return { inserted, skipped: initiatives.length - inserted };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const summary = await db.transaction(async (tx) => {
    const ports = await upsertPorts(tx);
    const kpiResult = await upsertKpis(tx);
    const initiativeResult = await addInitiatives(tx, ports.ids, kpiResult.ids);
    return {
      ports: { inserted: ports.inserted, updated: ports.updated },
      kpis: { inserted: kpiResult.inserted, updated: kpiResult.updated },
      initiatives: initiativeResult,
    };
  });

  console.table(summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
