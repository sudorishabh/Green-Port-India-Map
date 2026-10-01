import { NextFunction, Request, Response } from "express";
import {
  putObject,
  deleteObject,
  getObjectUrl,
} from "../helper/s3-files.helper";

export const getUploadUrl = async (req: Request, res: Response) => {
  const { fileName, fileType } = req.body;
  const uploadUrl = await putObject(fileName, fileType);
  res.json({ success: true, uploadUrl });
};

export const getFileUrl = async (req: Request, res: Response) => {
  const { fileName, fileType } = req.query;
  const url = await getObjectUrl(fileName as string, fileType as string);
  res.json({ success: true, url });
};

export const deleteFileUrl = async (req: Request, res: Response) => {
  const { fileName } = req.body;
  await deleteObject(fileName);
  res.json({ success: true });
};
