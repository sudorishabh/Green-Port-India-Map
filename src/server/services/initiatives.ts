import "server-only";
import { and, eq } from "drizzle-orm";
import { kpiErrorCodes } from "@/lib/error-codes";
import type { InitiativeInput } from "@/lib/schemas/initiative";
import { db } from "@/server/db";
import { portGreenInitiatives } from "@/server/db/schema";
import { AppError } from "@/server/errors";

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

/** An unknown KPI or port fails the foreign key, which the API reports as a 404. */
export async function addInitiative(
  kpiId: number,
  portId: number,
  input: InitiativeInput,
) {
  await db
    .insert(portGreenInitiatives)
    .values({ ...input, kpi_id: kpiId, port_id: portId });
}

export async function updateInitiative(
  initiativeId: number,
  input: InitiativeInput,
) {
  const updated = await db
    .update(portGreenInitiatives)
    .set(input)
    .where(eq(portGreenInitiatives.initiative_id, initiativeId))
    .returning({ initiative_id: portGreenInitiatives.initiative_id });
  if (updated.length === 0) throw initiativeNotFound();
}

export async function deleteInitiative(initiativeId: number) {
  const deleted = await db
    .delete(portGreenInitiatives)
    .where(eq(portGreenInitiatives.initiative_id, initiativeId))
    .returning({ initiative_id: portGreenInitiatives.initiative_id });
  if (deleted.length === 0) throw initiativeNotFound();
}

function initiativeNotFound() {
  return new AppError(
    kpiErrorCodes.INVALID_INITIATIVE_ID,
    404,
    "Initiative not found",
  );
}
