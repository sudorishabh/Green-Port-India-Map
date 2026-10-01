import { apiRoute } from "@/server/http";
import { listKpis } from "@/server/services/kpis";

export const GET = apiRoute(async () => {
  return Response.json({ data: await listKpis() });
});
