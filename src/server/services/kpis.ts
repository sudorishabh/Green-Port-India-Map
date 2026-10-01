import "server-only";
import { eq } from "drizzle-orm";
import { kpiErrorCodes } from "@/lib/error-codes";
import { db } from "@/server/db";
import { kpiTargetsLinks, portKpis } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import { parseHttpUrl } from "@/server/http";

type TargetLink = typeof kpiTargetsLinks.$inferSelect;

export interface KpiInput {
  kpi_category: string;
  kpi: string;
  kpi_international_target: string;
  kpi_national_target: string;
  current_status?: string | null;
  kpi_target_links?: Pick<TargetLink, "link_url" | "target_type">[];
}

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
  return { kpiData, targetsLinks: groupTargetLinks(links) };
}

export async function createKpi(input: KpiInput) {
  const fields = pickKpiFields(input);
  if (Object.values(fields).some((value) => typeof value !== "string")) {
    throw new AppError(kpiErrorCodes.KPI_INVALID_DATA, 400);
  }

  await db.transaction(async (tx) => {
    const [{ kpi_id }] = await tx
      .insert(portKpis)
      .values(fields)
      .returning({ kpi_id: portKpis.kpi_id });

    const links = toLinkRows(kpi_id, input.kpi_target_links);
    if (links.length > 0) await tx.insert(kpiTargetsLinks).values(links);
  });
}

/** Updates the KPI; target links are replaced wholesale when provided. */
export async function updateKpi(kpiId: number, input: KpiInput) {
  await db.transaction(async (tx) => {
    await tx
      .update(portKpis)
      .set({ ...pickKpiFields(input), current_status: input.current_status })
      .where(eq(portKpis.kpi_id, kpiId));

    if (input.kpi_target_links) {
      await tx
        .delete(kpiTargetsLinks)
        .where(eq(kpiTargetsLinks.kpi_id, kpiId));

      const links = toLinkRows(kpiId, input.kpi_target_links);
      if (links.length > 0) await tx.insert(kpiTargetsLinks).values(links);
    }
  });
}

/** Target links and port initiatives go with it via ON DELETE CASCADE. */
export async function deleteKpi(kpiId: number) {
  await db.delete(portKpis).where(eq(portKpis.kpi_id, kpiId));
}

function groupTargetLinks(links: TargetLink[]) {
  return {
    national: links.filter((link) => link.target_type === "National"),
    international: links.filter(
      (link) => link.target_type === "International",
    ),
  };
}

function pickKpiFields({
  kpi_category,
  kpi,
  kpi_international_target,
  kpi_national_target,
}: KpiInput) {
  return { kpi_category, kpi, kpi_international_target, kpi_national_target };
}

/** Called inside the KPI's transaction, so an invalid URL rolls back the whole write. */
function toLinkRows(kpiId: number, links: KpiInput["kpi_target_links"] = []) {
  return links.map(({ link_url, target_type }) => ({
    link_url: parseHttpUrl(link_url, kpiErrorCodes.INVALID_URL),
    target_type,
    kpi_id: kpiId,
  }));
}
