import { Port } from "./types";

/** Hubs are the Indian ports; every other port names its hub in `ind_port_name`. */
export const isHub = (port: Port) => !port.ind_port_name;

/** The hub `port` trades with, or `port` itself when it is a hub. */
export const findHub = (port: Port, allPorts: Port[]) =>
  isHub(port)
    ? port
    : allPorts.find((p) => isHub(p) && p.name === port.ind_port_name);

/** The partner ports of `hub`. */
export const partnersOf = (hub: Port, allPorts: Port[]) =>
  allPorts.filter((p) => p.ind_port_name === hub.name);

/**
 * `port` and the ports at the other end of its routes: a hub's partners, or a
 * partner port's hub.
 */
export const connectedPorts = (port: Port, allPorts: Port[]) => {
  if (isHub(port)) return [port, ...partnersOf(port, allPorts)];
  const hub = findHub(port, allPorts);
  return hub ? [hub, port] : [port];
};

/** Ports saved before statuses were capitalised may still say "active". */
export const isActive = (port: Port) => port.status.toLowerCase() === "active";
