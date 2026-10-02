import { z } from "zod";
import { isHttpUrl } from "@/lib/urls";

// Mirrors the port_green_initiatives table. Shared by the API and the portal's
// initiatives dialog.

export const initiativeSchema = z.object({
  initiative: z
    .string()
    .trim()
    .min(1, "Initiative name is required")
    .max(2000),
  initiative_url: z
    .string()
    .trim()
    .max(200)
    .refine(
      isHttpUrl,
      "Enter a valid source URL starting with http:// or https://",
    ),
});

export type InitiativeInput = z.output<typeof initiativeSchema>;
