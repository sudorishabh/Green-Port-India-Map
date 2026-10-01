import type { kpiTargetsLinks, portKpis } from "../schema.ts";

type TargetLink = Pick<
  typeof kpiTargetsLinks.$inferInsert,
  "target_type" | "link_url"
> & { target_type: "National" | "International" };

export type SeedKpi = Pick<
  typeof portKpis.$inferInsert,
  "kpi_category" | "kpi" | "kpi_national_target" | "kpi_international_target"
> & { links: TargetLink[] };

const HARIT_SAGAR =
  "https://shipmin.gov.in/sites/default/files/Harit%20Sagar%20-%20Green%20Port%20Guidelines%20(May%202023).pdf";
const IMO_GHG_STRATEGY =
  "https://www.imo.org/en/OurWork/Environment/Pages/2023-IMO-Strategy-on-Reduction-of-GHG-Emissions-from-Ships.aspx";

const national = (link_url: string): TargetLink => ({
  target_type: "National",
  link_url,
});
const international = (link_url: string): TargetLink => ({
  target_type: "International",
  link_url,
});

/**
 * National targets come from India's Harit Sagar Green Port Guidelines (2023)
 * and related missions; international targets from IMO, EU and UN frameworks.
 * Insertion order is display order: the map groups KPIs by category.
 */
export const kpis = {
  carbon_intensity: {
    kpi_category: "Emissions & Air Quality",
    kpi: "Carbon emissions per tonne of cargo handled",
    kpi_national_target:
      "Cut carbon emissions per tonne of cargo handled by 30% by 2030 and by 70% by 2047 (Harit Sagar Green Port Guidelines, 2023).",
    kpi_international_target:
      "Cut total annual GHG emissions from international shipping by at least 20%, striving for 30%, by 2030 and by at least 70%, striving for 80%, by 2040 compared with 2008, reaching net zero by or around 2050 (2023 IMO GHG Strategy).",
    links: [
      national(HARIT_SAGAR),
      national("https://www.pib.gov.in/PressReleasePage.aspx?PRID=1923116"),
      international(IMO_GHG_STRATEGY),
    ],
  },
  sulphur_air: {
    kpi_category: "Emissions & Air Quality",
    kpi: "Sulphur content of marine fuel",
    kpi_national_target:
      "Ships in Indian waters must use fuel oil with no more than 0.50% m/m sulphur from 1 January 2020 unless fitted with exhaust gas cleaning systems (DG Shipping circulars implementing MARPOL Annex VI Regulation 14).",
    kpi_international_target:
      "Global limit of 0.50% m/m sulphur in ships' fuel oil from 1 January 2020, and 0.10% m/m inside designated Emission Control Areas (MARPOL Annex VI).",
    links: [
      national(
        "https://www.irclass.org/technical-circulars/dg-shipping-india-circular-reg-05-max-limit-of-the-sulphur-content-in-fuel-oil-compliance-with-the-provisions-of-marpol-annex-vi-regulation-14/",
      ),
      international(
        "https://www.imo.org/en/MediaCentre/HotTopics/Pages/Sulphur-2020.aspx",
      ),
    ],
  },
  renewable_share: {
    kpi_category: "Clean Energy",
    kpi: "Share of renewable energy in total port power demand",
    kpi_national_target:
      "Raise renewable energy to more than 60% of each port's total power demand by 2030 and 90% by 2047 (Harit Sagar Green Port Guidelines, 2023).",
    kpi_international_target:
      "Triple global installed renewable power capacity to at least 11,000 GW by 2030 (COP28 Global Renewables and Energy Efficiency Pledge, 2023).",
    links: [
      national(HARIT_SAGAR),
      international(
        "https://www.cop28.com/en/global-renewables-and-energy-efficiency-pledge",
      ),
    ],
  },
  shore_power: {
    kpi_category: "Clean Energy",
    kpi: "Shore power for vessels at berth",
    kpi_national_target:
      "Phased rollout of onshore power supply at major ports: port craft by 2023; Coast Guard, Navy and Indian-flagged coastal vessels by 2024; foreign-flagged EXIM cargo vessels by 2025 (Harit Sagar Green Port Guidelines, 2023).",
    kpi_international_target:
      "From 2030, EU TEN-T maritime ports must supply shore-side electricity for at least 90% of calls by container and passenger ships of 5,000 GT and above (EU Alternative Fuels Infrastructure Regulation 2023/1804).",
    links: [
      national(HARIT_SAGAR),
      international("https://eur-lex.europa.eu/eli/reg/2023/1804/oj"),
    ],
  },
  green_hydrogen: {
    kpi_category: "Clean Energy",
    kpi: "Green hydrogen and green fuel readiness",
    kpi_national_target:
      "Produce 5 million tonnes of green hydrogen a year by 2030 (National Green Hydrogen Mission), with Deendayal, Paradip and V.O. Chidambaranar recognised as port-based green hydrogen hubs; green ammonia bunkering and refuelling at all major ports by 2035 (Harit Sagar).",
    kpi_international_target:
      "Produce 10 million tonnes of renewable hydrogen in the EU and import a further 10 million tonnes by 2030 (REPowerEU).",
    links: [
      national("https://mnre.gov.in/national-green-hydrogen-mission/"),
      national("https://www.pib.gov.in/PressReleasePage.aspx?PRID=2177591"),
      international(
        "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen_en",
      ),
    ],
  },
  equipment_electrification: {
    kpi_category: "Green Equipment & Vessels",
    kpi: "Electrification of port equipment",
    kpi_national_target:
      "Electrify more than 50% of port equipment by 2030 and more than 90% by 2047 (Harit Sagar Green Port Guidelines, 2023).",
    kpi_international_target:
      "Move to zero-emission cargo-handling equipment by 2030 and zero-emission drayage trucks by 2035 (San Pedro Bay Ports Clean Air Action Plan, Los Angeles and Long Beach).",
    links: [
      national(HARIT_SAGAR),
      international("https://cleanairactionplan.org/"),
    ],
  },
  green_tugs: {
    kpi_category: "Green Equipment & Vessels",
    kpi: "Green tugs and harbour craft",
    kpi_national_target:
      "All harbour tugs at major ports to be green by 2040. In Phase 1 (Oct 2024 to Dec 2027), JNPA, Deendayal, Paradip and V.O. Chidambaranar ports each procure or charter at least two green tugs, starting with battery-electric designs (Green Tug Transition Programme).",
    kpi_international_target:
      "Zero or near-zero GHG emission technologies, fuels and energy sources to provide at least 5%, striving for 10%, of the energy used by international shipping by 2030 (2023 IMO GHG Strategy).",
    links: [
      national("https://www.pib.gov.in/PressReleasePage.aspx?PRID=2045946"),
      national("https://shipmin.gov.in/sites/default/files/GTTP%20SOP.pdf"),
      international(IMO_GHG_STRATEGY),
    ],
  },
  green_belt: {
    kpi_category: "Resource Management",
    kpi: "Green belt cover of port area",
    kpi_national_target:
      "Expand the green belt to more than 20% of the port area by 2030 and 33% by 2047 (Harit Sagar Green Port Guidelines, 2023).",
    kpi_international_target:
      "Significantly increase the area, quality and connectivity of green and blue spaces in urban and densely populated areas by 2030 (Kunming-Montreal Global Biodiversity Framework, Target 12).",
    links: [
      national(HARIT_SAGAR),
      international("https://www.cbd.int/gbf/targets/12"),
    ],
  },
  water: {
    kpi_category: "Resource Management",
    kpi: "Freshwater use and wastewater reuse",
    kpi_national_target:
      "Reduce freshwater consumption by more than 20% by 2030 and recycle and reuse port wastewater (Harit Sagar Green Port Guidelines, 2023).",
    kpi_international_target:
      "Halve the proportion of untreated wastewater, substantially increase recycling and safe reuse, and substantially increase water-use efficiency across all sectors by 2030 (UN SDG targets 6.3 and 6.4).",
    links: [
      national(HARIT_SAGAR),
      international("https://sdgs.un.org/goals/goal6"),
    ],
  },
  waste: {
    kpi_category: "Resource Management",
    kpi: "Ship-generated waste and marine litter",
    kpi_national_target:
      "Zero waste discharge from port operations through reduce, reuse, repurpose and recycle, with every port providing shore reception facilities for waste from calling ships (Harit Sagar Green Port Guidelines, 2023).",
    kpi_international_target:
      "MARPOL Annex V bans the discharge of plastics from ships into the sea, and the IMO Action Plan to Address Marine Plastic Litter from Ships (2018) calls for adequate port reception facilities.",
    links: [
      national(HARIT_SAGAR),
      international(
        "https://www.imo.org/en/MediaCentre/HotTopics/Pages/marinelitter-default.aspx",
      ),
    ],
  },
} satisfies Record<string, SeedKpi>;

export type KpiKey = keyof typeof kpis;
