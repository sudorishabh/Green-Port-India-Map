import { kpiErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId } from "@/server/http";
import { deleteInitiative } from "@/server/services/initiatives";
import { requireUser } from "@/server/session";

export const DELETE = apiRoute(
  async (
    _request,
    { params }: RouteContext<"/api/kpi/delete-initiative/[initiative_id]">,
  ) => {
    await requireUser();
    const initiativeId = parseId(
      (await params).initiative_id,
      kpiErrorCodes.INVALID_INITIATIVE_ID,
    );

    await deleteInitiative(initiativeId);
    return Response.json({ message: "Initiative deleted successfully" });
  },
);
