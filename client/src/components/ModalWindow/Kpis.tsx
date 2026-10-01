import { KPIS, KpisByCategory, ITargetSection } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import React, { useState } from "react";

const TargetSection = ({ label, targetText, links }: ITargetSection) => {
  return (
    <div className='flex flex-col sm:flex-row justify-between border-t border-gray-200 mt-3 pt-3'>
      <div className='sm:w-[30%]'>
        <p className='font-semibold text-gray-700 whitespace-nowrap'>
          {label} :
        </p>
      </div>
      <div className='flex flex-col'>
        <p className='flex-1'>{targetText}</p>
        <div className='flex mt-2.5 justify-end'>
          {links &&
            links.map((link, i) => (
              <Link
                href={link.link_url}
                target='_blank'
                rel='noopener noreferrer'
                key={`${link.kpi_id}-${link.link_id}`}
                className='ml-2 bg-blue-900 px-1.5 text-[12px] rounded-md cursor-pointer hover:bg-blue-700 text-white'>
                {links.length > 1 ? `Link ${i + 1}` : "Link"}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

interface KpisProps {
  kpis: KPIS[];
  setIsInitiativesOpen: (isInitiativesOpen: boolean) => void;
  setKpiId: (kpiInitiative: string) => void;
}

const Kpis = ({ setIsInitiativesOpen, kpis, setKpiId }: KpisProps) => {
  const [dropdownKpi, setDropdownKpi] = useState<string | null>(null);

  const kpisObj: KpisByCategory = kpis.reduce(
    (acc, { kpiData: kpi, targetsLinks }) => {
      const category = kpi.kpi_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        kpi_id: kpi.kpi_id,
        kpi: kpi.kpi,
        kpi_national_target: kpi.kpi_national_target,
        kpi_international_target: kpi.kpi_international_target,
        kpi_nation_target_links: targetsLinks.national,
        kpi_international_target_links: targetsLinks.international,
      });
      return acc;
    },
    {} as KpisByCategory
  );
  return (
    <div className='ml-3'>
      {Object.keys(kpisObj).map((heading) => (
        <div key={heading}>
          <h1 className='text-[1.1rem] font-bold text-gray-700 mt-2'>
            {heading.toUpperCase()}
          </h1>
          {kpisObj[heading].map(
            ({
              kpi,
              kpi_id,
              kpi_international_target,
              kpi_international_target_links,
              kpi_nation_target_links,
              kpi_national_target,
            }) => {
              return (
                <div
                  key={kpi_id}
                  className={`relative rounded-md mr-4 px-1 bg-gray-5 my-[0.7rem] justify-between ${
                    dropdownKpi === kpi ? "bg-gray-100" : ""
                  }`}
                  onClick={() =>
                    setDropdownKpi(
                      dropdownKpi && dropdownKpi === kpi ? null : kpi
                    )
                  }>
                  <div className='flex justify-between items-center text-sm text-gray-800 cursor-pointer'>
                    <p
                      className={`underline  underline-offset-2 ${
                        dropdownKpi && dropdownKpi === kpi
                          ? "text-blue-700 font-medium"
                          : "hover:text-blue-700"
                      }`}>
                      {kpi}
                    </p>
                    {dropdownKpi && dropdownKpi === kpi ? (
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className='size-5 text-gray-400 ml-1'
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className='size-5 text-gray-400 ml-1'
                      />
                    )}
                  </div>
                  {dropdownKpi === kpi && (
                    <div className='mt-2 flex flex-col justify-center text-sm p-4 rounded'>
                      <h2 className='text-center font-semibold text-gray-800 uppercase'>
                        <span className='text-green-600 mr-1'>Targets</span> of{" "}
                        {kpi}
                      </h2>

                      <>
                        <TargetSection
                          label='International'
                          targetText={kpi_international_target}
                          links={kpi_international_target_links}
                        />
                        <TargetSection
                          label='National'
                          targetText={kpi_national_target}
                          links={kpi_nation_target_links}
                        />
                      </>

                      <div
                        className='bg-gray-200 hover:bg-gray-300 cursor-pointer p-2 mt-4 rounded-md font-medium text-gray-800 hover:text-gray-950 text-center'
                        onClick={() => {
                          setIsInitiativesOpen(true);
                          setKpiId(kpi_id.toString());
                        }}>
                        Port Best Practices
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      ))}
    </div>
  );
};

export default Kpis;
