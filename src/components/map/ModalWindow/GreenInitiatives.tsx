import { useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { getPortInitiatives } from "@/lib/map/api";
import { Initiative, KPIS, TargetLink } from "@/lib/map/types";

type Kpi = KPIS["kpiData"] & { links: KPIS["targetsLinks"] };

/** "imo.org" for https://www.imo.org/en/..., so a link says where it goes. */
function siteName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}

const SourceLink = ({ url }: { url: string }) => (
  <a
    href={url}
    target='_blank'
    rel='noopener noreferrer'
    className='inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline'>
    {siteName(url)}
    <FontAwesomeIcon
      icon={faArrowUpRightFromSquare}
      className='size-2.5'
    />
    <span className='sr-only'>(opens in a new tab)</span>
  </a>
);

const Target = ({
  label,
  text,
  links,
}: {
  label: string;
  text: string;
  links: TargetLink[];
}) => (
  <div className='rounded-lg bg-gray-50 p-3'>
    <p className='text-xs font-semibold tracking-wide text-gray-500 uppercase'>
      {label}
    </p>
    <p className='mt-1 text-sm text-gray-800'>{text}</p>
    {links.length > 0 && (
      <div className='mt-2 flex flex-wrap gap-x-3 gap-y-1'>
        {links.map((link) => (
          <SourceLink
            key={link.link_id}
            url={link.link_url}
          />
        ))}
      </div>
    )}
  </div>
);

const KpiItem = ({
  kpi,
  initiatives,
  isOpen,
  onToggle,
}: {
  kpi: Kpi;
  /** Undefined until the port's initiatives have loaded. */
  initiatives: Initiative[] | undefined;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const panelId = useId();
  const count = initiatives?.length ?? 0;

  return (
    <li>
      <button
        type='button'
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className='flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand'>
        <span
          className={`flex-1 text-sm ${
            count > 0 ? "font-medium text-gray-800" : "text-gray-500"
          }`}>
          {kpi.kpi}
        </span>
        {initiatives && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              count > 0
                ? "bg-green-50 font-medium text-green-800"
                : "text-gray-400"
            }`}>
            {count > 0
              ? `${count} ${count === 1 ? "initiative" : "initiatives"}`
              : "None yet"}
          </span>
        )}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`size-3 shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={panelId}
          className='space-y-4 px-4 pb-4'>
          {initiatives && (
            <div>
              <h5 className='mb-2 text-xs font-semibold tracking-wide text-green-700 uppercase'>
                This port&apos;s initiatives
              </h5>
              {count > 0 ? (
                <ul className='space-y-2'>
                  {initiatives.map(
                    ({ initiative_id, initiative, initiative_url }) => (
                      <li
                        key={initiative_id}
                        className='border-l-2 border-green-600 pl-3 text-sm text-gray-800'>
                        <p>{initiative}</p>
                        {initiative_url && <SourceLink url={initiative_url} />}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className='text-sm text-gray-500'>
                  No initiatives recorded for this KPI yet.
                </p>
              )}
            </div>
          )}

          <div className='grid gap-3 sm:grid-cols-2'>
            <Target
              label='International target'
              text={kpi.kpi_international_target}
              links={kpi.links.international}
            />
            <Target
              label='National target'
              text={kpi.kpi_national_target}
              links={kpi.links.national}
            />
          </div>
        </div>
      )}
    </li>
  );
};

/**
 * The port's green initiatives grouped under each KPI, with the KPI's targets.
 * Every KPI shows how many initiatives the port has, so readers can see where
 * there is something to read before opening it.
 */
const GreenInitiatives = ({ portId, kpis }: { portId: number; kpis: KPIS[] }) => {
  const [openKpiId, setOpenKpiId] = useState<number | null>(null);
  const {
    data: initiatives = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["port-initiatives", portId],
    queryFn: () => getPortInitiatives(portId),
  });

  const categories = useMemo(() => {
    const byCategory = new Map<string, Kpi[]>();
    for (const { kpiData, targetsLinks } of kpis) {
      const group = byCategory.get(kpiData.kpi_category) ?? [];
      group.push({ ...kpiData, links: targetsLinks });
      byCategory.set(kpiData.kpi_category, group);
    }
    return [...byCategory];
  }, [kpis]);

  const initiativesByKpi = useMemo(() => {
    const byKpi = new Map<number, Initiative[]>();
    for (const initiative of initiatives) {
      if (initiative.kpi_id === null) continue;
      byKpi.set(initiative.kpi_id, [
        ...(byKpi.get(initiative.kpi_id) ?? []),
        initiative,
      ]);
    }
    return byKpi;
  }, [initiatives]);

  const kpisWithInitiatives = initiativesByKpi.size;

  return (
    <section
      aria-labelledby='green-initiatives-heading'
      className='flex min-h-0 flex-1 flex-col lg:overflow-y-auto lg:pr-1'>
      <div className='mb-3 flex flex-wrap items-baseline justify-between gap-x-4'>
        <h3
          id='green-initiatives-heading'
          className='text-lg font-semibold text-gray-800'>
          Green initiatives by KPI
        </h3>
        <p
          className='text-sm text-gray-500'
          aria-live='polite'>
          {isLoading
            ? "Loading initiatives…"
            : !isError &&
              `${initiatives.length} ${
                initiatives.length === 1 ? "initiative" : "initiatives"
              } across ${kpisWithInitiatives} of ${kpis.length} KPIs`}
        </p>
      </div>

      {isError && (
        <div className='mb-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900'>
          Couldn&apos;t load this port&apos;s initiatives.
          <button
            type='button'
            onClick={() => refetch()}
            className='font-medium underline'>
            Try again
          </button>
        </div>
      )}

      {categories.map(([category, categoryKpis]) => (
        <div
          key={category}
          className='mb-4'>
          <h4 className='mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase'>
            {category}
          </h4>
          <ul className='divide-y divide-gray-100 rounded-xl border border-gray-200'>
            {categoryKpis.map((kpi) => (
              <KpiItem
                key={kpi.kpi_id}
                kpi={kpi}
                initiatives={
                  isLoading || isError
                    ? undefined
                    : (initiativesByKpi.get(kpi.kpi_id) ?? [])
                }
                isOpen={openKpiId === kpi.kpi_id}
                onToggle={() =>
                  setOpenKpiId(openKpiId === kpi.kpi_id ? null : kpi.kpi_id)
                }
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};

export default GreenInitiatives;
