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

/** Ports saved before statuses were capitalised may still say "active". */
export const isActive = (port: Port) => port.status.toLowerCase() === "active";
