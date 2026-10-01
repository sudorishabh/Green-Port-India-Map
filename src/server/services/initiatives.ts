import "server-only";
import { and, eq } from "drizzle-orm";
import { kpiErrorCodes } from "@/lib/error-codes";
import { db } from "@/server/db";
import { portGreenInitiatives } from "@/server/db/schema";
import { parseHttpUrl } from "@/server/http";

export type InitiativeInput = Pick<
  typeof portGreenInitiatives.$inferInsert,
  "initiative" | "initiative_url"
>;

/** Green initiatives for a port, optionally narrowed to a single KPI. */
export async function listInitiatives(portId: number, kpiId?: number) {
  return db
    .select()
    .from(portGreenInitiatives)
    .where(
      and(
        eq(portGreenInitiatives.port_id, portId),
        kpiId === undefined ? undefined : eq(portGreenInitiatives.kpi_id, kpiId),
      ),
    );
}

export async function addInitiative(
  kpiId: number,
  portId: number,
  { initiative, initiative_url }: InitiativeInput,
) {
  await db.insert(portGreenInitiatives).values({
    initiative,
    initiative_url: parseHttpUrl(initiative_url, kpiErrorCodes.INVALID_URL),
    kpi_id: kpiId,
    port_id: portId,
  });
}

export async function updateInitiative(
  initiativeId: number,
  { initiative, initiative_url }: InitiativeInput,
) {
  await db
    .update(portGreenInitiatives)
    .set({
      initiative,
      initiative_url: parseHttpUrl(initiative_url, kpiErrorCodes.INVALID_URL),
    })
    .where(eq(portGreenInitiatives.initiative_id, initiativeId));
}

export async function deleteInitiative(initiativeId: number) {
  await db
    .delete(portGreenInitiatives)
    .where(eq(portGreenInitiatives.initiative_id, initiativeId));
}
