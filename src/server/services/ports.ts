import "server-only";
import { eq } from "drizzle-orm";
import { portErrorCodes } from "@/lib/error-codes";
import { db } from "@/server/db";
import { portMaster } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import { getDownloadUrl } from "@/server/s3";

export type PortInput = Omit<
  typeof portMaster.$inferInsert,
  "port_id" | "created_at"
>;

/** All ports, each with short-lived signed URLs for its image and flag. */
export async function listPorts() {
  const ports = await db.select().from(portMaster);
  return Promise.all(
    ports.map(async (port) => ({
      ...port,
      image_url: await getDownloadUrl(port.image_s3_name, "image"),
      flag_url: await getDownloadUrl(port.flag_s3_name, "image"),
    })),
  );
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

  await db.insert(portMaster).values(input);
}

export async function updatePort(portId: number, input: Partial<PortInput>) {
  await db.update(portMaster).set(input).where(eq(portMaster.port_id, portId));
}

export async function deletePort(portId: number) {
  await db.delete(portMaster).where(eq(portMaster.port_id, portId));
}
