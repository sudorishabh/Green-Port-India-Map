-- Fails if two ports already share a name. Find them with
--   SELECT name, count(*) FROM port_master GROUP BY name HAVING count(*) > 1;
-- and rename or delete the extras before migrating.
ALTER TABLE "port_master" ADD CONSTRAINT "port_master_name_unique" UNIQUE("name");