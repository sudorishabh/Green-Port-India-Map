import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  LatLngBoundsLiteral,
  LeafletEvent,
  Map as LeafletMap,
  Path,
} from "leaflet";
import { MapContainer, Polyline, ZoomControl } from "react-leaflet";
import Marker from "@/components/map/Marker/Marker";
import { KPIS, Port } from "@/lib/map/types";
import ModalWindow from "./ModalWindow/ModalWindow";
import { frameRoutes, FramePadding } from "@/lib/map/frame";
import { getRoutes, Route } from "@/lib/map/routes";
import {
  connectedPorts,
  findHub,
  isHub,
  partnersOf,
} from "@/lib/map/ports";
import Loader from "./Loader";
import PortsPanel, { PANEL_WIDTH } from "./PortsPanel";
import { PortSummary } from "./Marker/MarkerCard";
import { FALLBACK_PIN_COLOR } from "./Marker/PortPin";
import BaseMap, { MapType } from "./BaseMap";
import MapTypeSwitch from "./MapTypeSwitch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

// India center and coordinates
const DEFAULT_ZOOM = 3.2;
const DEFAULT_COORDS = { lat: 23, lng: 78.7861 };

const MIN_ZOOM = 3;
const WORLD_BOUNDS: LatLngBoundsLiteral = [
  [-85, -180],
  [85, 180],
];

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
        Math.log2(Math.max(window.innerWidth, window.innerHeight) / 256),
      ),
    () => MIN_ZOOM,
  );

/** Phones, and landscape phones too short for floating cards. */
const useIsCompact = () =>
  useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth < 640 || window.innerHeight < 560,
    () => false,
  );

/** Half the width of the card above a selected marker, plus a margin. */
const CARD_ROOM = 136;

/**
 * Room to leave around framed routes: on phones for the collapsed guide and the
 * selection sheet below it, on short landscape screens for the guide and the
 * sheet in the bottom right corner, elsewhere for the card above the selected
 * marker and, when open, the guide panel.
 */
function framePadding(isPanelOpen: boolean): FramePadding {
  if (window.innerWidth < 640) {
    return { top: 120, right: 24, bottom: 200, left: 24 };
  }
  if (window.innerHeight < 560) {
    return { top: 110, right: 356, bottom: 24, left: 24 };
  }
  return {
    top: 200,
    right: CARD_ROOM,
    bottom: 48,
    left: isPanelOpen ? 12 + PANEL_WIDTH + CARD_ROOM : CARD_ROOM,
  };
}

/**
 * Measures a line as 1 long, whatever its length on screen, so CSS can draw
 * every line in over the same time.
 */
const MEASURE_AS_ONE = {
  add: (event: LeafletEvent) =>
    (event.target as Path).getElement()?.setAttribute("pathLength", "1"),
};

/**
 * Every route, drawn faintly so the whole trade network shows at a glance, and
 * fainter still while some are highlighted. The lines draw themselves out from
 * the hubs when the map opens.
 */
const NetworkLines = ({
  routes,
  isFaded,
}: {
  routes: Route[];
  isFaded: boolean;
}) =>
  routes.map(({ key, path, color }) => (
    <Polyline
      key={key}
      positions={path}
      // Only drawn to be seen: clicks on a line go through to the map.
      interactive={false}
      className='route-draw'
      eventHandlers={MEASURE_AS_ONE}
      pathOptions={{ color, opacity: isFaded ? 0.15 : 0.45, weight: 1.5 }}
    />
  ));

/**
 * The routes of the selected or hovered port: a soft glow and the line itself.
 */
const HighlightedLines = ({ routes }: { routes: Route[] }) =>
  routes.map(({ key, path, color }) => (
    <Fragment key={key}>
      <Polyline
        positions={path}
        interactive={false}
        pathOptions={{ color, opacity: 0.15, weight: 9 }}
      />
      <Polyline
        positions={path}
        interactive={false}
        pathOptions={{ color, opacity: 1, weight: 3 }}
      />
    </Fragment>
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

  // Null until toggled: the guide starts open, except on compact screens.
  const [panelOpen, setPanelOpen] = useState<boolean | null>(null);

  const [map, setMap] = useState<LeafletMap | null>(null);
  const [mapType, setMapType] = useState<MapType>("map");
  const minZoom = useMinZoom();
  const isCompact = useIsCompact();
  const isPanelOpen = panelOpen ?? !isCompact;

  const networkRoutes = useMemo(
    () => ports.filter(isHub).flatMap((hub) => getRoutes(hub, ports)),
    [ports],
  );
  const selectedRoutes = useMemo(
    () => getRoutes(clickedPort, ports),
    [clickedPort, ports],
  );
  // Hovering adds the hovered port's routes to the selected port's, once each.
  const highlightedRoutes = useMemo(() => {
    const selectedKeys = new Set(selectedRoutes.map(({ key }) => key));
    return [
      ...selectedRoutes,
      ...getRoutes(hoveredPort, ports).filter(
        ({ key }) => !selectedKeys.has(key),
      ),
    ];
  }, [selectedRoutes, hoveredPort, ports]);
  const focusedPortIds = useMemo(() => {
    const focused = [clickedPort, hoveredPort].flatMap((port) =>
      port ? connectedPorts(port, ports) : [],
    );
    return focused.length
      ? new Set(focused.map(({ port_id }) => port_id))
      : null;
  }, [clickedPort, hoveredPort, ports]);

  // Frame a newly selected port with all of its routes, and again when the
  // layout changes, such as when a phone is rotated.
  useEffect(() => {
    if (!map || !clickedPort) return;
    frameRoutes(
      map,
      { lat: +clickedPort.lat, lng: +clickedPort.lng },
      selectedRoutes.flatMap(({ path }) => path),
      framePadding(isPanelOpen),
      minZoom,
    );
  }, [map, clickedPort, selectedRoutes, isCompact, isPanelOpen, minZoom]);

  const handleMapClick = useCallback(() => {
    setClickedPort(null);
  }, []);

  // The map reads its options only when it is created.
  useEffect(() => {
    map?.setMinZoom(minZoom);
  }, [map, minZoom]);

  // Clicks on markers stop at the marker, so only the map itself clears the
  // selection.
  useEffect(() => {
    map?.on("click", handleMapClick);
    return () => {
      map?.off("click", handleMapClick);
    };
  }, [map, handleMapClick]);

  // A second selection of the same port opens its details. On compact screens
  // the guide closes so the map and the selected port can be seen.
  const handleSelectPort = useCallback(
    (port: Port) => {
      if (port.port_id === clickedPort?.port_id) {
        setDetailsPort(port);
        return;
      }
      setClickedPort(port);
      if (isCompact) setPanelOpen(false);
    },
    [clickedPort, isCompact],
  );

  if (isLoading) return <Loader />;

  return (
    <>
      <MapContainer
        ref={setMap}
        center={DEFAULT_COORDS}
        zoom={DEFAULT_ZOOM}
        // Zoom in tenths, so routes are framed as closely as they fit.
        zoomSnap={0.1}
        minZoom={minZoom}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        // Its own stacking context keeps the map's layers under the guide
        // panel and the selection sheet.
        className='isolate h-full'>
        <BaseMap type={mapType} />
        <ZoomControl position='bottomright' />
        <NetworkLines
          routes={networkRoutes}
          isFaded={highlightedRoutes.length > 0}
        />
        <HighlightedLines routes={highlightedRoutes} />
        <Marker
          ports={ports}
          onSelect={handleSelectPort}
          clickedPort={clickedPort}
          setHoveredPort={setHoveredPort}
          hoveredPort={hoveredPort}
          focusedPortIds={focusedPortIds}
        />
      </MapContainer>
      {/* The guide panel takes the top left, and compact screens have no
          room. */}
      {isCompact ? null : (
        <MapTypeSwitch
          value={mapType}
          onChange={setMapType}
        />
      )}
      <PortsPanel
        ports={ports}
        selectedPort={clickedPort}
        onSelect={handleSelectPort}
        onHover={setHoveredPort}
        isOpen={isPanelOpen}
        onOpenChange={setPanelOpen}
      />
      {/* Phones and short screens show the selected port here instead of
          beside its marker: across the bottom, or in the corner when wide. */}
      {clickedPort ? (
        <div className='fixed inset-x-3 bottom-8 z-10 rounded-xl bg-white p-3 shadow-xl roomy:hidden sm:left-auto sm:w-80'>
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
