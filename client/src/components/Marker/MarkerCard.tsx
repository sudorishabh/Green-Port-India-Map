import { Port } from "@/lib/types";
import Image from "next/image";
import React, {
  FC,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface Props {
  port: Port;
  clickedPort: Port | null;
  setIsModal: (isModal: boolean) => void;
  setModalPortData: (port: Port) => void;
}

const MarkerHoverCard: FC<Props> = React.memo(
  ({ port, clickedPort, setIsModal, setModalPortData }) => {
    const [flip, setFlip] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (clickedPort?.name !== port.name) return;

      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      setFlip(rect.top < -10 || rect.bottom > window.innerHeight);
    }, [clickedPort, port.name]);

    const handleClickCard = useCallback(() => {
      setIsModal(true);
      setModalPortData(port);
    }, [port, setIsModal, setModalPortData]);

    return (
      <div
        ref={cardRef}
        className={`absolute ${flip ? "top-10" : "bottom-14"}  
      bg-white p-2 pb-1 rounded-lg w-36 sm:w-40 md:w-52 lg:w-56 left-[50%] -translate-x-[50%] shadow-2xl z-[1000]`}
        onClick={handleClickCard}>
        <div className='w-full'>
          {port?.image_url && (
            <Image
              src={port?.image_url}
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
            {port?.name}
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
            <p>{port?.country}</p>
          </div>
        </div>
      </div>
    );
  }
);

MarkerHoverCard.displayName = "MarkerHoverCard";

export default MarkerHoverCard;
