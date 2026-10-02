import { isActive, isHub } from "@/lib/map/ports";
import { Port } from "@/lib/map/types";
import React from "react";
import PortImage from "../PortImage";

interface Props {
  port: Port;
  /** The hub `port` trades with, or `port` itself when it is a hub. */
  hub: Port | undefined;
}

const unit = (value: number, one: string) => (value === 1 ? one : `${one}s`);

const PortFacts = ({ port, hub }: Props) => {
  const stats = [
    {
      value: Number(port.port_capacity).toLocaleString("en"),
      label: "million TEU a year",
    },
    {
      value: port.number_of_berths.toLocaleString("en"),
      label: unit(port.number_of_berths, "berth"),
    },
    {
      value: port.average_tat,
      label: `${unit(port.average_tat, "day")} average turnaround`,
    },
  ];

  return (
    <section
      aria-label='Port profile'
      className='flex shrink-0 flex-col gap-4 lg:w-[40%] lg:overflow-y-auto lg:pr-1'>
      {/* The same few illustrations are shared by all ports, so they are
          decorative, and dropped where height is scarce. */}
      <PortImage
        src={port.image_url}
        alt=''
        className='h-36 w-full rounded-xl object-cover short:hidden lg:h-44'
      />

      <div className='flex flex-wrap gap-2 text-xs font-medium'>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-gray-700'>
          <span
            className='size-2.5 rounded-full bg-gray-400'
            style={{ backgroundColor: hub?.polyline_color }}
          />
          {isHub(port) ? "Indian hub port" : `Partner of ${port.ind_port_name}`}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 ${
            isActive(port)
              ? "bg-green-50 text-green-800"
              : "bg-gray-100 text-gray-500"
          }`}>
          {isActive(port) ? "Active" : "Inactive"}
        </span>
      </div>

      <dl className='grid grid-cols-3 gap-2'>
        {stats.map(({ value, label }) => (
          <div
            key={label}
            className='flex flex-col-reverse justify-end rounded-xl bg-gray-50 px-3 py-2.5'>
            <dt className='text-xs leading-tight text-gray-500'>{label}</dt>
            <dd className='text-xl font-semibold text-gray-800'>{value}</dd>
          </div>
        ))}
      </dl>

      <dl className='divide-y divide-gray-100 rounded-xl border border-gray-200 text-sm'>
        <div className='grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-2.5'>
          <dt className='text-gray-500'>Port type</dt>
          <dd className='text-gray-800'>{port.port_type}</dd>
        </div>
        <div className='grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-2.5'>
          <dt className='text-gray-500'>Dominant cargo</dt>
          <dd className='text-gray-800'>{port.dominant_cargo}</dd>
        </div>
      </dl>
    </section>
  );
};

export default PortFacts;
