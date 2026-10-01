import { KPIS } from "@/lib/types";
import React, { useState } from "react";
import Initiatives from "./Initiatives";
import Kpis from "./Kpis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faExpand } from "@fortawesome/free-solid-svg-icons";

const GreenInitiativeFacts = ({
  kpis,
  portId,
  setIsFullScreen,
  isFullScreen,
}: {
  kpis: KPIS[];
  portId: number;
  setIsFullScreen: (isFullScreen: boolean) => void;
  isFullScreen: boolean;
}) => {
  const [isIsInitiativeOpen, setIsInitiativesOpen] = useState(false);
  const [kpiId, setKpiId] = useState<string>("");

  return (
    <div className='flex-1 min-h-full sm:pr-3 overflow-y-auto mt-4 lg:mt-0'>
      <div className='relative lg:bg-gray-100 rounded-lg py-1 border-gray-200 mb-4 mt-1'>
        <h1 className='text-center underline sm:no-underline text-2xl font-bold text-gray-600 '>
          {!isIsInitiativeOpen
            ? "Key Performance Indicators"
            : "Initiatives Taken"}
        </h1>
        {isIsInitiativeOpen && (
          <>
            {!isFullScreen && (
              <span
                className='absolute top-[0.275rem] hover:bg-green-200 bg-gray-200 p-1.5 cursor-pointer size-8 rounded-md left-1.5 justify-center items-center'
                onClick={() => setIsInitiativesOpen(!isIsInitiativeOpen)}>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className='size-full text-gray-600 p-0 m-0'
                />
              </span>
            )}
            <span
              className={`hidden lg:flex absolute top-[0.275rem] ${
                isFullScreen ? "hover:bg-red-200" : "hover:bg-green-200"
              }  p-1.5 cursor-pointer rounded-md right-1.5 flex justify-center items-center`}
              onClick={() => setIsFullScreen(!isFullScreen)}>
              <FontAwesomeIcon
                icon={faExpand}
                className='size-5 text-gray-600 p-0 m-0'
              />
            </span>
          </>
        )}
      </div>
      {!isIsInitiativeOpen ? (
        <Kpis
          kpis={kpis}
          setIsInitiativesOpen={setIsInitiativesOpen}
          setKpiId={setKpiId}
        />
      ) : (
        <Initiatives
          portId={portId}
          kpiId={kpiId}
        />
      )}
    </div>
  );
};

export default GreenInitiativeFacts;
