import { kpiErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId, readJson } from "@/server/http";
import { updateKpi, type KpiInput } from "@/server/services/kpis";
import { requireUser } from "@/server/session";

export const POST = apiRoute(
  async (request, { params }: RouteContext<"/api/kpi/update-kpi/[id]">) => {
    await requireUser();
    const kpiId = parseId((await params).id, kpiErrorCodes.INVALID_KPI_ID);
    await updateKpi(kpiId, await readJson<KpiInput>(request));
    return Response.json({ message: "KPI updated successfully" });
  },
);
