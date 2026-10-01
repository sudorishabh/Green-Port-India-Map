import { kpiErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId, readJson } from "@/server/http";
import {
  updateInitiative,
  type InitiativeInput,
} from "@/server/services/initiatives";
import { requireUser } from "@/server/session";

export const POST = apiRoute(
  async (
    request,
    { params }: RouteContext<"/api/kpi/update-initiative/[initiative_id]">,
  ) => {
    await requireUser();
    const initiativeId = parseId(
      (await params).initiative_id,
      kpiErrorCodes.INVALID_INITIATIVE_ID,
    );

    await updateInitiative(
      initiativeId,
      await readJson<InitiativeInput>(request),
    );
    return Response.json({ message: "Initiative updated successfully" });
  },
);
