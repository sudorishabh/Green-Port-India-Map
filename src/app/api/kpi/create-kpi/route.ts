import { apiRoute, readJson } from "@/server/http";
import { createKpi, type KpiInput } from "@/server/services/kpis";
import { requireUser } from "@/server/session";

export const POST = apiRoute(async (request) => {
  await requireUser();
  await createKpi(await readJson<KpiInput>(request));
  return Response.json({ message: "KPI created successfully" }, { status: 201 });
});
