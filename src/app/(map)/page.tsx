"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getKpis, getPorts } from "@/lib/map/api";
import { KPIS } from "@/lib/map/types";
import LoadingScreen from "@/components/map/LoadingScreen";

// Leaflet needs the browser's window as soon as it loads, so the map is never
// rendered on the server. The loading screen covers the page until it is.
const MapBoard = dynamic(() => import("@/components/map/MapBoard"), {
  ssr: false,
});

/** How long to wait for the map's first tiles before showing it anyway. */
const MAX_TILE_WAIT = 6000;

export default function Home() {
  const { data: ports = [], isPending: isPendingPorts } = useQuery({
    queryKey: ["ports"],
    queryFn: getPorts,
  });

  const { data: kpis = [] } = useQuery<KPIS[]>({
    queryKey: ["kpis"],
    queryFn: getKpis,
  });

  // The map is drawn while the ports load, so its tiles load meanwhile too.
  const [hasTiles, setHasTiles] = useState(false);
  const handleTilesLoad = useCallback(() => setHasTiles(true), []);

  // Leaflet fades tiles in as they come, so a slow tile server only delays
  // the map so long.
  useEffect(() => {
    const timeout = setTimeout(handleTilesLoad, MAX_TILE_WAIT);
    return () => clearTimeout(timeout);
  }, [handleTilesLoad]);

  return (
    <>
      <MapBoard
        ports={ports}
        kpis={kpis}
        onTilesLoad={handleTilesLoad}
      />
      <LoadingScreen
        status={
          isPendingPorts
            ? "Loading ports and trade routes…"
            : "Loading the map…"
        }
        isDone={!isPendingPorts && hasTiles}
      />
    </>
  );
}
