import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { portMaster } from "@/server/db/schema";
import { getDownloadUrl } from "@/server/s3";

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
