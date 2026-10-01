import { useEffect, useMemo, useState, useCallback } from "react";
import { Map, useMap } from "@vis.gl/react-google-maps";
import Marker from "@/components/Marker/Marker";
import { KPIS, Port } from "@/lib/types";
import ModalWindow from "./ModalWindow/ModalWindow";
import { createCurvePath } from "@/lib/polylinesCurves";
import { getPortPaths } from "@/lib/getPortPath";
import Loader from "./Loader";

// India center and coordinates
const DEFAULT_ZOOM = 5;
const DEFAULT_COORDS = { lat: 23, lng: 78.7861 };

const MapBoard = ({
  ports,
  kpis,
  isLoading,
}: {
  ports: Port[];
  kpis: KPIS[];
  isLoading: boolean;
}) => {
  const [isModal, setIsModal] = useState<boolean>(false);
  const [modalPortData, setModalPortData] = useState<Port>({} as Port);
  const [clickedPort, setClickedPort] = useState<Port | null>(null);
  const [hoveredPort, setHoveredPort] = useState<Port | null>(null);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [defaultCenter, setDefaultCenter] = useState(DEFAULT_COORDS);

  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
    map.setCenter(defaultCenter);
  }, [map, zoom, defaultCenter]);

  const polylinePaths = useMemo(() => {
    const clickedPaths = clickedPort ? getPortPaths(clickedPort, ports) : [];
    const hoveredPaths = hoveredPort ? getPortPaths(hoveredPort, ports) : [];
    return [...clickedPaths, ...hoveredPaths];
  }, [clickedPort, hoveredPort, ports]);

  const handleMapClick = useCallback(() => {
    setClickedPort(null);
  }, []);

  useEffect(() => {
    if (!map || polylinePaths.length === 0) return;

    const validPolylines = polylinePaths
      .map((polylinePath) => {
        const [sourcePort, targetPort] = polylinePath;
        if (!sourcePort || !sourcePort.ind_port_name) {
          console.warn(
            "Skipping polyline due to missing sourcePort data:",
            sourcePort
          );
          return null;
        }

        const curveFactor = targetPort.polyline_curve;

        const curvedPath = createCurvePath(sourcePort, targetPort, curveFactor);

        const colorInfo = sourcePort.polyline_color;

        const polyline = new google.maps.Polyline({
          path: curvedPath,
          strokeColor: colorInfo,
          strokeOpacity: 1,
          strokeWeight: 1.5,
        });

        return polyline;
      })
      .filter((p): p is google.maps.Polyline => p !== null);

    validPolylines.forEach((polyline) => polyline.setMap(map));

    return () => validPolylines.forEach((polyline) => polyline.setMap(null));
  }, [map, polylinePaths]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Map
      onClick={handleMapClick}
      mapId={process.env.NEXT_PUBLIC_MAP_ID}
      defaultCenter={DEFAULT_COORDS}
      defaultZoom={DEFAULT_ZOOM}
      fullscreenControl={false}>
      {!isLoading ? (
        <>
          <Marker
            setDefaultZoom={setZoom}
            ports={ports}
            setIsModal={setIsModal}
            setModalPortData={setModalPortData}
            setClickedPort={setClickedPort}
            clickedPort={clickedPort}
            setDefaultCenter={setDefaultCenter}
            setHoveredPort={setHoveredPort}
            hoveredPort={hoveredPort}
          />
          {isModal && (
            <ModalWindow
              setIsModal={setIsModal}
              port={modalPortData}
              kpis={kpis}
            />
          )}
        </>
      ) : null}
    </Map>
  );
};

export default MapBoard;
