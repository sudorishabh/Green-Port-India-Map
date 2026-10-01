import { z } from "zod";
import { isHttpUrl } from "@/lib/urls";

// Mirrors the port_kpis and kpi_target_links tables. Shared by the API and the
// portal's KPI form.

export const TARGET_TYPES = ["National", "International"] as const;

const text = () => z.string().trim().max(500);

const requiredText = (label: string) =>
  text().min(1, `${label} is required`);

export const kpiTargetLinkSchema = z.object({
  // A plain string going in, so a new link in the form can start out empty.
  target_type: z
    .string()
    .pipe(z.enum(TARGET_TYPES, { error: "Choose National or International" })),
  link_url: text().refine(isHttpUrl, "Must be an http:// or https:// URL"),
});

/**
 * A KPI with its target links. When saving an existing KPI, leaving out
 * `kpi_target_links` keeps its links and `current_status` keeps its status.
 */
export const kpiSchema = z.object({
  kpi_category: requiredText("Category"),
  kpi: requiredText("KPI name"),
  kpi_international_target: requiredText("International target"),
  kpi_national_target: requiredText("National target"),
  current_status: text().nullable().optional(),
  kpi_target_links: z.array(kpiTargetLinkSchema).optional(),
});

export type KpiInput = z.output<typeof kpiSchema>;
