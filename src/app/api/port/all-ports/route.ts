import { apiRoute } from "@/server/http";
import { listPorts } from "@/server/services/ports";

export const GET = apiRoute(async () => {
  return Response.json({ data: await listPorts() });
});
