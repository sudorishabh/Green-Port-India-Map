import { findHub, isHub } from "./ports";
import { Port } from "./types";

type PortPath = [
  {
    lat: number;
    lng: number;
    ind_port_name: string;
    country: string;
    polyline_color: string;
  },
  {
    lat: number;
    lng: number;
    name: string;
    polyline_curve: number;
  },
];

/**
 * The route lines to draw for `port`: from a hub (a port without an Indian port
 * name) to each of its partner ports, or from a partner port's hub to it.
 *
 * Lines start at the hub's own coordinates. Partner ports also store a copy of
 * them, which goes stale when the hub is moved, so the copy is only a fallback
 * for a hub missing from `allPorts`.
 */
export const getPortPaths = (
  port: Port | null,
  allPorts: Port[]
): PortPath[] => {
  if (!port) return [];

  const hub = findHub(port, allPorts);
  const partners = isHub(port)
    ? allPorts.filter((p) => p.ind_port_name === port.name)
    : [port];

  return partners.map((partner) => [
    {
      lat: Number(hub?.lat ?? partner.ind_port_lat),
      lng: Number(hub?.lng ?? partner.ind_port_lng),
      ind_port_name: partner.ind_port_name || "",
      country: partner.country,
      polyline_color: hub?.polyline_color || "",
    },
    {
      lat: Number(partner.lat),
      lng: Number(partner.lng),
      name: partner.name,
      polyline_curve: Number(partner.polyline_curve),
    },
  ]);
};
