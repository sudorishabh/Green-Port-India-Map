import React, { useEffect, useState } from "react";
import { getKpiInitiatives } from "@/api";
import Link from "next/link";
import { IInitiatives } from "@/lib/types";
import Loader from "../Loader";
const Initiatives = ({ portId, kpiId }: { portId: number; kpiId: string }) => {
  const [kpiPortInitiatives, setKpiPortInitiatives] = useState<IInitiatives[]>(
    []
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (portId && kpiId) {
      const fetch = async () => {
        try {
          setIsLoading(true);
          const result = await getKpiInitiatives({
            portId: portId.toString(),
            kpiId: kpiId.toString(),
          });
          setKpiPortInitiatives(result);
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetch();
    }
  }, [kpiId, portId]);

  if (isLoading) return <Loader />;

  return (
    <div className='ml-1'>
      {kpiPortInitiatives.length !== 0 ? (
        <>
          {kpiPortInitiatives?.map((initiative: IInitiatives) => (
            <div
              key={initiative.initiative_id + initiative.kpi_id}
              className='flex flex-col items-end my-5 mt-1 border-b pb-2'>
              <div className=' flex items-center w-full'>
                <span className='mr-2 text-xl text-gray-600'>•</span>
                <p className='text-sm md:text-base'>{initiative.initiative}</p>
              </div>
              {initiative?.initiative_url && (
                <Link
                  href={initiative.initiative_url}
                  className='mx-4 mt-1 bg-blue-900 hover:bg-blue-700 text-sm text-white py-0.5 px-2 rounded-md'
                  target='_blank'
                  rel='noopener noreferrer'>
                  Read More
                </Link>
              )}
            </div>
          ))}
        </>
      ) : (
        <h1 className='text-center text-red-600 mt-16'>
          No data available for this KPI.
        </h1>
      )}
    </div>
  );
};

export default Initiatives;
