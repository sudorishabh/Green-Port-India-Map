import type { LatLngLiteral } from "leaflet";
import { getPortPaths } from "./getPortPath";
import { createCurvePath } from "./polylinesCurves";
import { Port } from "./types";

export interface Route {
  /** The hub's and partner port's names, unique across the whole network. */
  key: string;
  path: LatLngLiteral[];
  color: string;
}

/** The curved route lines to draw for `port`, in its hub's colour. */
export const getRoutes = (port: Port | null, allPorts: Port[]): Route[] =>
  getPortPaths(port, allPorts).map(([hub, partner]) => ({
    key: `${hub.ind_port_name}/${partner.name}`,
    path: createCurvePath(hub, partner, partner.polyline_curve),
    color: hub.polyline_color,
  }));
