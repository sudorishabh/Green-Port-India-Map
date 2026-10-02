import { kpiErrorCodes } from "@/lib/error-codes";
import { initiativeSchema } from "@/lib/schemas/initiative";
import { apiRoute, parseBody, parseId } from "@/server/http";
import { addInitiative } from "@/server/services/initiatives";
import { requireUser } from "@/server/session";

/** POST /api/kpi/initiatives/:kpiId/:portId */
export const POST = apiRoute(
  async (
    request,
    { params }: RouteContext<"/api/kpi/initiatives/[id]/[port_id]">,
  ) => {
    await requireUser();
    const { id, port_id } = await params;
    const kpiId = parseId(id, kpiErrorCodes.INVALID_KPI_ID);
    const portId = parseId(port_id, kpiErrorCodes.INVALID_PORT_ID);

    await addInitiative(
      kpiId,
      portId,
      await parseBody(
        request,
        initiativeSchema,
        kpiErrorCodes.INVALID_INITIATIVE_DATA,
      ),
    );
    return Response.json(
      { message: "Initiative added successfully" },
      { status: 201 },
    );
  },
);
