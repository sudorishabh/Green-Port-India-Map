import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { divIcon } from "leaflet";
import { Marker, MarkerProps } from "react-leaflet";

interface Props extends Omit<MarkerProps, "icon" | "children"> {
  /** What the marker shows, centred on its position. */
  children: ReactNode;
}

/**
 * A marker drawn by React: `children` render inside it, so they keep their
 * state and event handlers, where a plain Leaflet icon only takes HTML.
 */
const HtmlMarker = ({ children, ...props }: Props) => {
  // Created once, as Leaflet moves this element into a new icon each time the
  // marker is added to the map. Centred, so route lines start and end in the
  // middle of the marker, and positioned for cards placed beside it. The
  // focus ring is drawn here because the icon itself has no size.
  const [content] = useState(() => {
    const element = document.createElement("div");
    element.className =
      "relative w-max -translate-x-1/2 -translate-y-1/2 rounded-full in-focus-visible:outline-2 in-focus-visible:outline-offset-2";
    return element;
  });
  // No size, so only the content itself can be hovered and clicked, not an
  // empty box beside it.
  const [icon] = useState(() =>
    divIcon({ html: content, className: "outline-none", iconSize: [0, 0] })
  );

  return (
    <>
      <Marker
        {...props}
        icon={icon}
      />
      {createPortal(children, content)}
    </>
  );
};

export default HtmlMarker;
