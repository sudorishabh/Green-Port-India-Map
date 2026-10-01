export function createCurvePath(
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral,
  curveFactor: number
) {
  const controlPoint = {
    lat: (start.lat + end.lat) / 2 + curveFactor,
    lng: (start.lng + end.lng) / 2,
  };

  const steps = 20;
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
