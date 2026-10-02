-- The portal form sent portLocationType, which the API ignored, so every port it
-- created got the 'Indian' default. The portal tells ports apart by country.
UPDATE "port_master"
SET "port_location_type" = 'Other'
WHERE "country" <> 'India' AND "port_location_type" = 'Indian';
