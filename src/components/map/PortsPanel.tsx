import { useId, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faLeaf,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { findHub, isHub, partnersOf } from "@/lib/map/ports";
import { Port } from "@/lib/map/types";
import PortPin from "./Marker/PortPin";

/** Width of the panel beside the map on larger screens (Tailwind `w-80`). */
export const PANEL_WIDTH = 320;

interface Props {
  ports: Port[];
  selectedPort: Port | null;
  onSelect: (port: Port) => void;
  onHover: (port: Port | null) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const matches = (port: Port, query: string) =>
  [port.name, port.city, port.country].some((value) =>
    value.toLowerCase().includes(query)
  );

/**
 * Explains the map and lists its ports: the Indian hubs by default, or every
 * port matching a search. Choosing a port selects it on the map.
 */
const PortsPanel = ({
  ports,
  selectedPort,
  onSelect,
  onHover,
  isOpen,
  onOpenChange,
}: Props) => {
  const [query, setQuery] = useState("");
  const bodyId = useId();
  const searchId = useId();
  const search = query.trim().toLowerCase();

  // Hubs first, then by name.
  const listed = useMemo(
    () =>
      ports
        .filter((port) => (search ? matches(port, search) : isHub(port)))
        .sort(
          (a, b) =>
            Number(isHub(b)) - Number(isHub(a)) || a.name.localeCompare(b.name)
        ),
    [ports, search]
  );

  return (
    <aside
      aria-label='Map guide'
      className='fixed top-3 left-3 z-10 flex max-h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-lg sm:w-80'>
      <div className='flex items-start gap-3 p-4'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white'>
          <FontAwesomeIcon
            icon={faLeaf}
            className='size-4'
          />
        </span>
        <div className='min-w-0 flex-1'>
          <h1 className='leading-tight font-semibold text-gray-900'>
            Indian Port Trade Route Map
          </h1>
          <p className='mt-0.5 text-xs text-gray-500'>
            India&apos;s hub ports, their trade partners and green initiatives
          </p>
        </div>
        <button
          type='button'
          aria-expanded={isOpen}
          aria-controls={bodyId}
          aria-label={isOpen ? "Hide port list" : "Show port list"}
          onClick={() => onOpenChange(!isOpen)}
          className='flex size-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-brand'>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          id={bodyId}
          className='flex min-h-0 flex-col border-t border-gray-100'>
          <p className='px-4 pt-3 text-xs text-gray-600'>
            Select a port to see its trade routes, then open it for its green
            initiatives.
          </p>

          <div className='relative px-4 py-3'>
            <label
              htmlFor={searchId}
              className='sr-only'>
              Search ports
            </label>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className='pointer-events-none absolute top-1/2 left-7 size-3.5 -translate-y-1/2 text-gray-400'
            />
            <input
              id={searchId}
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search ports, cities or countries'
              className='w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm focus:border-brand focus:bg-white focus:outline-none'
            />
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto px-2 pb-2'>
            <h2
              className='px-2 pb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase'
              aria-live='polite'>
              {search
                ? `${listed.length} matching ${listed.length === 1 ? "port" : "ports"}`
                : "Indian hub ports"}
            </h2>
            <ul>
              {listed.map((port) => {
                const isSelected = selectedPort?.port_id === port.port_id;
                const partnerCount = partnersOf(port, ports).length;
                return (
                  <li key={port.port_id}>
                    <button
                      type='button'
                      aria-current={isSelected ? "true" : undefined}
                      onClick={() => onSelect(port)}
                      onMouseEnter={() => onHover(port)}
                      onMouseLeave={() => onHover(null)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-brand ${
                        isSelected ? "bg-gray-100" : ""
                      }`}>
                      <span className='flex size-6 shrink-0 items-center justify-center'>
                        <PortPin
                          port={port}
                          color={findHub(port, ports)?.polyline_color}
                          isHighlighted={false}
                          compact
                        />
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-sm font-medium text-gray-800'>
                          {port.name}
                        </span>
                        <span className='block truncate text-xs text-gray-500'>
                          {isHub(port)
                            ? `${port.city} · ${partnerCount} partner ${partnerCount === 1 ? "port" : "ports"}`
                            : `${port.city}, ${port.country}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {search && listed.length === 0 && (
              <p className='px-2 py-3 text-sm text-gray-500'>
                No ports match &ldquo;{query.trim()}&rdquo;.
              </p>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-gray-100 px-4 py-3 text-xs text-gray-600'>
            <span className='flex items-center gap-1.5'>
              <span className='flex size-5 items-center justify-center rounded-full border-2 border-white bg-gray-600 shadow'>
                <FontAwesomeIcon
                  icon={faLeaf}
                  className='size-2.5 text-white'
                />
              </span>
              Indian hub
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-3 rounded-full border-2 border-white bg-gray-600 shadow' />
              Partner port
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-3 rounded-full border-2 border-white bg-gray-400 opacity-70 shadow' />
              Inactive
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='h-0.5 w-5 rounded-full bg-gray-600' />
              Trade route
            </span>
            <span className='w-full text-gray-500'>
              Each colour is one hub and the ports it trades with.
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default PortsPanel;
