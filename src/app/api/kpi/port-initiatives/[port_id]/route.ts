import { kpiErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId } from "@/server/http";
import { listInitiatives } from "@/server/services/initiatives";

export const GET = apiRoute(
  async (
    _request,
    { params }: RouteContext<"/api/kpi/port-initiatives/[port_id]">,
  ) => {
    const portId = parseId(
      (await params).port_id,
      kpiErrorCodes.INVALID_PORT_ID,
    );
    return Response.json({ data: await listInitiatives(portId) });
  },
);
