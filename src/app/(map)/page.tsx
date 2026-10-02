"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getKpis, getPorts } from "@/lib/map/api";
import { KPIS } from "@/lib/map/types";
import Loader from "@/components/map/Loader";

// Leaflet needs the browser's window as soon as it loads, so the map is never
// rendered on the server.
const MapBoard = dynamic(() => import("@/components/map/MapBoard"), {
  ssr: false,
  loading: () => <Loader />,
});

export default function Home() {
  const { data: ports = [], isLoading: isLoadingPorts } = useQuery({
    queryKey: ["ports"],
    queryFn: getPorts,
  });

  const { data: kpis = [] } = useQuery<KPIS[]>({
    queryKey: ["kpis"],
    queryFn: getKpis,
  });


  const isLoading = isLoadingPorts;

  return (
    <MapBoard
      ports={ports}
      kpis={kpis}
      isLoading={isLoading}
    />
  );
}
