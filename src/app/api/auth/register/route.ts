import { apiRoute, readJson } from "@/server/http";
import { parseCredentials, registerUser } from "@/server/services/users";

export const POST = apiRoute(async (request) => {
  await registerUser(parseCredentials(await readJson(request)));
  return Response.json({ success: true }, { status: 201 });
});
