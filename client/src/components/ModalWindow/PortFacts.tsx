import { Port } from "@/lib/types";
import Image from "next/image";
import React from "react";

const PortFacts = ({ port }: { port: Port }) => {
  return (
    <div className='lg:w-[49%] lg:min-h-full flex flex-col sm:flex-row lg:flex-col gap[0.7rem] sm:pr-2'>
      <div className='p-1 m-2 sm:m-0 sm:w-[45%] md:w-[55%] lg:w-full lg:h-[45%]'>
        {port?.image_url && (
          <Image
            src={port?.image_url}
            alt='Port Image Kpi'
            className='w-full h-full rounded-xl object-cover'
            width={400}
            height={300}
            onError={(e) => {
              e.currentTarget.src = "@/assets/port_alt.jpg";
            }}
          />
        )}
      </div>

      <div className='h-full m-2 sm:m-0 bg-[rgb(241, 241, 241)] sm:w-[55%] md:w-[50%] lg:w-full rounded-md bg-gray-20 overflow-y-auto xl:m-0.5 lg:bg-red-20'>
        <div className='hidden lg:flex lg:flex-col'>
          <h1 className='text-2xl text-gray-700 font-bold text-center'>
            {port.name}
          </h1>
          <div className='text-center gap-2 text-[14px] flex justify-center items-center font-medium text-gray-600'>
            <Image
              src={port.flag_url}
              alt='Flag Icon'
              className=''
              width={25}
              height={25}
            />
            <p>{port.country}</p>
          </div>
        </div>

        <div className='lg:border-t lg:mt-3 lg:pt-2 lg:border-gray-200 flex items-center text-sm h-full lg:h-auto'>
          <div className='w-full'>
            <div className='flex font-medium rounded-md my-2 md:py-0.5 justify-between items-center lg:bg-gray-100'>
              <p className='pl-2 md:pl-5 lg:pl-2 xl:pl-5'>City :</p>
              <span className='font-normal md:ml-4 xl:ml-6 pr-2  xl:w-[50%] '>
                {port.city}
              </span>
            </div>
            <div className='flex font-medium rounded-md my-2.5 md:py-0.5 justify-between items-center lg:bg-gray-100'>
              <p className='pl-2 md:pl-5 lg:pl-2 xl:pl-5'>
                Number of <span>berths :</span>
              </p>
              <span className='font-normal md:ml-4 xl:ml-6 pr-2  xl:w-[50%] '>
                {port.number_of_berths}
              </span>
            </div>
            <div className='flex font-medium rounded-md my-2.5 md:py-0.5 justify-between items-center lg:bg-gray-100'>
              <p className='pl-2 md:pl-5 lg:pl-2 xl:pl-5'>Port type :</p>
              <span className='font-normal md:ml-4 xl:ml-6 pr-2  xl:w-[50%]'>
                {port.port_type}
              </span>
            </div>
            <div className='flex font-medium rounded-md my-2.5 md:py-0.5 justify-between items-center lg:bg-gray-100'>
              <p className='pl-2 md:pl-5 lg:pl-2 xl:pl-5'>Average T.A.T. :</p>
              <span className='font-normal md:ml-4 xl:ml-6 pr-2  xl:w-[50%]'>
                {Number(port.average_tat).toFixed(1)} Days
              </span>
            </div>
            <div className='flex font-medium rounded-md my-2.5 md:py-0.5 justify-between items-center lg:bg-gray-100'>
              <p className='pl-2 md:pl-5 lg:pl-2 xl:pl-5'>Port capacity :</p>
              <span className='font-normal md:ml-4 xl:ml-6 pr-2  xl:w-[50%]'>
                {port.port_capacity} Million TEU
              </span>
            </div>
            <div className='flex font-medium rounded-md my-2.5 md:py-0.5 justify-between items-center lg:bg-gray-100'>
              <p className='pl-2 md:pl-5 lg:pl-2 xl:pl-5'>Dominant cargo :</p>
              <span className='font-normal md:ml-4 xl:ml-6 pr-2  xl:w-[50%]'>
                {port.dominant_cargo}
              </span>
            </div>
            <div className='flex font-medium rounded-md my-2.5 md:py-0.5 justify-between items-center lg:bg-gray-100'>
              <p className='pl-2 md:pl-5 lg:pl-2xl:pl-5'>Status :</p>
              <span className='font-normal md:ml-4 pr-2  xl:ml-6 xl:w-[50%]'>
                {port.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortFacts;
