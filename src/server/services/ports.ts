import "server-only";
import { eq } from "drizzle-orm";
import { portErrorCodes } from "@/lib/error-codes";
import type { PortInput, PortUpdate } from "@/lib/schemas/port";
import { db } from "@/server/db";
import { portMaster } from "@/server/db/schema";
import {
  AppError,
  getPostgresErrorCode,
  UNIQUE_VIOLATION,
} from "@/server/errors";

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
  if (!port) throw portNotFound();
  return port;
}

export async function createPort(input: PortInput) {
  await withUniqueName(db.insert(portMaster).values(input));
}

export async function updatePort(portId: number, input: PortUpdate) {
  if (Object.values(input).every((value) => value === undefined)) {
    throw new AppError(
      portErrorCodes.INVALID_PORT_DATA,
      400,
      "No port fields to update",
    );
  }

  const updated = await withUniqueName(
    db
      .update(portMaster)
      .set(input)
      .where(eq(portMaster.port_id, portId))
      .returning({ port_id: portMaster.port_id }),
  );
  if (updated.length === 0) throw portNotFound();
}

export async function deletePort(portId: number) {
  const deleted = await db
    .delete(portMaster)
    .where(eq(portMaster.port_id, portId))
    .returning({ port_id: portMaster.port_id });
  if (deleted.length === 0) throw portNotFound();
}

function portNotFound() {
  return new AppError(portErrorCodes.INVALID_PORT_ID, 404, "Port not found");
}

/**
 * Runs a port write, reporting a clash with the unique port name as
 * PORT_ALREADY_EXISTS. The database does the check, so two requests creating
 * or renaming to the same name at once can't both succeed.
 */
async function withUniqueName<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if (getPostgresErrorCode(error) === UNIQUE_VIOLATION) {
      throw new AppError(
        portErrorCodes.PORT_ALREADY_EXISTS,
        409,
        "A port with this name already exists",
      );
    }
    throw error;
  }
}
