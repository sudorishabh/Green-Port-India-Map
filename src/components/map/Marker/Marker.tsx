import React, { useMemo } from "react";
import HtmlMarker from "../HtmlMarker";
import MarkerCard from "./MarkerCard";
import { Port } from "@/lib/map/types";
import PortPin, { FALLBACK_PIN_COLOR } from "./PortPin";
import { isHub } from "@/lib/map/ports";

interface MarkersProps {
  ports: Port[];
  /** Selects a port; selecting the selected port again opens its details. */
  onSelect: (port: Port) => void;
  clickedPort: Port | null;
  setHoveredPort: (port: Port | null) => void;
  hoveredPort: Port | null;
}

const Markers: React.FC<MarkersProps> = ({
  ports,
  onSelect,
  clickedPort,
  setHoveredPort,
  hoveredPort,
}) => {
  const hubColors = useMemo(
    () =>
      new Map(ports.filter(isHub).map((hub) => [hub.name, hub.polyline_color])),
    [ports]
  );

  const partnerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { ind_port_name } of ports) {
      if (ind_port_name)
        counts.set(ind_port_name, (counts.get(ind_port_name) ?? 0) + 1);
    }
    return counts;
  }, [ports]);

  return (
    <>
      {ports?.map((port) => {
        const position = { lat: +port.lat, lng: +port.lng };

        const isSelected = clickedPort?.port_id === port.port_id;
        const isHovered = hoveredPort?.port_id === port.port_id;
        const isHighlighted = isSelected || isHovered;
        const color =
          hubColors.get((isHub(port) ? port.name : port.ind_port_name) ?? "") ||
          FALLBACK_PIN_COLOR;

        return (
          <HtmlMarker
            key={port.port_id}
            position={position}
            title={port.name}
            // Leaflet stacks markers by latitude, so these offsets are large
            // enough to lift a port above any marker it overlaps.
            zIndexOffset={isHighlighted ? 10000 : isHub(port) ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(port) }}>
            <span
              onMouseEnter={() => setHoveredPort(port)}
              onMouseLeave={() => setHoveredPort(null)}>
              <PortPin
                port={port}
                color={color}
                isHighlighted={isHighlighted}
              />
            </span>

            {isHighlighted && (
              <MarkerCard
                port={port}
                color={color}
                partnerCount={partnerCounts.get(port.name) ?? 0}
                isSelected={isSelected}
                onOpenDetails={onSelect}
              />
            )}
          </HtmlMarker>
        );
      })}
    </>
  );
};

export default React.memo(Markers);
