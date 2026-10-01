import { apiRoute } from "@/server/http";
import { endSession } from "@/server/session";

export const GET = apiRoute(async () => {
  await endSession();
  return Response.json({ success: true, message: "Logged out successfully!" });
});
