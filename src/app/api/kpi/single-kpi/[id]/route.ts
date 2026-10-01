import { kpiErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId } from "@/server/http";
import { getKpi } from "@/server/services/kpis";

export const GET = apiRoute(
  async (_request, { params }: RouteContext<"/api/kpi/single-kpi/[id]">) => {
    const kpiId = parseId((await params).id, kpiErrorCodes.INVALID_KPI_ID);
    return Response.json({ data: await getKpi(kpiId) });
  },
);
