import { NextFunction, Request, Response } from "express";
import { portMaster } from "../drizzle/schema";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import AppError from "../utils/AppError";
import { getObjectUrl } from "../helper/s3-files.helper";
import { CatchAsync } from "../utils/CatchAync";
import { portErrorCodes } from "../utils/errorCodes";
// Get all ports
export const getPorts = CatchAsync(async (req: Request, res: Response) => {
  const result = await db.select().from(portMaster);
  const portsWithImages = await Promise.all(
    result.map(async (port) => {
      const image = await getObjectUrl(port.image_s3_name, "image");
      const flag = await getObjectUrl(port.flag_s3_name, "image");
      return { ...port, image_url: image, flag_url: flag };
    })
  );
  res.status(200).json({ data: portsWithImages });
});

// Get a port by ID
export const getPort = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    throw new AppError(portErrorCodes.INVALID_PORT_ID, 400);
  }
  const result = await db
    .select()
    .from(portMaster)
    .where(eq(portMaster.port_id, Number(id)));

  res.status(200).json({
    data: result[0],
  });
});

// Create a new port
export const createPort = CatchAsync(async (req: Request, res: Response) => {
  const portData = req.body;
  console.log(portData);
  const isPortExists = await db
    .select()
    .from(portMaster)
    .where(eq(portMaster.name, portData.name));

  if (isPortExists.length > 0) {
    throw new AppError(portErrorCodes.PORT_ALREADY_EXISTS, 400);
  }

  await db.insert(portMaster).values({
    ...portData,
  });

  res.status(201).json({
    message: "Port created successfully",
  });
});

// Update an existing port
export const updatePort = CatchAsync(async (req: Request, res: Response) => {
  const portId = parseInt(req.params.id, 10);
  const portData = req.body;

  if (isNaN(portId)) {
    throw new AppError(portErrorCodes.INVALID_PORT_ID, 400);
  }

  await db
    .update(portMaster)
    .set({
      ...portData,
    })
    .where(eq(portMaster.port_id, portId));

  res.status(200).json({
    message: "Port updated successfully",
  });
});

// Delete a port
export const deletePort = CatchAsync(async (req: Request, res: Response) => {
  const portId = parseInt(req.params.id, 10);

  if (isNaN(portId)) {
    throw new AppError(portErrorCodes.INVALID_PORT_ID, 400);
  }

  await db.delete(portMaster).where(eq(portMaster.port_id, portId));

  res.status(200).json({
    message: "Port deleted successfully",
  });
});
