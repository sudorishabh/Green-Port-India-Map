import { kpiErrorCodes } from "@/lib/error-codes";
import { initiativeSchema } from "@/lib/schemas/initiative";
import { apiRoute, parseBody, parseId } from "@/server/http";
import { updateInitiative } from "@/server/services/initiatives";
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
      await parseBody(
        request,
        initiativeSchema,
        kpiErrorCodes.INVALID_INITIATIVE_DATA,
      ),
    );
    return Response.json({ message: "Initiative updated successfully" });
  },
);
