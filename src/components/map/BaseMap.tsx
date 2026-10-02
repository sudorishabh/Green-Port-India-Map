import { useEffect } from "react";
import * as L from "leaflet";
import { extendLeaflet } from "@india-boundary-corrector/leaflet-layer";
import { TileLayer, useMap } from "react-leaflet";

extendLeaflet(L);

export type MapType = "map" | "satellite";

const MAX_ZOOM = 19;

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY;

/**
 * CARTO's Voyager is closest to Google's road map but needs a key. Without
 * one, OpenStreetMap's own tiles are used, which are free for moderate
 * traffic. `layerConfig` tells the boundary corrector how each draws borders.
 */
const STREET_TILES = CARTO_KEY
  ? {
      url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      layerConfig: "cartodb-light-retina",
      attribution: `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    }
  : {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      layerConfig: "osm-carto",
      attribution: OSM_ATTRIBUTION,
    };

const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELLITE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

/**
 * Where India's official boundary lines are drawn from. Served from public/
 * rather than a CDN, so a blocked CDN can't quietly bring back the borders
 * the street tiles show. Copied from @india-boundary-corrector/data; copy it
 * again after updating that package.
 */
const BOUNDARY_CORRECTIONS = "/map/india_boundary_corrections.pmtiles";

/**
 * The street map, which follows OpenStreetMap's borders, redrawn with India's
 * official boundaries.
 */
const StreetTiles = () => {
  const map = useMap();

  useEffect(() => {
    const { url, ...options } = STREET_TILES;
    const layer = new L.TileLayer.IndiaBoundaryCorrected(url, {
      ...options,
      pmtilesUrl: BOUNDARY_CORRECTIONS,
      maxZoom: MAX_ZOOM,
      // For pages to restyle, as the public map does.
      className: "street-tiles",
    }).addTo(map);
    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
};

/**
 * The map's background. Satellite imagery has no borders or labels to
 * correct, so it is drawn as it comes.
 */
const BaseMap = ({ type = "map" }: { type?: MapType }) =>
  type === "satellite" ? (
    <TileLayer
      url={SATELLITE_TILES}
      maxZoom={MAX_ZOOM}
      attribution={SATELLITE_ATTRIBUTION}
    />
  ) : (
    <StreetTiles />
  );

export default BaseMap;
