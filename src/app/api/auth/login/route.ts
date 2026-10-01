import { apiRoute, readJson } from "@/server/http";
import { authenticateUser, parseCredentials } from "@/server/services/users";
import { startSession } from "@/server/session";

export const POST = apiRoute(async (request) => {
  const user = await authenticateUser(
    parseCredentials(await readJson(request)),
  );
  await startSession(user);

  return Response.json({
    success: true,
    message: "Logged in successfully!",
    user,
  });
});
