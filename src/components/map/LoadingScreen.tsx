import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

/**
 * Routes from a hub out to partner ports, bowed north as the map draws them:
 * far to Europe, near to the Gulf, down to Africa, and east to East and
 * South East Asia. Listed in the order they draw, from side to side.
 */
const ROUTES = [
  { path: "M124 66 Q70 15 16 16", partner: [16, 16] },
  { path: "M124 66 Q162 56 200 86", partner: [200, 86] },
  { path: "M124 66 Q99 42 74 50", partner: [74, 50] },
  { path: "M124 66 Q180 20 236 22", partner: [236, 22] },
  { path: "M124 66 Q79 53 34 88", partner: [34, 88] },
];

/** Seconds between one route starting to draw and the next. */
const ROUTE_STAGGER = 0.25;

interface Props {
  /** What is still loading, read out to screen readers as it changes. */
  status: string;
  /** Fades the screen out to show the map, then removes it. */
  isDone: boolean;
}

/**
 * Covers the page while the map and its ports load: the map's hub badge with
 * its trade routes drawing out one after another, then a fade into the map.
 * With reduced motion the routes are drawn already.
 */
const LoadingScreen = ({ status, isDone }: Props) => {
  const [isHidden, setIsHidden] = useState(false);

  if (isHidden) return null;

  return (
    <div
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget) setIsHidden(true);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-sea px-6 text-center transition-opacity duration-500 ${
        isDone ? "pointer-events-none opacity-0" : ""
      }`}>
      <div
        aria-hidden
        className='relative h-24 w-64'>
        <svg
          viewBox='0 0 256 96'
          fill='none'
          className='absolute inset-0 overflow-visible text-brand'>
          {ROUTES.map(({ path }) => (
            <path
              key={path}
              d={path}
              stroke='currentColor'
              strokeOpacity={0.3}
              strokeWidth={1.5}
              strokeDasharray='2 4'
            />
          ))}
          {ROUTES.map(({ path }, index) => (
            <path
              key={path}
              d={path}
              pathLength={1}
              stroke='currentColor'
              strokeWidth={2}
              strokeLinecap='round'
              strokeDasharray={1}
              className='motion-safe:animate-route-draw'
              style={{ animationDelay: `${index * ROUTE_STAGGER}s` }}
            />
          ))}
          {ROUTES.map(({ partner: [cx, cy] }) => (
            <circle
              key={`${cx},${cy}`}
              cx={cx}
              cy={cy}
              r={5}
              fill='currentColor'
              stroke='white'
              strokeWidth={2}
            />
          ))}
        </svg>
        {/* The hub, as its pin looks on the map. */}
        <span className='absolute top-12.5 left-27 flex'>
          <span className='absolute -inset-1 rounded-full bg-brand opacity-25' />
          <span className='relative flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand shadow-md'>
            <FontAwesomeIcon
              icon={faLeaf}
              className='size-4 text-white'
            />
          </span>
        </span>
      </div>

      <p className='mt-8 text-lg leading-tight font-semibold text-gray-900'>
        Indian Port Trade Route Map
      </p>
      <p className='mt-1.5 max-w-xs text-sm text-balance text-gray-600'>
        India&apos;s hub ports, their trade partners and green initiatives
      </p>
      <p
        role='status'
        className='mt-8 text-xs text-gray-600'>
        {status}
      </p>
    </div>
  );
};

export default LoadingScreen;
