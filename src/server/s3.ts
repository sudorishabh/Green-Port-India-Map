import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3ErrorCodes } from "@/lib/error-codes";
import { AppError } from "./errors";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

const bucket = process.env.APP_AWS_S3_BUCKET_NAME;
const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY;

// Explicit keys are optional: without them the SDK uses its default
// credential chain (e.g. an IAM role on the host).
const s3 = new S3Client({
  region: process.env.APP_AWS_REGION,
  ...(accessKeyId &&
    secretAccessKey && { credentials: { accessKeyId, secretAccessKey } }),
});

/** Short-lived URL for reading a private object. */
export function getDownloadUrl(key: string, contentType?: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}

/** Short-lived URL the browser can PUT a file to directly. */
export function getUploadUrl(key: string, contentType?: string) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Validates an object key coming from a request. */
export function parseFileName(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(s3ErrorCodes.INVALID_FILE_NAME, 400);
  }
  return value;
}
