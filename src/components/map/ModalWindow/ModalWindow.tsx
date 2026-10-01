import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { KPIS, Port } from "@/lib/map/types";
import GreenInitiativeFacts from "./GreenInitiativeFacts";
import PortFacts from "./PortFacts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Props {
  port: Port;
  kpis: KPIS[];
  onClose: () => void;
}

/**
 * Port details window. Radix Dialog closes it on Escape or a click outside,
 * keeps keyboard focus inside while open and labels it for screen readers.
 * Mount it only while a port is selected.
 */
const ModalWindow = ({ port, kpis, onClose }: Props) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-50 bg-black/55' />
        <Dialog.Content className='fixed inset-0 z-50 flex flex-col overflow-hidden bg-white shadow-2xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[85vh] sm:max-h-172 sm:w-[90vw] sm:max-w-6xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl lg:w-[80vw] xl:w-[70vw]'>
          <header className='flex items-center gap-3 bg-brand px-4 py-3 text-white sm:px-6'>
            {port.flag_url && (
              <img
                src={port.flag_url}
                alt=''
                className='size-7 shrink-0'
              />
            )}
            <div className='min-w-0 flex-1'>
              <Dialog.Title className='text-lg leading-snug font-semibold sm:text-xl'>
                {port.name}
              </Dialog.Title>
              <Dialog.Description className='text-sm text-white/80'>
                {port.city}, {port.country}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label='Close'
              className='flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white'>
              <FontAwesomeIcon
                icon={faXmark}
                className='size-5'
              />
            </Dialog.Close>
          </header>

          <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-4 lg:flex-row lg:overflow-hidden'>
            {!isFullScreen ? <PortFacts port={port} /> : null}
            <GreenInitiativeFacts
              setIsFullScreen={setIsFullScreen}
              isFullScreen={isFullScreen}
              kpis={kpis}
              portId={port.port_id}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModalWindow;
