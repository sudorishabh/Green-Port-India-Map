import { AdvancedMarker } from "@vis.gl/react-google-maps";
import React, { useCallback, useState, useEffect } from "react";
import MarkerCard from "./MarkerCard";
import { Port } from "@/lib/types";
import HoveredCardPortal from "./HoveredCardPortal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

interface PortalInfo {
  port: Port | null;
  position: { x: number; y: number } | null;
}

interface MarkersProps {
  ports: Port[];
  setIsModal: (isModal: boolean) => void;
  setModalPortData: (port: Port) => void;
  setClickedPort: (port: Port | null) => void;
  setDefaultZoom: (defaultZoom: number) => void;
  clickedPort: Port | null;
  setHoveredPort: (port: Port | null) => void;
  hoveredPort: Port | null;
  setDefaultCenter: (defaultCenter: { lat: number; lng: number }) => void;
}

const Markers: React.FC<MarkersProps> = ({
  ports,
  setIsModal,
  setModalPortData,
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

        const isActive =
          clickedPort?.port_id === port.port_id ||
          hoveredPort?.port_id === port.port_id;

        return (
          <AdvancedMarker
            key={port.port_id + port.lat}
            position={position}
            zIndex={isActive ? 100 : 1}
            onClick={() => handleClickMarker(port)}>
            <FontAwesomeIcon
              icon={faLeaf}
              onMouseEnter={(e) => handleHoverMarker(port, e)}
              onMouseLeave={() => handleHoverMarker(null)}
              className='size-8 opacity-75 hover:opacity-100 fill-green-800 hover:fill-green-800 hover:text-green-800 text-green-800'
            />

            {clickedPort?.port_id === port.port_id && (
              <MarkerCard
                port={port}
                clickedPort={clickedPort}
                setIsModal={setIsModal}
                setModalPortData={setModalPortData}
              />
            )}
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export default React.memo(Markers);
