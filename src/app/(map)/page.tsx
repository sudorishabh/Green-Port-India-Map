"use client";
import MapBoard from "@/components/map/MapBoard";
import { useQuery } from "@tanstack/react-query";
import { getKpis, getPorts } from "@/lib/map/api";
import { KPIS } from "@/lib/map/types";

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
