/**
 * Points along a quadratic Bézier from `start` to `end`, bowed `curveFactor`
 * degrees of latitude away from the straight line.
 *
 * Longitudes are interpolated as given, never wrapped across the antimeridian.
 * The map is bounded to a single copy of the world, so a route from India to
 * the Americas runs west across the visible map rather than leaving its east
 * edge and coming back in on the west.
 */
export function createCurvePath(
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral,
  curveFactor: number
) {
  const controlPoint = {
    lat: (start.lat + end.lat) / 2 + curveFactor,
    lng: (start.lng + end.lng) / 2,
  };

  // About one point per degree, so long routes stay smooth when zoomed in.
  const steps = Math.max(
    20,
    Math.ceil(Math.hypot(end.lat - start.lat, end.lng - start.lng))
  );
  const path: google.maps.LatLngLiteral[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat =
      (1 - t) * (1 - t) * start.lat +
      2 * (1 - t) * t * controlPoint.lat +
      t * t * end.lat;
    const lng =
      (1 - t) * (1 - t) * start.lng +
      2 * (1 - t) * t * controlPoint.lng +
      t * t * end.lng;

    path.push({ lat, lng });
  }

  return path;
}
