CREATE TABLE "kpi_target_links" (
	"link_id" serial PRIMARY KEY NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"link_url" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"kpi_id" integer
);
--> statement-breakpoint
CREATE TABLE "port_green_initiatives" (
	"initiative_id" serial PRIMARY KEY NOT NULL,
	"initiative" text NOT NULL,
	"initiative_url" varchar(200) NOT NULL,
	"kpi" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"kpi_id" integer,
	"portId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "port_kpis" (
	"kpi_id" serial PRIMARY KEY NOT NULL,
	"kpi_category" varchar(500) NOT NULL,
	"kpi" varchar(500) NOT NULL,
	"kpi_international_target" varchar(500) NOT NULL,
	"kpi_national_target" varchar(500) NOT NULL,
	"current_status" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "port_master" (
	"port_id" serial PRIMARY KEY NOT NULL,
	"port_location_type" varchar(100) DEFAULT 'Indian' NOT NULL,
	"name" varchar(100) DEFAULT '' NOT NULL,
	"country" varchar(100) DEFAULT '' NOT NULL,
	"city" varchar(100) DEFAULT '' NOT NULL,
	"image_s3_name" varchar(200) DEFAULT '' NOT NULL,
	"flag_s3_name" varchar(200) DEFAULT '' NOT NULL,
	"number_of_berths" integer DEFAULT 0 NOT NULL,
	"port_type" varchar(100) DEFAULT '' NOT NULL,
	"average_tat" integer DEFAULT 0 NOT NULL,
	"port_capacity" integer DEFAULT 0 NOT NULL,
	"dominant_cargo" varchar(200) DEFAULT '' NOT NULL,
	"lat" numeric(6, 3) DEFAULT '0.000' NOT NULL,
	"lng" numeric(6, 3) DEFAULT '0.000' NOT NULL,
	"status" varchar(10) DEFAULT 'active' NOT NULL,
	"ind_port_name" varchar(100) DEFAULT '',
	"ind_port_lat" numeric(6, 3) DEFAULT '0.000',
	"ind_port_lng" numeric(6, 3) DEFAULT '0.000',
	"polyline_curve" integer DEFAULT 4 NOT NULL,
	"zoom" integer DEFAULT 3 NOT NULL,
	"polyline_color" varchar(100) DEFAULT '#000000' NOT NULL,
	"zoom_center_lat" numeric(6, 3) DEFAULT '5.6' NOT NULL,
	"zoom_center_lng" numeric(6, 3) DEFAULT '5.6' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "kpi_target_links" ADD CONSTRAINT "kpi_target_links_kpi_id_port_kpis_kpi_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."port_kpis"("kpi_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "port_green_initiatives" ADD CONSTRAINT "port_green_initiatives_kpi_id_port_kpis_kpi_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."port_kpis"("kpi_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "port_green_initiatives" ADD CONSTRAINT "port_green_initiatives_portId_port_master_port_id_fk" FOREIGN KEY ("portId") REFERENCES "public"."port_master"("port_id") ON DELETE cascade ON UPDATE no action;