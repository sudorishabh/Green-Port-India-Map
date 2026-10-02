"use client";
import { useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";

type LatLng = google.maps.LatLngLiteral;

interface Props {
  /** The port's position, or undefined until both coordinates are valid. */
  position: LatLng | undefined;
  onPositionChange: (position: LatLng) => void;
  /** Places to fit in view when the map opens, such as the saved position. */
  initialView: LatLng[];
  color?: string;
}

const INDIA = { lat: 20, lng: 78 };

// The coordinate columns keep three decimal places.
const round = (value: number) => Math.round(value * 1000) / 1000;
const toPosition = ({ lat, lng }: LatLng) => ({
  lat: round(lat),
  lng: round(lng),
});

function boundsOf(points: LatLng[]) {
  const lats = points.map(({ lat }) => lat);
  const lngs = points.map(({ lng }) => lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
    padding: 48,
  };
}

/** Pans to typed coordinates when they fall outside the visible map. */
function KeepInView({ position }: { position: LatLng | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (map && position && !map.getBounds()?.contains(position)) {
      map.panTo(position);
    }
  }, [map, position]);
  return null;
}

/**
 * A small map for placing a port: click to move it, or drag its pin.
 */
export function PortMapPreview({
  position,
  onPositionChange,
  initialView,
  color = "#0f172a",
}: Props) {
  // A single point has no extent to fit, so it gets a regional zoom instead.
  const view =
    initialView.length > 1
      ? { defaultBounds: boundsOf(initialView) }
      : {
          defaultCenter: initialView[0] ?? INDIA,
          defaultZoom: initialView[0] ? 5 : 3,
        };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string}>
      <div className='h-72 overflow-hidden rounded-lg border'>
        <Map
          {...view}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
          gestureHandling='cooperative'
          disableDefaultUI
          zoomControl
          clickableIcons={false}
          onClick={(event) => {
            if (event.detail.latLng)
              onPositionChange(toPosition(event.detail.latLng));
          }}>
          {position && (
            <AdvancedMarker
              position={position}
              title='Port location'
              draggable
              anchorLeft='-50%'
              anchorTop='-50%'
              onDragEnd={(event) => {
                if (event.latLng)
                  onPositionChange(toPosition(event.latLng.toJSON()));
              }}>
              <span
                className='block size-5 rounded-full border-[3px] border-white shadow-md'
                style={{ backgroundColor: color }}
              />
            </AdvancedMarker>
          )}
          <KeepInView position={position} />
        </Map>
      </div>
    </APIProvider>
  );
}
