import { MapType } from "./BaseMap";

const MAP_TYPES: { type: MapType; label: string }[] = [
  { type: "map", label: "Map" },
  { type: "satellite", label: "Satellite" },
];

interface Props {
  value: MapType;
  onChange: (type: MapType) => void;
}

/** Switches between the street map and satellite imagery. */
const MapTypeSwitch = ({ value, onChange }: Props) => (
  <div
    role='group'
    aria-label='Map type'
    className='fixed top-3 right-3 z-10 flex gap-1 rounded-xl bg-white p-1 shadow-lg'>
    {MAP_TYPES.map(({ type, label }) => (
      <button
        key={type}
        type='button'
        aria-pressed={type === value}
        onClick={() => onChange(type)}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          type === value
            ? "bg-brand text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}>
        {label}
      </button>
    ))}
  </div>
);

export default MapTypeSwitch;
