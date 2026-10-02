"use client";
import { useEffect } from "react";
import {
  Browser,
  latLngBounds,
  LatLngLiteral,
  Marker as LeafletMarker,
} from "leaflet";
import {
  MapContainer,
  Polyline,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import BaseMap from "@/components/map/BaseMap";
import HtmlMarker from "@/components/map/HtmlMarker";
import type { Route } from "@/lib/map/routes";

type LatLng = LatLngLiteral;

interface Props {
  /** The port's position, or undefined until both coordinates are valid. */
  position: LatLng | undefined;
  onPositionChange: (position: LatLng) => void;
  /** Places to fit in view when the map opens, such as the saved position. */
  initialView: LatLng[];
  /** Route lines to draw, as the public map would. */
  routes?: Route[];
  color?: string;
}

const INDIA = { lat: 20, lng: 78 };

// The coordinate columns keep three decimal places.
const round = (value: number) => Math.round(value * 1000) / 1000;
const toPosition = ({ lat, lng }: LatLng) => ({
  lat: round(lat),
  lng: round(lng),
});

/** Pans to typed coordinates when they fall outside the visible map. */
function KeepInView({ position }: { position: LatLng | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (position && !map.getBounds().contains(position)) {
      map.panTo(position);
    }
  }, [map, position]);
  return null;
}

/** Places the port where the map is clicked. */
function PlaceOnClick({ onPlace }: { onPlace: (position: LatLng) => void }) {
  useMapEvents({
    // Wrapped, as the world repeats sideways and coordinates must stay
    // within ±180°.
    click: (event) => onPlace(toPosition(event.latlng.wrap())),
  });
  return null;
}

/**
 * Leaves scrolling to the form around the map, like Google's cooperative
 * gestures: the wheel zooms only with Ctrl or ⌘ held, as a trackpad pinch
 * sends, and touch screens move the map with two fingers.
 */
function CooperativeScroll() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    // Captured before Leaflet's own wheel handler, which never sees it.
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) event.stopImmediatePropagation();
    };
    container.addEventListener("wheel", onWheel, { capture: true });
    return () =>
      container.removeEventListener("wheel", onWheel, { capture: true });
  }, [map]);
  return null;
}

/**
 * A small map for placing a port: click to move it, or drag its pin. Its route
 * lines follow as it moves.
 */
export function PortMapPreview({
  position,
  onPositionChange,
  initialView,
  routes = [],
  color = "#0f172a",
}: Props) {
  // A single point has no extent to fit, so it gets a regional zoom instead.
  const view =
    initialView.length > 1
      ? {
          bounds: latLngBounds(initialView),
          boundsOptions: { padding: [48, 48] as [number, number] },
        }
      : {
          center: initialView[0] ?? INDIA,
          zoom: initialView[0] ? 5 : 3,
        };

  return (
    <div className='h-72 overflow-hidden rounded-lg border'>
      <MapContainer
        {...view}
        // One finger scrolls the page on touch screens; two move the map.
        dragging={!Browser.mobile}
        zoomControl={false}
        // Its own stacking context keeps the map's layers inside the dialog.
        className='isolate h-full'>
        <BaseMap />
        <ZoomControl position='bottomright' />
        <CooperativeScroll />
        <PlaceOnClick onPlace={onPositionChange} />
        {routes.map(({ key, path, color: routeColor }) => (
          <Polyline
            key={key}
            positions={path}
            interactive={false}
            pathOptions={{ color: routeColor, opacity: 1, weight: 1.5 }}
          />
        ))}
        {position && (
          <HtmlMarker
            position={position}
            title='Port location'
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker: LeafletMarker = event.target;
                onPositionChange(toPosition(marker.getLatLng().wrap()));
              },
            }}>
            <span
              className='block size-5 rounded-full border-[3px] border-white shadow-md'
              style={{ backgroundColor: color }}
            />
          </HtmlMarker>
        )}
        <KeepInView position={position} />
      </MapContainer>
    </div>
  );
}
