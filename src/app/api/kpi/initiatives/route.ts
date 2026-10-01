import { kpiErrorCodes } from "@/lib/error-codes";
import { apiRoute, parseId } from "@/server/http";
import { listInitiatives } from "@/server/services/initiatives";

/** GET /api/kpi/initiatives?portId=&kpiId= */
export const GET = apiRoute(async (request) => {
  const { searchParams } = request.nextUrl;
  const portId = parseId(
    searchParams.get("portId"),
    kpiErrorCodes.INVALID_PORT_ID,
  );
  const kpiId = parseId(
    searchParams.get("kpiId"),
    kpiErrorCodes.INVALID_KPI_ID,
  );
  return Response.json({ data: await listInitiatives(portId, kpiId) });
});
