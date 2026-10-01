import { apiRoute } from "@/server/http";
import { getDownloadUrl, parseFileName } from "@/server/s3";

/** GET /api/s3/file-url?fileName=&fileType= */
export const GET = apiRoute(async (request) => {
  const { searchParams } = request.nextUrl;
  const fileName = parseFileName(searchParams.get("fileName"));
  const fileType = searchParams.get("fileType") ?? undefined;

  const url = await getDownloadUrl(fileName, fileType);
  return Response.json({ success: true, url });
});
