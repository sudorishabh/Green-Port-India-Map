import { apiRoute, readJson } from "@/server/http";
import { parseCredentials, registerUser } from "@/server/services/users";
import { requireUser } from "@/server/session";

/** There is no public sign-up: only signed-in users can add accounts. */
export const POST = apiRoute(async (request) => {
  await requireUser();
  await registerUser(parseCredentials(await readJson(request)));
  return Response.json({ success: true }, { status: 201 });
});
