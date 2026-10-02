import { isHub } from "@/lib/map/ports";
import { Port } from "@/lib/map/types";
import React, { FC, useLayoutEffect, useRef, useState } from "react";

interface SummaryProps {
  port: Port;
  /** Route colour of the port's network, for the dot beside its role. */
  color: string;
  /** Partner ports of a hub; unused for partners. */
  partnerCount: number;
  /**
   * A selected port offers its details; a hovered port's preview says how to
   * select it.
   */
  isSelected: boolean;
  onOpenDetails: (port: Port) => void;
}

/** Name, place and role of a port, shared by the marker card and mobile sheet. */
export const PortSummary: FC<SummaryProps> = ({
  port,
  color,
  partnerCount,
  isSelected,
  onOpenDetails,
}) => {
  const role = isHub(port)
    ? `Indian hub · ${partnerCount} partner ${partnerCount === 1 ? "port" : "ports"}`
    : `Partner of ${port.ind_port_name}`;

  return (
    <>
      <p className='flex items-start gap-2 pr-6 text-sm leading-snug font-semibold text-gray-800 sm:pr-0'>
        {port.flag_url && (
          <img
            src={port.flag_url}
            alt=''
            className='mt-0.5 size-4 shrink-0'
          />
        )}
        {port.name}
      </p>
      <p className='mt-0.5 text-xs text-gray-500'>
        {port.city}, {port.country}
      </p>
      <p className='mt-2 flex items-center gap-1.5 text-xs text-gray-600'>
        <span
          className='size-2 shrink-0 rounded-full'
          style={{ backgroundColor: color }}
        />
        {role}
      </p>

      {isSelected ? (
        <button
          type='button'
          onClick={() => onOpenDetails(port)}
          className='mt-3 w-full rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'>
          View green initiatives →
        </button>
      ) : (
        <p className='mt-2 text-xs text-gray-400'>
          Click to see its trade routes
        </p>
      )}
    </>
  );
};

/**
 * Card above a hovered or selected marker. On small screens the selected port
 * is shown in a sheet at the bottom of the map instead, as a card beside the
 * marker would run off the screen.
 */
const MarkerCard: FC<SummaryProps> = (props) => {
  const [flip, setFlip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Show the card below the marker when there is no room above it.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (card) setFlip(card.getBoundingClientRect().top < 8);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`absolute left-1/2 w-60 -translate-x-1/2 cursor-default rounded-xl bg-white p-3 text-left shadow-xl ${
        flip ? "top-full mt-3" : "bottom-full mb-3"
      } ${props.isSelected ? "hidden sm:block" : "pointer-events-none"}`}>
      <PortSummary {...props} />
    </div>
  );
};

export default React.memo(MarkerCard);
