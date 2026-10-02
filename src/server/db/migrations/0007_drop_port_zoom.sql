-- The map now frames a selected port's routes itself, so the view hand-tuned
-- for each hub (zoom level and centre) is no longer used.
ALTER TABLE "port_master" DROP COLUMN "zoom";--> statement-breakpoint
ALTER TABLE "port_master" DROP COLUMN "zoom_center_lat";--> statement-breakpoint
ALTER TABLE "port_master" DROP COLUMN "zoom_center_lng";