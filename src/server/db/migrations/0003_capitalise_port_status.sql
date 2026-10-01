ALTER TABLE "port_master" ALTER COLUMN "status" SET DEFAULT 'Active';--> statement-breakpoint
-- Ports created without a status got the old lowercase default, which the portal shows as inactive.
UPDATE "port_master" SET "status" = 'Active' WHERE lower("status") = 'active';--> statement-breakpoint
UPDATE "port_master" SET "status" = 'Inactive' WHERE lower("status") = 'inactive';