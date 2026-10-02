import { useEffect, useEffectEvent } from "react";
import * as L from "leaflet";
import {
  extendLeaflet,
  LayerConfig,
} from "@india-boundary-corrector/leaflet-layer";
import { TileLayer, useMap } from "react-leaflet";

extendLeaflet(L);

export type MapType = "map" | "satellite";

const MAX_ZOOM = 19;

/**
 * Esri's World Street Map: labelled in English everywhere, unlike
 * OpenStreetMap's tiles, which use each country's own script, and free
 * without a key, unlike CARTO's.
 */
const STREET_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const STREET_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, &copy; OpenStreetMap contributors, and the GIS User Community";

/**
 * How the boundary corrector redraws borders on the street map, which it has
 * no built-in config for: the wrong lines blurred away, and India's drawn in
 * the warm grey and widths of Esri's own borders. Natural Earth's coarser
 * lines are used up to zoom 4, OpenStreetMap's after.
 */
const STREET_BORDERS = new LayerConfig({
  id: "esri-world-street-map",
  tileUrlTemplates: [STREET_TILES],
  lineWidthStops: { 3: 0.8, 5: 1.5, 8: 2, 12: 3 },
  lineStyles: [
    { color: "rgb(180, 176, 160)", layerSuffix: "ne", endZoom: 4, delWidthFactor: 3 },
    { color: "rgb(180, 176, 160)", layerSuffix: "ne-disp", endZoom: 4, delWidthFactor: 3 },
    { color: "rgb(130, 128, 115)", layerSuffix: "osm", startZoom: 5, delWidthFactor: 2 },
    { color: "rgb(130, 128, 115)", layerSuffix: "osm-disp", startZoom: 5, delWidthFactor: 2 },
  ],
});

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

interface Props {
  type?: MapType;
  /** Called each time the tiles in view have loaded, or failed to. */
  onLoad?: () => void;
}

/**
 * The street map, which shows disputed borders as they stand on the ground,
 * redrawn with India's official boundaries.
 */
const StreetTiles = ({ onLoad }: Pick<Props, "onLoad">) => {
  const map = useMap();
  // Read when tiles load, so a new callback doesn't recreate the layer.
  const handleLoad = useEffectEvent(() => onLoad?.());

  useEffect(() => {
    const layer = new L.TileLayer.IndiaBoundaryCorrected(STREET_TILES, {
      layerConfig: STREET_BORDERS,
      attribution: STREET_ATTRIBUTION,
      pmtilesUrl: BOUNDARY_CORRECTIONS,
      maxZoom: MAX_ZOOM,
      // For pages to restyle, as the public map does.
      className: "street-tiles",
    }).addTo(map);
    layer.on("load", () => handleLoad());
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
const BaseMap = ({ type = "map", onLoad }: Props) =>
  type === "satellite" ? (
    <TileLayer
      url={SATELLITE_TILES}
      maxZoom={MAX_ZOOM}
      attribution={SATELLITE_ATTRIBUTION}
      eventHandlers={onLoad ? { load: onLoad } : undefined}
    />
  ) : (
    <StreetTiles onLoad={onLoad} />
  );

export default BaseMap;
