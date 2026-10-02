import { useEffect, useMemo, useState, useCallback } from "react";
import { Map, useMap } from "@vis.gl/react-google-maps";
import Marker from "@/components/map/Marker/Marker";
import { KPIS, Port } from "@/lib/map/types";
import ModalWindow from "./ModalWindow/ModalWindow";
import { createCurvePath } from "@/lib/map/polylinesCurves";
import { getPortPaths } from "@/lib/map/getPortPath";
import { findHub, partnersOf } from "@/lib/map/ports";
import Loader from "./Loader";
import { PortSummary } from "./Marker/MarkerCard";
import { FALLBACK_PIN_COLOR } from "./Marker/PortPin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

// India center and coordinates
const DEFAULT_ZOOM = 5;
const DEFAULT_COORDS = { lat: 23, lng: 78.7861 };

// Stop zooming out past the point where the world starts repeating / grey bands show
const MIN_ZOOM = 3;
const WORLD_BOUNDS = {
  latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
  strictBounds: true,
};

const MapBoard = ({
  ports,
  kpis,
  isLoading,
}: {
  ports: Port[];
  kpis: KPIS[];
  isLoading: boolean;
}) => {
  const [detailsPort, setDetailsPort] = useState<Port | null>(null);
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
            sourcePort,
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

  if (isLoading) return <Loader />;

  return (
    <>
      <Map
        onClick={handleMapClick}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        defaultCenter={DEFAULT_COORDS}
        defaultZoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        restriction={WORLD_BOUNDS}
        fullscreenControl={false}>
        <Marker
          setDefaultZoom={setZoom}
          ports={ports}
          onOpenDetails={setDetailsPort}
          setClickedPort={setClickedPort}
          clickedPort={clickedPort}
          setDefaultCenter={setDefaultCenter}
          setHoveredPort={setHoveredPort}
          hoveredPort={hoveredPort}
        />
      </Map>
      {/* Small screens show the selected port here instead of beside its marker. */}
      {clickedPort ? (
        <div className='fixed inset-x-3 bottom-8 z-10 rounded-xl bg-white p-3 shadow-xl sm:hidden'>
          <PortSummary
            port={clickedPort}
            color={
              findHub(clickedPort, ports)?.polyline_color || FALLBACK_PIN_COLOR
            }
            partnerCount={partnersOf(clickedPort, ports).length}
            isSelected
            onOpenDetails={setDetailsPort}
          />
          <button
            type='button'
            aria-label='Clear selection'
            onClick={handleMapClick}
            className='absolute top-2 right-2 flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100'>
            <FontAwesomeIcon
              icon={faXmark}
              className='size-4'
            />
          </button>
        </div>
      ) : null}
      {detailsPort ? (
        <ModalWindow
          port={detailsPort}
          hub={findHub(detailsPort, ports)}
          kpis={kpis}
          onClose={() => setDetailsPort(null)}
        />
      ) : null}
    </>
  );
};

export default MapBoard;
