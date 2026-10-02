ALTER TABLE "port_master" ALTER COLUMN "port_capacity" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "port_master" ALTER COLUMN "port_capacity" SET DEFAULT '0';