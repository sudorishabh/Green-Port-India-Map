import { AdvancedMarker } from "@vis.gl/react-google-maps";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MarkerCard from "./MarkerCard";
import { Port } from "@/lib/map/types";
import HoveredCardPortal from "./HoveredCardPortal";
import PortPin from "./PortPin";
import { isHub } from "@/lib/map/ports";

interface PortalInfo {
  port: Port | null;
  position: { x: number; y: number } | null;
}

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
  const [hoveredPortalInfo, setHoveredPortalInfo] = useState<PortalInfo>({
    port: null,
    position: null,
  });

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

  const handleClickMarker = useCallback(
    (port: Port) => {
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
    [setClickedPort, isMobile, setDefaultCenter, setDefaultZoom]
  );

  const handleHoverMarker = useCallback(
    (port: Port | null, event?: React.MouseEvent) => {
      setHoveredPort(port);

      if (port) {
        if (event) {
          setHoveredPortalInfo({
            port,
            position: { x: event.clientX, y: event.clientY },
          });
        }
      } else {
        setHoveredPortalInfo({ port: null, position: null });
      }
    },
    [setHoveredPort]
  );

  return (
    <>
      <HoveredCardPortal
        port={hoveredPortalInfo.port}
        position={hoveredPortalInfo.position}
        clickedPort={clickedPort}
      />

      {ports?.map((port) => {
        const position = { lat: +port.lat, lng: +port.lng };

        const isHighlighted =
          clickedPort?.port_id === port.port_id ||
          hoveredPort?.port_id === port.port_id;
        const hubName = isHub(port) ? port.name : port.ind_port_name;

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
              onMouseEnter={(e) => handleHoverMarker(port, e)}
              onMouseLeave={() => handleHoverMarker(null)}>
              <PortPin
                port={port}
                color={hubColors.get(hubName ?? "")}
                isHighlighted={isHighlighted}
              />
            </span>

            {clickedPort?.port_id === port.port_id && (
              <MarkerCard
                port={port}
                clickedPort={clickedPort}
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
