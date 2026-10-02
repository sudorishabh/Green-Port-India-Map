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
  map: google.maps.Map,
  port: google.maps.LatLngLiteral,
  points: google.maps.LatLngLiteral[],
  padding: FramePadding,
  minZoom: number
) {
  if (points.length === 0) {
    map.panTo(port);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  points.forEach((point) => bounds.extend(point));

  const width = map.getDiv().clientWidth;
  // The world is 256px wide at zoom 0 and doubles with each level.
  const pxPerDegree = (256 * 2 ** minZoom) / 360;
  const routesWidth = bounds.toSpan().lng() * pxPerDegree;
  if (routesWidth + padding.left + padding.right <= width) {
    map.fitBounds(bounds, padding);
    return;
  }

  const center = bounds.getCenter();
  const lng = Math.min(
    Math.max(center.lng(), port.lng - (width / 2 - padding.right) / pxPerDegree),
    port.lng + (width / 2 - padding.left) / pxPerDegree
  );
  map.setZoom(minZoom);
  map.panTo({ lat: center.lat(), lng });
}
