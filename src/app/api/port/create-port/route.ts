import { portErrorCodes } from "@/lib/error-codes";
import { portSchema } from "@/lib/schemas/port";
import { apiRoute, parseBody } from "@/server/http";
import { createPort } from "@/server/services/ports";
import { requireUser } from "@/server/session";

export const POST = apiRoute(async (request) => {
  await requireUser();
  await createPort(
    await parseBody(request, portSchema, portErrorCodes.INVALID_PORT_DATA),
  );
  return Response.json(
    { message: "Port created successfully" },
    { status: 201 },
  );
});
