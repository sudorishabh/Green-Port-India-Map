"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { config } from "@fortawesome/fontawesome-svg-core";

// FontAwesome's CSS is imported (layered) in globals.css instead of injected at runtime.
config.autoAddCss = false;

const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string}>
        {children}
      </APIProvider>
    </QueryClientProvider>
  );
};

export default MapProvider;
