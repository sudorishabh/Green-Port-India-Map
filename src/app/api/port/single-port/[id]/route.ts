import { portErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId } from "@/server/http";
import { getPort } from "@/server/services/ports";

export const GET = apiRoute(
  async (_request, { params }: RouteContext<"/api/port/single-port/[id]">) => {
    const portId = parseId((await params).id, portErrorCodes.INVALID_PORT_ID);
    return Response.json({ data: await getPort(portId) });
  },
);
