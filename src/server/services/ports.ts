import "server-only";
import { eq, getTableColumns } from "drizzle-orm";
import { portErrorCodes } from "@/lib/error-codes";
import { db } from "@/server/db";
import { portMaster } from "@/server/db/schema";
import { AppError } from "@/server/errors";

export type PortInput = Omit<
  typeof portMaster.$inferInsert,
  "port_id" | "created_at"
>;

/** Columns clients may write. The id and creation time belong to the database. */
const EDITABLE_PORT_FIELDS = Object.keys(getTableColumns(portMaster)).filter(
  (field) => field !== "port_id" && field !== "created_at",
) as (keyof PortInput)[];

/** Placeholder pictures in public/ports, spread across ports by id. */
const PORT_PICTURE_COUNT = 6;

/** Countries with a flag in public/flags, named by slug. */
const FLAG_COUNTRIES = new Set([
  "belgium",
  "china",
  "germany",
  "india",
  "netherlands",
  "nigeria",
  "qatar",
  "saudi-arabia",
  "singapore",
  "south-africa",
  "south-korea",
  "sweden",
  "united-arab-emirates",
  "united-states",
]);

function getImageUrl(portId: number) {
  return `/ports/port-${(portId % PORT_PICTURE_COUNT) + 1}.svg`;
}

/** Flag for the port's country, or null when there is no flag file for it. */
function getFlagUrl(country: string) {
  const slug = country.trim().toLowerCase().replace(/\s+/g, "-");
  return FLAG_COUNTRIES.has(slug) ? `/flags/${slug}.png` : null;
}

/** All ports, each with its picture and country flag. */
export async function listPorts() {
  const ports = await db.select().from(portMaster);
  return ports.map((port) => ({
    ...port,
    image_url: getImageUrl(port.port_id),
    flag_url: getFlagUrl(port.country),
  }));
}

export async function getPort(portId: number) {
  const [port] = await db
    .select()
    .from(portMaster)
    .where(eq(portMaster.port_id, portId));
  return port;
}

export async function createPort(input: PortInput) {
  if (typeof input?.name !== "string" || !input.name.trim()) {
    throw new AppError(portErrorCodes.INVALID_PORT_DATA, 400);
  }

  const [existing] = await db
    .select({ port_id: portMaster.port_id })
    .from(portMaster)
    .where(eq(portMaster.name, input.name))
    .limit(1);
  if (existing) throw new AppError(portErrorCodes.PORT_ALREADY_EXISTS, 400);

  await db.insert(portMaster).values(pickPortFields(input));
}

export async function updatePort(portId: number, input: Partial<PortInput>) {
  const fields = pickPortFields(input);
  if (Object.keys(fields).length === 0) {
    throw new AppError(portErrorCodes.INVALID_PORT_DATA, 400);
  }

  await db.update(portMaster).set(fields).where(eq(portMaster.port_id, portId));
}

export async function deletePort(portId: number) {
  await db.delete(portMaster).where(eq(portMaster.port_id, portId));
}

/** Copies the editable columns out of a request body, dropping everything else. */
function pickPortFields(input: Partial<PortInput>): PortInput {
  return Object.fromEntries(
    EDITABLE_PORT_FIELDS.filter((field) => input?.[field] !== undefined).map(
      (field) => [field, input[field]],
    ),
  );
}
