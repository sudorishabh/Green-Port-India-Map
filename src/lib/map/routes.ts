import { getPortPaths } from "./getPortPath";
import { createCurvePath } from "./polylinesCurves";
import { Port } from "./types";

export interface Route {
  /** The partner port's name, unique among one port's routes. */
  key: string;
  path: google.maps.LatLngLiteral[];
  color: string;
}

/** The curved route lines to draw for `port`, in its hub's colour. */
export const getRoutes = (port: Port | null, allPorts: Port[]): Route[] =>
  getPortPaths(port, allPorts).map(([hub, partner]) => ({
    key: partner.name,
    path: createCurvePath(hub, partner, partner.polyline_curve),
    color: hub.polyline_color,
  }));
