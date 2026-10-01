import { Port } from "@/lib/types";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  port: Port | null;
  position: { x: number; y: number } | null;
  clickedPort: {
    lat: number;
    lng: number;
    name: string;
  } | null;
}

const CARD_DIMENSIONS = {
  height: 310,
  width: 240,
};

const HoveredCardPortal: React.FC<Props> = React.memo(
  ({ port, position, clickedPort }) => {
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [flipVertical, setFlipVertical] = useState(false);
    const portalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.pointerEvents = "none";
      document.body.appendChild(div);
      portalRef.current = div;
      setMounted(true);

      return () => {
        document.body.removeChild(div);
        portalRef.current = null;
        setMounted(false);
      };
    }, []);

    useEffect(() => {
      if (!port || !position || clickedPort?.name === port?.name) {
        setIsVisible(false);
        return;
      }

      const tooCloseToTop = position.y < CARD_DIMENSIONS.height;
      setFlipVertical(tooCloseToTop);

      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }, [port, position, clickedPort]);

    if (!mounted || !portalRef.current || !port || !position) return null;

    const yPosition = flipVertical
      ? position.y + 50
      : position.y - CARD_DIMENSIONS.height;

    const shouldShow =
      isVisible && port && position && clickedPort?.name !== port?.name;

    return createPortal(
      <div
        className={`fixed bg-white p-2 pb-1 rounded-lg shadow-2xl z-[2999] w-36 sm:w-40 md:w-52 lg:w-56 transition-opacity ease-in-out duration-300 ${
          shouldShow ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          left: position.x,
          top: yPosition,
          transform: "translateX(-50%)",
        }}>
        {port && (
          <>
            {port.image_url && (
              <Image
                src={port.image_url}
                className='rounded-md w-full h-auto object-cover aspect-[4/3]'
                width={100}
                height={80}
                sizes='(max-width: 768px) 100vw, 230px'
                alt='Port Image'
                onError={(e) => {
                  e.currentTarget.src = "@/assets/port_alt.jpg";
                }}
              />
            )}

            <p className='text-center text-[0.8rem] md:text-[1rem] font-[600] text-gray-600 my-1'>
              {port.name}
            </p>
            <div className='text-center gap-1 text-[0.8rem] flex justify-center items-center text-gray-600'>
              {port?.flag_url && (
                <Image
                  src={port?.flag_url}
                  alt='Flag Icon'
                  width={22}
                  height={22}
                />
              )}
              <p>{port.country}</p>
            </div>
          </>
        )}
      </div>,
      portalRef.current
    );
  }
);

HoveredCardPortal.displayName = "HoveredCardPortal";

export default HoveredCardPortal;
