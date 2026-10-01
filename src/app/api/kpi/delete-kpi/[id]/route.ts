import { kpiErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId } from "@/server/http";
import { deleteKpi } from "@/server/services/kpis";
import { requireUser } from "@/server/session";

export const DELETE = apiRoute(
  async (_request, { params }: RouteContext<"/api/kpi/delete-kpi/[id]">) => {
    await requireUser();
    const kpiId = parseId((await params).id, kpiErrorCodes.INVALID_KPI_ID);
    await deleteKpi(kpiId);
    return Response.json({ message: "KPI deleted successfully" });
  },
);
