import { latLngBounds, LatLngLiteral, Map as LeafletMap } from "leaflet";

export interface FramePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Moves the map to show a selected port's routes, given as `points`, inside
 * `padding`. Routes too wide to fit even at `minZoom` are shown zoomed right
 * out, centred as near to them as possible while keeping `port` on screen.
 */
export function frameRoutes(
  map: LeafletMap,
  port: LatLngLiteral,
  points: LatLngLiteral[],
  padding: FramePadding,
  minZoom: number
) {
  if (points.length === 0) {
    map.panTo(port);
    return;
  }

  const bounds = latLngBounds(points);

  const width = map.getSize().x;
  // The world is 256px wide at zoom 0 and doubles with each level.
  const pxPerDegree = (256 * 2 ** minZoom) / 360;
  const routesWidth = (bounds.getEast() - bounds.getWest()) * pxPerDegree;
  if (routesWidth + padding.left + padding.right <= width) {
    map.fitBounds(bounds, {
      paddingTopLeft: [padding.left, padding.top],
      paddingBottomRight: [padding.right, padding.bottom],
    });
    return;
  }

  const center = bounds.getCenter();
  const lng = Math.min(
    Math.max(center.lng, port.lng - (width / 2 - padding.right) / pxPerDegree),
    port.lng + (width / 2 - padding.left) / pxPerDegree
  );
  map.setView({ lat: center.lat, lng }, minZoom);
}
