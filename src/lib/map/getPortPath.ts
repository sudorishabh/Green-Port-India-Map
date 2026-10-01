import { Port } from "./types";

export const getPortPaths = (
  port: Port | null,
  allPorts: Port[]
): Array<
  [
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
    }
  ]
> => {
  if (!port) return [];

  if (!port.ind_port_name) {
    return allPorts
      ?.filter((p: Port) => p.ind_port_name === port.name)
      .map((p: Port) => [
        {
          lat: Number(p.ind_port_lat),
          lng: Number(p.ind_port_lng),
          ind_port_name: p.ind_port_name || "",
          country: p.country,
          polyline_color: port.polyline_color || "",
        },
        {
          lat: Number(p.lat),
          lng: Number(p.lng),
          name: p.name,
          polyline_curve: Number(p.polyline_curve),
        },
      ]);
  } else {
    return [
      [
        {
          lat: Number(port.ind_port_lat),
          lng: Number(port.ind_port_lng),
          ind_port_name: port.ind_port_name,
          country: port.country,
          polyline_color:
            allPorts.find((p: Port) => p.name === port.ind_port_name)
              ?.polyline_color || "",
        },
        {
          lat: Number(port.lat),
          lng: Number(port.lng),
          name: port.name,
          polyline_curve: Number(port.polyline_curve),
        },
      ],
    ];
  }
};
