import { kpiErrorCodes } from "@/lib/error-codes";
import { kpiSchema } from "@/lib/schemas/kpi";
import { apiRoute, parseBody, parseId } from "@/server/http";
import { updateKpi } from "@/server/services/kpis";
import { requireUser } from "@/server/session";

export const POST = apiRoute(
  async (request, { params }: RouteContext<"/api/kpi/update-kpi/[id]">) => {
    await requireUser();
    const kpiId = parseId((await params).id, kpiErrorCodes.INVALID_KPI_ID);
    await updateKpi(
      kpiId,
      await parseBody(request, kpiSchema, kpiErrorCodes.KPI_INVALID_DATA),
    );
    return Response.json({ message: "KPI updated successfully" });
  },
);
