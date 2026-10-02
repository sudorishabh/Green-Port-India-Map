import "server-only";
import { eq } from "drizzle-orm";
import { kpiErrorCodes } from "@/lib/error-codes";
import type { KpiInput } from "@/lib/schemas/kpi";
import { db } from "@/server/db";
import { kpiTargetsLinks, portKpis } from "@/server/db/schema";
import { AppError } from "@/server/errors";

type TargetLink = typeof kpiTargetsLinks.$inferSelect;

/** Every KPI with its target links grouped as `{ national, international }`. */
export async function listKpis() {
  const [kpis, links] = await Promise.all([
    db.select().from(portKpis),
    db.select().from(kpiTargetsLinks),
  ]);

  return kpis.map((kpiData) => ({
    kpiData,
    targetsLinks: groupTargetLinks(
      links.filter((link) => link.kpi_id === kpiData.kpi_id),
    ),
  }));
}

export async function getKpi(kpiId: number) {
  const [[kpiData], links] = await Promise.all([
    db.select().from(portKpis).where(eq(portKpis.kpi_id, kpiId)),
    db.select().from(kpiTargetsLinks).where(eq(kpiTargetsLinks.kpi_id, kpiId)),
  ]);
  if (!kpiData) throw kpiNotFound();
  return { kpiData, targetsLinks: groupTargetLinks(links) };
}

export async function createKpi({ kpi_target_links, ...fields }: KpiInput) {
  await db.transaction(async (tx) => {
    const [{ kpi_id }] = await tx
      .insert(portKpis)
      .values(fields)
      .returning({ kpi_id: portKpis.kpi_id });

    const links = toLinkRows(kpi_id, kpi_target_links);
    if (links.length > 0) await tx.insert(kpiTargetsLinks).values(links);
  });
}

/** Updates the KPI; target links are replaced wholesale when provided. */
export async function updateKpi(
  kpiId: number,
  { kpi_target_links, ...fields }: KpiInput,
) {
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(portKpis)
      .set(fields)
      .where(eq(portKpis.kpi_id, kpiId))
      .returning({ kpi_id: portKpis.kpi_id });
    if (updated.length === 0) throw kpiNotFound();

    if (kpi_target_links) {
      await tx
        .delete(kpiTargetsLinks)
        .where(eq(kpiTargetsLinks.kpi_id, kpiId));

      const links = toLinkRows(kpiId, kpi_target_links);
      if (links.length > 0) await tx.insert(kpiTargetsLinks).values(links);
    }
  });
}

/** Target links and port initiatives go with it via ON DELETE CASCADE. */
export async function deleteKpi(kpiId: number) {
  const deleted = await db
    .delete(portKpis)
    .where(eq(portKpis.kpi_id, kpiId))
    .returning({ kpi_id: portKpis.kpi_id });
  if (deleted.length === 0) throw kpiNotFound();
}

function kpiNotFound() {
  return new AppError(kpiErrorCodes.INVALID_KPI_ID, 404, "KPI not found");
}

function groupTargetLinks(links: TargetLink[]) {
  return {
    national: links.filter((link) => link.target_type === "National"),
    international: links.filter(
      (link) => link.target_type === "International",
    ),
  };
}

function toLinkRows(kpiId: number, links: KpiInput["kpi_target_links"] = []) {
  return links.map((link) => ({ ...link, kpi_id: kpiId }));
}
