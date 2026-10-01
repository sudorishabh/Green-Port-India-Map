import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../utils/s3";

// GET FILE URL
export async function getObjectUrl(fileName: string, fileType: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.APP_AWS_S3_BUCKET_NAME,
    Key: fileName,
    // ResponseContentDisposition: "inline",
    ResponseContentType: fileType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// PUT FILE URL
export async function putObject(fileName: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.APP_AWS_S3_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

export async function deleteObject(fileName: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.APP_AWS_S3_BUCKET_NAME,
    Key: fileName,
  });
  await s3Client.send(command);
}
