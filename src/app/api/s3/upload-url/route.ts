import { apiRoute, readJson } from "@/server/http";
import { getUploadUrl, parseFileName } from "@/server/s3";
import { requireUser } from "@/server/session";

export const POST = apiRoute(async (request) => {
  await requireUser();
  const { fileName, fileType } = await readJson<{
    fileName?: string;
    fileType?: string;
  }>(request);

  const uploadUrl = await getUploadUrl(parseFileName(fileName), fileType);
  return Response.json({ success: true, uploadUrl });
});
