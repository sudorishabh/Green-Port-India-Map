import { apiRoute } from "@/server/http";
import { endSession } from "@/server/session";

// POST, not GET, so a link or image on another site can't log users out.
export const POST = apiRoute(async () => {
  await endSession();
  return Response.json({ success: true, message: "Logged out successfully!" });
});
