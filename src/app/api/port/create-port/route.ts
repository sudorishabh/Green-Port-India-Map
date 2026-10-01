import { apiRoute, readJson } from "@/server/http";
import { createPort, type PortInput } from "@/server/services/ports";
import { requireUser } from "@/server/session";

export const POST = apiRoute(async (request) => {
  await requireUser();
  await createPort(await readJson<PortInput>(request));
  return Response.json(
    { message: "Port created successfully" },
    { status: 201 },
  );
});
