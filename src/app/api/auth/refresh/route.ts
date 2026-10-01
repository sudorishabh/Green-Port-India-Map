import { apiRoute } from "@/server/http";
import { refreshSession } from "@/server/session";

export const GET = apiRoute(async () => {
  const user = await refreshSession();
  return Response.json({ success: true, user });
});
