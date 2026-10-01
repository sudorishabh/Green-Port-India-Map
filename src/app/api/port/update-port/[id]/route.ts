import { portErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId, readJson } from "@/server/http";
import { updatePort, type PortInput } from "@/server/services/ports";
import { requireUser } from "@/server/session";

export const POST = apiRoute(
  async (request, { params }: RouteContext<"/api/port/update-port/[id]">) => {
    await requireUser();
    const portId = parseId((await params).id, portErrorCodes.INVALID_PORT_ID);
    await updatePort(portId, await readJson<Partial<PortInput>>(request));
    return Response.json({ message: "Port updated successfully" });
  },
);
