import { AdvancedMarker } from "@vis.gl/react-google-maps";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MarkerCard from "./MarkerCard";
import { Port } from "@/lib/map/types";
import PortPin, { FALLBACK_PIN_COLOR } from "./PortPin";
import { isHub } from "@/lib/map/ports";

interface MarkersProps {
  ports: Port[];
  onOpenDetails: (port: Port) => void;
  setClickedPort: (port: Port | null) => void;
  setDefaultZoom: (defaultZoom: number) => void;
  clickedPort: Port | null;
  setHoveredPort: (port: Port | null) => void;
  hoveredPort: Port | null;
  setDefaultCenter: (defaultCenter: { lat: number; lng: number }) => void;
}

const Markers: React.FC<MarkersProps> = ({
  ports,
  onOpenDetails,
  setClickedPort,
  setDefaultZoom,
  clickedPort,
  setHoveredPort,
  hoveredPort,
  setDefaultCenter,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleClickMarker = useCallback(
    (port: Port) => {
      // A second click on the selected port opens its details.
      if (clickedPort?.port_id === port.port_id) {
        onOpenDetails(port);
        return;
      }
      setClickedPort(port);

      if (!isMobile && port && !port.ind_port_name) {
        const settings = {
          center: {
            lat: Number(port.zoom_center_lat),
            lng: Number(port.zoom_center_lng),
          },
          zoom: Number(port.zoom),
        };
        if (settings) {
          setDefaultCenter(settings.center);
          setDefaultZoom(settings.zoom);
        }
      }
    },
    [
      clickedPort,
      onOpenDetails,
      setClickedPort,
      isMobile,
      setDefaultCenter,
      setDefaultZoom,
    ]
  );

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
          <AdvancedMarker
            key={port.port_id}
            position={position}
            title={port.name}
            // Centred, so route lines start and end in the middle of the pin.
            anchorLeft='-50%'
            anchorTop='-50%'
            zIndex={isHighlighted ? 100 : isHub(port) ? 2 : 1}
            onClick={() => handleClickMarker(port)}>
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
                onOpenDetails={onOpenDetails}
              />
            )}
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export default React.memo(Markers);
