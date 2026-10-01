import { useEffect, useState } from "react";
import { KPIS, Port } from "@/lib/types";
import GreenInitiativeFacts from "./GreenInitiativeFacts";
import Image from "next/image";
import PortFacts from "./PortFacts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const ModalWindow = ({
  port,
  setIsModal,
  kpis,
}: {
  port: Port;
  setIsModal: (model: boolean) => void;
  kpis: KPIS[];
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  return (
    <div
      className='scroller sm:bg-[rgba(0,0,0,0.54)] fixed w-full h-full top-0 left-0 z-[9999] flex justify-center items-center transition ease-in-out duration-[900ms] bg-white'
      onClick={() => setIsModal(false)}>
      <div
        className='relative z-[100] max-w-[100%] sm:max-w-[90%]  md:max-w-[85%] lg:max-w-[80%] xl:max-w-[70%] w-full sm:max-h-[43rem] h-[100%] bg-white flex items-center rounded-lg sm:rounded-2xl md:rounded-2xl lg:xl:rounded-[1.7rem] sm:p-2 xl:p-4 sm:border-y-[0.8rem] sm:border-[#115D92] py-'
        onClick={(e) => e.stopPropagation()}>
        <div
          key={port.port_id + port.country}
          className='w-[100%] flex flex-col overflow-y-auto lg:flex-row justify-between h-[100%] xl:gap-[0.5rem]'>
          <div className='lg:hidden gap-5 sm:mb-2'>
            <h1 className='text-2xl mt-3 mb-1 sm:mb-0 sm:mt-0  text-gray-700 font-bold text-center tracking-tight'>
              {port.name}
            </h1>
            <div className='text-center gap-2 text-[14px] flex justify-center items-center font-medium text-gray-500'>
              {port?.flag_url && (
                <Image
                  src={port?.flag_url}
                  alt='Flag Icon'
                  width={25}
                  height={25}
                  onError={(e) => {
                    e.currentTarget.src = "@/assets/port_alt.jpg";
                  }}
                />
              )}
              <p>{port.country}</p>
            </div>
          </div>
          {!isFullScreen ? <PortFacts port={port} /> : null}
          <GreenInitiativeFacts
            setIsFullScreen={setIsFullScreen}
            isFullScreen={isFullScreen}
            kpis={kpis}
            portId={port?.port_id}
          />
          <button
            className='bg-red-500 m-2 block sm:hidden py-2 rounded-md text-white font-lg text-lg'
            onClick={() => setIsModal(false)}>
            Close
          </button>
        </div>

        <span
          className='absolute sm:flex justify-center rounded-full items-center bg-slate-500 hover:bg-red-500 cursor-pointer -right-6 -top-5 hidden'
          onClick={() => setIsModal(false)}>
          <FontAwesomeIcon
            icon={faXmark}
            className='size-6 text-white p-1.5'
          />
        </span>
      </div>
    </div>
  );
};

export default ModalWindow;
