import { Request, Response } from "express";
import { db } from "../drizzle/db";
import AppError from "../utils/AppError";
import {
  kpiTargetsLinks,
  portGreenInitiatives,
  portKpis,
} from "../drizzle/schema";
import { and, eq, inArray, desc } from "drizzle-orm";
import { CatchAsync } from "../utils/CatchAync";
import { kpiErrorCodes } from "../utils/errorCodes";

export const allKpis = CatchAsync(async (req: Request, res: Response) => {
  const kpisData = await db.select().from(portKpis);
  const kpiIds = kpisData.map((kpi) => kpi.kpi_id);
  const allTargetLinks = await db
    .select()
    .from(kpiTargetsLinks)
    .where(inArray(kpiTargetsLinks.kpi_id, kpiIds));

  const kpisWithTargets = kpisData.map((kpiData) => {
    const kpiTargets = allTargetLinks.filter(
      (target) => target.kpi_id === kpiData.kpi_id
    );

    const nationalTargetsLinks = kpiTargets.filter(
      (t) => t.target_type === "National"
    );
    const internationalTargetsLinks = kpiTargets.filter(
      (t) => t.target_type === "International"
    );
    return {
      kpiData,
      targetsLinks: {
        national: nationalTargetsLinks,
        international: internationalTargetsLinks,
      },
    };
  });

  res.status(200).json({ data: kpisWithTargets });
});

export const getKpi = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    throw new AppError(kpiErrorCodes.INVALID_KPI_ID, 400);
  }

  const kpiData = await db
    .select()
    .from(portKpis)
    .where(eq(portKpis.kpi_id, Number(id)));

  // Fetch target links for this KPI
  const targetLinks = await db
    .select()
    .from(kpiTargetsLinks)
    .where(eq(kpiTargetsLinks.kpi_id, Number(id)));

  const nationalTargetsLinks = targetLinks.filter(
    (t) => t.target_type === "national"
  );
  const internationalTargetsLinks = targetLinks.filter(
    (t) => t.target_type === "international"
  );

  res.status(200).json({
    data: {
      kpiData: kpiData[0],
      targetsLinks: {
        national: nationalTargetsLinks,
        international: internationalTargetsLinks,
      },
    },
  });
});

export const getKpiInitiatives = CatchAsync(
  async (req: Request, res: Response) => {
    const portId = req.query.portId;
    const kpiId = req.query.kpiId;

    if (!portId || !kpiId) {
      throw new AppError(kpiErrorCodes.INVALID_KPI_ID, 400);
    }

    const result = await db
      .select()
      .from(portGreenInitiatives)
      .where(
        and(
          eq(portGreenInitiatives.port_id, Number(portId)),
          eq(portGreenInitiatives.kpi_id, Number(kpiId))
        )
      );

    res.status(200).json({
      data: result,
    });
  }
);

export const getInitiatives = CatchAsync(
  async (req: Request, res: Response) => {
    const portId = req.params.port_id;

    if (!portId || isNaN(Number(portId))) {
      throw new AppError(kpiErrorCodes.INVALID_PORT_ID, 400);
    }

    const result = await db
      .select()
      .from(portGreenInitiatives)
      .where(eq(portGreenInitiatives.port_id, Number(portId)));

    res.status(200).json({ data: result });
  }
);

// Update an existing KPI (core fields only)
export const updateKpi = CatchAsync(async (req: Request, res: Response) => {
  const kpiId = parseInt(req.params.id, 10);
  const {
    kpi_category,
    kpi,
    kpi_international_target,
    kpi_national_target,
    current_status,
    kpi_target_links,
  } = req.body;

  if (isNaN(kpiId)) {
    res.status(400).json({ message: "Invalid KPI ID" });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(portKpis)
      .set({
        kpi_category,
        kpi,
        kpi_international_target,
        kpi_national_target,
        current_status,
      })
      .where(eq(portKpis.kpi_id, kpiId));

    if (kpi_target_links) {
      await tx.delete(kpiTargetsLinks).where(eq(kpiTargetsLinks.kpi_id, kpiId));
      kpi_target_links.forEach(async (link: any) => {
        await tx.insert(kpiTargetsLinks).values({
          link_url: link.link_url,
          target_type: link.target_type,
          kpi_id: kpiId,
        });
      });
    }
  });

  res.status(200).json({ message: "KPI updated successfully" });
});

export const createKpi = CatchAsync(async (req: Request, res: Response) => {
  const {
    kpi_category,
    kpi,
    kpi_international_target,
    kpi_national_target,
    kpi_target_links,
  } = req.body;

  await db.transaction(async (tx) => {
    const result = await tx
      .insert(portKpis)
      .values({
        kpi_category,
        kpi,
        kpi_international_target,
        kpi_national_target,
      })
      .returning({
        kpi_id: portKpis.kpi_id,
      });

    await Promise.all(
      kpi_target_links.map(async (link: any) => {
        await tx.insert(kpiTargetsLinks).values({
          link_url: link.link_url,
          target_type: link.target_type,
          kpi_id: result[0].kpi_id,
        });
      })
    );
  });

  res.status(201).json({
    message: "KPI created successfully",
  });
});

export const deleteKpi = CatchAsync(async (req: Request, res: Response) => {
  const kpiId = parseInt(req.params.id, 10);
  if (isNaN(kpiId)) {
    throw new AppError(kpiErrorCodes.INVALID_KPI_ID, 400);
  }

  await db.transaction(async (tx) => {
    await tx.delete(portKpis).where(eq(portKpis.kpi_id, kpiId));
    const kpiLinks = await tx
      .select()
      .from(kpiTargetsLinks)
      .where(eq(kpiTargetsLinks.kpi_id, kpiId));

    await tx.delete(kpiTargetsLinks).where(
      inArray(
        kpiTargetsLinks.link_id,
        kpiLinks.map((link) => link.link_id)
      )
    );

    const kpiInitiatives = await tx
      .select()
      .from(portGreenInitiatives)
      .where(eq(portGreenInitiatives.kpi_id, kpiId));

    await tx.delete(portGreenInitiatives).where(
      inArray(
        portGreenInitiatives.initiative_id,
        kpiInitiatives.map((initiative) => initiative.initiative_id)
      )
    );
  });
  res.status(200).json({ message: "KPI deleted successfully" });
});

export const updateInitiative = CatchAsync(
  async (req: Request, res: Response) => {
    const initiativeId = parseInt(req.params.initiative_id, 10);
    const { initiative, initiative_url } = req.body;

    if (isNaN(initiativeId)) {
      throw new AppError(kpiErrorCodes.INVALID_INITIATIVE_ID, 400);
    }

    await db
      .update(portGreenInitiatives)
      .set({ initiative, initiative_url })
      .where(eq(portGreenInitiatives.initiative_id, initiativeId));

    res.status(200).json({
      message: "Initiative updated successfully",
    });
  }
);

export const addInitiativeToKpi = CatchAsync(
  async (req: Request, res: Response) => {
    const kpiId = parseInt(req.params.id, 10);
    const portId = parseInt(req.params.port_id, 10);
    const { initiative, initiative_url } = req.body;

    if (isNaN(kpiId)) {
      throw new AppError(kpiErrorCodes.INVALID_KPI_ID, 400);
    }
    await db.insert(portGreenInitiatives).values({
      initiative,
      kpi_id: kpiId,
      port_id: portId,
      initiative_url,
    });

    res.status(201).json({
      message: "Initiative added successfully",
    });
  }
);

export const deleteGreenInitiative = CatchAsync(
  async (req: Request, res: Response) => {
    const initiativeId = parseInt(req.params.initiative_id, 10);
    if (isNaN(initiativeId)) {
      throw new AppError(kpiErrorCodes.INVALID_INITIATIVE_ID, 400);
    }
    await db
      .delete(portGreenInitiatives)
      .where(eq(portGreenInitiatives.initiative_id, initiativeId));
    res.status(200).json({ message: "Initiative deleted successfully" });
  }
);
