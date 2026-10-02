import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Map, Polyline, useMap } from "@vis.gl/react-google-maps";
import Marker from "@/components/map/Marker/Marker";
import { KPIS, Port } from "@/lib/map/types";
import ModalWindow from "./ModalWindow/ModalWindow";
import { getRoutes, Route } from "@/lib/map/routes";
import { findHub, partnersOf } from "@/lib/map/ports";
import Loader from "./Loader";
import { PortSummary } from "./Marker/MarkerCard";
import { FALLBACK_PIN_COLOR } from "./Marker/PortPin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

// India center and coordinates
const DEFAULT_ZOOM = 5;
const DEFAULT_COORDS = { lat: 23, lng: 78.7861 };

const MIN_ZOOM = 3;
const WORLD_BOUNDS = {
  latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
  strictBounds: true,
};

const subscribeToResize = (onResize: () => void) => {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
};

/**
 * Stop zooming out past the point where the world starts repeating or grey
 * bands show: the world is a 256px square at zoom 0, doubling with each level,
 * so it must reach the longer side of the window. Phones can zoom out further.
 */
const useMinZoom = () =>
  useSyncExternalStore(
    subscribeToResize,
    () =>
      Math.ceil(
        Math.log2(Math.max(window.innerWidth, window.innerHeight) / 256)
      ),
    () => MIN_ZOOM
  );

/**
 * Room to leave around framed routes: on phones for the map type control and
 * the selection sheet, elsewhere for the card above the selected marker.
 */
function framePadding(): google.maps.Padding {
  return window.innerWidth < 640
    ? { top: 72, right: 24, bottom: 200, left: 24 }
    : { top: 200, right: 72, bottom: 48, left: 72 };
}

const RouteLines = ({ routes }: { routes: Route[] }) =>
  routes.map(({ key, path, color }) => (
    <Polyline
      key={key}
      path={path}
      strokeColor={color}
      strokeOpacity={1}
      strokeWeight={1.5}
    />
  ));

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

  const map = useMap();
  const minZoom = useMinZoom();

  const selectedRoutes = useMemo(
    () => getRoutes(clickedPort, ports),
    [clickedPort, ports]
  );
  // A selected port's routes are already drawn, so hovering it adds nothing.
  const hoveredRoutes = useMemo(
    () =>
      hoveredPort?.port_id === clickedPort?.port_id
        ? []
        : getRoutes(hoveredPort, ports),
    [hoveredPort, clickedPort, ports]
  );

  // Frame a newly selected port with all of its routes.
  useEffect(() => {
    if (!map || !clickedPort) return;

    const points = selectedRoutes.flatMap(({ path }) => path);
    if (points.length === 0) {
      map.panTo({ lat: +clickedPort.lat, lng: +clickedPort.lng });
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, framePadding());
  }, [map, clickedPort, selectedRoutes]);

  const handleMapClick = useCallback(() => {
    setClickedPort(null);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <>
      <Map
        onClick={handleMapClick}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        defaultCenter={DEFAULT_COORDS}
        defaultZoom={DEFAULT_ZOOM}
        minZoom={minZoom}
        restriction={WORLD_BOUNDS}
        fullscreenControl={false}>
        <RouteLines routes={selectedRoutes} />
        <RouteLines routes={hoveredRoutes} />
        <Marker
          ports={ports}
          onOpenDetails={setDetailsPort}
          setClickedPort={setClickedPort}
          clickedPort={clickedPort}
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
