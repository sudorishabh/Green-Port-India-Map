import { kpiErrorCodes } from "@/lib/error-codes";
import { kpiSchema } from "@/lib/schemas/kpi";
import { apiRoute, parseBody } from "@/server/http";
import { createKpi } from "@/server/services/kpis";
import { requireUser } from "@/server/session";

export const POST = apiRoute(async (request) => {
  await requireUser();
  await createKpi(
    await parseBody(request, kpiSchema, kpiErrorCodes.KPI_INVALID_DATA),
  );
  return Response.json({ message: "KPI created successfully" }, { status: 201 });
});
