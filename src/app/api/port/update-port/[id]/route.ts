import { portErrorCodes } from "@/lib/error-codes";
import { portUpdateSchema } from "@/lib/schemas/port";
import { apiRoute, parseBody, parseId } from "@/server/http";
import { updatePort } from "@/server/services/ports";
import { requireUser } from "@/server/session";

export const POST = apiRoute(
  async (request, { params }: RouteContext<"/api/port/update-port/[id]">) => {
    await requireUser();
    const portId = parseId((await params).id, portErrorCodes.INVALID_PORT_ID);
    await updatePort(
      portId,
      await parseBody(
        request,
        portUpdateSchema,
        portErrorCodes.INVALID_PORT_DATA,
      ),
    );
    return Response.json({ message: "Port updated successfully" });
  },
);
