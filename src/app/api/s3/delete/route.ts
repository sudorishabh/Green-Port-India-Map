import { apiRoute, readJson } from "@/server/http";
import { deleteObject, parseFileName } from "@/server/s3";
import { requireUser } from "@/server/session";

export const DELETE = apiRoute(async (request) => {
  await requireUser();
  const { fileName } = await readJson<{ fileName?: string }>(request);

  await deleteObject(parseFileName(fileName));
  return Response.json({ success: true });
});
