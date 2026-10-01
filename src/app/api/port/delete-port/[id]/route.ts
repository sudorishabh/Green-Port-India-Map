import { portErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId } from "@/server/http";
import { deletePort } from "@/server/services/ports";
import { requireUser } from "@/server/session";

export const DELETE = apiRoute(
  async (_request, { params }: RouteContext<"/api/port/delete-port/[id]">) => {
    await requireUser();
    const portId = parseId((await params).id, portErrorCodes.INVALID_PORT_ID);
    await deletePort(portId);
    return Response.json({ message: "Port deleted successfully" });
  },
);
