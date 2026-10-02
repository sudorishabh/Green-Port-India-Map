import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";
import { isActive, isHub } from "@/lib/map/ports";
import { Port } from "@/lib/map/types";

export const FALLBACK_PIN_COLOR = "#166534";
export const INACTIVE_PIN_COLOR = "#9ca3af";

interface Props {
  port: Port;
  /** Route colour of the port's hub; partners share their hub's colour. */
  color: string | undefined;
  isHighlighted: boolean;
  /** Smaller, for lists beside the map. */
  compact?: boolean;
}

/**
 * A port on the map. Hubs are large leaf badges, partner ports small dots, both
 * in the hub's route colour so each trade network reads as one group. Inactive
 * ports are grey. On the map, hubs sit in a soft halo of their colour, and a
 * highlighted port's halo pulses.
 */
const PortPin = ({ port, color, isHighlighted, compact = false }: Props) => {
  const hub = isHub(port);
  const active = isActive(port);
  const fill = active ? color || FALLBACK_PIN_COLOR : INACTIVE_PIN_COLOR;

  return (
    <span
      className={`relative flex transition-transform duration-150 ${
        isHighlighted ? "scale-125" : ""
      } ${active ? "" : "opacity-70"}`}>
      {!compact && (hub || isHighlighted) && (
        <span
          aria-hidden
          className={`absolute -inset-1 rounded-full opacity-25 ${
            isHighlighted ? "motion-safe:animate-ping" : ""
          }`}
          style={{ backgroundColor: fill }}
        />
      )}
      <span
        className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-md ${
          hub ? (compact ? "size-6" : "size-8") : compact ? "size-3" : "size-4"
        }`}
        style={{ backgroundColor: fill }}>
        {hub && (
          <FontAwesomeIcon
            icon={faLeaf}
            className={`text-white ${compact ? "size-3" : "size-4"}`}
          />
        )}
      </span>
    </span>
  );
};

export default PortPin;
