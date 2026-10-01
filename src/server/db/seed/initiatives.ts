import type { KpiKey } from "./kpis.ts";
import type { PortName } from "./ports.ts";

export interface SeedInitiative {
  port: PortName;
  kpi: KpiKey;
  initiative: string;
  initiative_url: string;
}

const forPort = (
  port: PortName,
  items: Omit<SeedInitiative, "port">[],
): SeedInitiative[] => items.map((item) => ({ port, ...item }));

/** Green initiatives per port, each backed by the linked source. */
export const initiatives: SeedInitiative[] = [
  // Indian hub ports
  ...forPort("Jawaharlal Nehru Port Authority", [
    {
      kpi: "shore_power",
      initiative:
        "In September 2026 JNPA secured a US$70 million IFC blue loan for a Rs 6.5 billion shore power project across its terminals, with 33 kV substations and frequency converters. It starts at one container terminal and is due for completion by January 2028.",
      initiative_url:
        "https://indianinfrastructure.com/2026/09/29/jnpa-secures-70-million-ifc-financing-for-shore-power/",
    },
    {
      kpi: "equipment_electrification",
      initiative:
        "On 25 September 2025 JNPA flagged off India's first fleet of 50 electric heavy trucks with swappable batteries, together with a battery-swapping station at the Nhava Sheva Distribution Terminal. It aims to convert 90% of its roughly 600 internal trucks by December 2026.",
      initiative_url:
        "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2171301",
    },
    {
      kpi: "renewable_share",
      initiative:
        "JNPA reported in 2025 that renewables meet 60% of its total energy needs, including rooftop solar on administrative buildings, terminals and warehouses.",
      initiative_url:
        "https://sustainableworldports.org/project/jawaharlal-nehru-port-authority-transitioning-to-renewable-power/",
    },
    {
      kpi: "green_tugs",
      initiative:
        "Under Phase 1 of the Green Tug Transition Programme, Cochin Shipyard is building two battery-electric harbour tugs for Polestar Maritime to operate at JNPA. ABB won the power and propulsion order in June 2026, with delivery due in 2027.",
      initiative_url:
        "https://maritime-executive.com/corporate/abb-and-cochin-shipyard-to-support-india-s-green-tug-transition-programme",
    },
    {
      kpi: "green_belt",
      initiative:
        "About 1,147 ha (34%) of JNPA's roughly 3,402 ha estate is under green cover, including mangroves.",
      initiative_url:
        "https://www.jnport.gov.in/page/environment-push/TlB3U0o2ZnNQVSttN3c3RDBLSFY0Zz09",
    },
    {
      kpi: "water",
      initiative:
        "In August 2024 JNPA inaugurated the rejuvenated Admin Building Foothill Lake and CPP Lake, which serve as rainwater-harvesting reservoirs, and broke ground on a third water body, Jashkar Lake.",
      initiative_url:
        "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2047762",
    },
  ]),
  ...forPort("Deendayal Port Authority", [
    {
      kpi: "green_hydrogen",
      initiative:
        "On 31 July 2025 Deendayal Port commissioned a 1 MW green hydrogen plant at Kandla with L&T-built electrolysers, able to produce about 140 tonnes of hydrogen a year. It is the first module of a planned 10 MW project.",
      initiative_url:
        "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2150882",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "On 26 September 2026 the foundation stone was laid at Kandla for a 150 tonnes-per-day e-methanol plant costing Rs 2,300 crore, a venture of Deendayal Port and Assam Petro-Chemicals. Phase I (50 TPD) is targeted for January 2027.",
      initiative_url:
        "https://www.business-standard.com/industry/news/india-to-set-up-first-port-based-e-methanol-plant-at-kandla-for-2-300-cr-126092600846_1.html",
    },
    {
      kpi: "renewable_share",
      initiative:
        "Deendayal Port has 20.7 MW of wind power (6 MW commissioned in March 2017 and 14.7 MW in March 2019) and plans to add 40 MW. It also commissioned a 251 kW rooftop solar plant in January 2026.",
      initiative_url:
        "https://www.deendayalport.gov.in/en/orders/projects/green-port-initiatives",
    },
    {
      kpi: "equipment_electrification",
      initiative:
        "Deendayal Port has deployed 13 electric pay loaders for cargo operations (8 in February 2025 and 5 in January 2026), and in November 2025 electrified 18 container-handling equipment units at Berths 11 and 12.",
      initiative_url:
        "https://www.deendayalport.gov.in/en/orders/projects/green-port-initiatives",
    },
    {
      kpi: "shore_power",
      initiative:
        "Since January 2025 Deendayal Port has supplied shore power to port craft and tugs at berth.",
      initiative_url:
        "https://www.deendayalport.gov.in/en/orders/projects/green-port-initiatives",
    },
    {
      kpi: "green_tugs",
      initiative:
        "On 3 December 2025 steel was cut at Atreya Shipyard for India's first all-electric green tug, a 60-tonne bollard pull vessel for Deendayal Port under Phase 1 of the Green Tug Transition Programme.",
      initiative_url:
        "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2198444",
    },
  ]),
  ...forPort("Visakhapatnam Port Authority", [
    {
      kpi: "renewable_share",
      initiative:
        "Visakhapatnam Port runs a 10 MW captive ground-mounted solar plant on over 50 acres, with 36,620 modules commissioned in stages of 6.25 MW and 3.75 MW. It generates about 15 million kWh a year for port operations.",
      initiative_url:
        "https://jakson-green.com/wp-content/uploads/2023/07/Case_study_-_10_MW_solar_PV_plant_at_Visakhapatman_Port_Trust.pdf",
    },
    {
      kpi: "sulphur_air",
      initiative:
        "The port has automated its mechanised dust suppression system across 4 pump houses and 100 sprinkler branches using PLC/SCADA, deployed 2 road-sweeping and 2 dry-fog machines, and is walling its coal stack yards.",
      initiative_url:
        "https://vpt.shipping.gov.in/Template/navigateTemplate/gnt/RW52aXJvbm1lbnQgTWFuYWdlbWVudA==",
    },
    {
      kpi: "green_tugs",
      initiative:
        "In November 2025 Visakhapatnam Port awarded Knowledge Marine & Engineering Works a Rs 384.33 crore, 15-year contract to supply and operate a battery-powered green tug built to the ASTDS-GTTP standard.",
      initiative_url:
        "https://www.indiainfoline.com/news/companies/kmew-wins-second-green-tug-order-worth-384-33-crore-from-visakhapatnam-port-authority",
    },
    {
      kpi: "green_belt",
      initiative:
        "In 2024-25 Visakhapatnam Port launched an 'Ek Ped Maa Ke Naam' plantation drive that aims to plant one million saplings across Visakhapatnam district over three years.",
      initiative_url:
        "https://www.yovizag.com/visakhapatnam-port-authority-to-plant-1-million-saplings-in-the-city/",
    },
  ]),
  ...forPort("V.O. Chidambaranar Port Authority", [
    {
      kpi: "green_hydrogen",
      initiative:
        "On 5 September 2025 V.O. Chidambaranar Port inaugurated a 10 Nm³/hr green hydrogen pilot plant costing Rs 3.87 crore, which powers streetlights and an EV charging station in the port colony.",
      initiative_url:
        "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2164314",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "As of March 2026 the port had allotted 205.72 acres for green hydrogen and ammonia projects and was developing a green methanol bunkering facility of 2 x 750 m³.",
      initiative_url:
        "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2246390",
    },
    {
      kpi: "renewable_share",
      initiative:
        "In September 2025 the port added a 400 kW rooftop solar plant, bringing its rooftop solar capacity to 1.04 MW, and laid the foundation stone for a 6 MW wind farm.",
      initiative_url:
        "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2164314",
    },
    {
      kpi: "green_tugs",
      initiative:
        "In December 2025 the port ordered a fully electric 60-tonne bollard pull tug from Knowledge Marine & Engineering Works under the Green Tug Transition Programme, for Rs 385.76 crore including 15 years of O&M and delivery within two years.",
      initiative_url:
        "https://www.vocport.gov.in/api/files/news-media/press-release/press-release-1765530304191-719289306.pdf",
    },
    {
      kpi: "shore_power",
      initiative:
        "In April 2026 V.O. Chidambaranar Port Authority signed an MoU with ABB to roll out shore power infrastructure at the port.",
      initiative_url:
        "https://www.worldcargonews.com/environment/2026/04/vocpa-abb-ink-mou-on-shore-power-deployment/",
    },
  ]),

  // Europe
  ...forPort("Port of Amsterdam", [
    {
      kpi: "shore_power",
      initiative:
        "Shore power for sea cruise ships at Passenger Terminal Amsterdam officially opened on 3 June 2025, serving about 100 calls a year and expected to save about 4.8 kt of CO2, 100 t of NOx and 3 t of particulates annually. Its use becomes mandatory for sea cruise ships from 2027.",
      initiative_url:
        "https://www.portofamsterdam.com/en/nieuws/sea-cruise-ships-can-now-connect-shore-power-amsterdam",
    },
    {
      kpi: "carbon_intensity",
      initiative:
        "Port of Amsterdam aims to end coal transshipment by 2030 and to be fully equipped for climate neutrality by 2050. Its 2024 annual report records a continued fall in fossil fuel transshipment.",
      initiative_url:
        "https://www.portofamsterdam.com/en/annual-report-2024-steps-towards-greener-port",
    },
    {
      kpi: "renewable_share",
      initiative:
        "Vattenfall's Nieuwe Hemweg wind farm in the port opened in July 2021. Its six turbines total 13.2 MW, enough for about 10,000 households, and replaced 12 older turbines.",
      initiative_url:
        "https://group.vattenfall.com/press-and-media/newsroom/2021/wind-farm-nieuwe-hemweg-opens",
    },
  ]),
  ...forPort("Port of Rotterdam", [
    {
      kpi: "carbon_intensity",
      initiative:
        "Porthos, a project of the Port of Rotterdam Authority, Gasunie and EBN, will store about 2.5 Mt of CO2 a year from port industry in depleted North Sea gas fields. Construction began in early 2024, and start-up is now expected no earlier than the second half of 2027.",
      initiative_url:
        "https://www.porthosco2.nl/en/schedule-for-the-porthos-co%E2%82%82-transport-and-storage-project-revised/",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "Shell is building Holland Hydrogen 1, a 200 MW electrolyser on Maasvlakte 2, whose renewable hydrogen will be piped to the Shell Energy and Chemicals Park Pernis. Its high-voltage grid connection with TenneT was agreed in 2024.",
      initiative_url:
        "https://www.portofrotterdam.com/en/news-and-press-releases/first-large-scale-hydrogen-plant-high-voltage-grid",
    },
    {
      kpi: "shore_power",
      initiative:
        "Rotterdam has more than 100 shore power installations totalling over 43 MW, including a cruise terminal system commissioned in 2025. Its Shore Power Strategy 2025-2035 aims to make shore power standard for much of shipping by 2030 and berthing zero-emission by 2050.",
      initiative_url:
        "https://www.portofrotterdam.com/en/news-and-press-releases/city-rotterdam-and-port-rotterdam-authority-present-updated-shore-power",
    },
  ]),
  ...forPort("Port of Antwerp-Bruges", [
    {
      kpi: "green_tugs",
      initiative:
        "Hydrotug 1, built with CMB.TECH and ready for service in Antwerp in December 2023, is the world's first hydrogen-powered tug. Its two 2 MW dual-fuel engines run on 415 kg of hydrogen stored on deck, cutting conventional fuel use by 65%.",
      initiative_url:
        "https://newsroom.portofantwerpbruges.com/en/press-releases/port-of-antwerp-bruges-cmb.tech-launch-the-hydrotug-1-worlds-first-hydrogen-powered-tugboat",
    },
    {
      kpi: "carbon_intensity",
      initiative:
        "The Antwerp@C CO2 Export Hub, developed by Air Liquide and Fluxys with the port, will collect, liquefy and ship CO2 for offshore storage, starting at 2.8 Mt a year and expandable to 10 Mt. It won EUR 144.6 million of EU funding in 2022, and construction began in May 2025.",
      initiative_url: "https://www.fluxys.com/en/projects/antwerpatc-co2-export-hub",
    },
    {
      kpi: "shore_power",
      initiative:
        "In September 2024 PSA Antwerp approved a 7.5 MW shore power system at Europa Terminal, Antwerp's first for container ships. From 2026 it is to serve up to 100 ships a year and cut up to 10,309 t of CO2 annually.",
      initiative_url:
        "https://www.psa-antwerp.be/en/news/large-vessels-connect-shore-power-europa-terminal-starting-2026",
    },
  ]),
  ...forPort("Port of Gothenburg", [
    {
      kpi: "shore_power",
      initiative:
        "Gothenburg already offers shore power at its ro-ro, ro-pax and tanker terminals. A SEK 600 million transformer station, under construction since 2025 and due in March 2027, will extend it to 5 container and 2 car terminal berths, saving at least 5,600 t of CO2 a year from container ships alone.",
      initiative_url:
        "https://www.portofgothenburg.com/about/articles/new-transformer-station/",
    },
    {
      kpi: "carbon_intensity",
      initiative:
        "The Port of Gothenburg targets a 70% cut in emissions by 2030 compared with 2010, through shore power, environmental discounts on port dues and shifting cargo to rail.",
      initiative_url: "https://www.portofgothenburg.com/sustainability/",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "In January 2023 the methanol-powered ferry Stena Germanica became the world's first non-tanker vessel bunkered with methanol ship-to-ship, in Gothenburg. The port was the first in the world to publish methanol bunkering regulations, in April 2022.",
      initiative_url:
        "https://www.mynewsdesk.com/goteborgs_hamn/pressreleases/world-unique-methanol-bunkering-carried-out-in-the-port-of-gothenburg-3229493",
    },
  ]),
  ...forPort("Port of Hamburg", [
    {
      kpi: "shore_power",
      initiative:
        "Hamburg offers shore power at three cruise terminals (Altona since 2016) and at the CTT, CTB and CTH container terminals, at up to 7.5 MVA per vessel. The port authority aims to equip all major berths by 2030 and reach full coverage by 2040.",
      initiative_url:
        "https://www.hamburg-port-authority.de/en/hpa-360/smartport/shorepower",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "The foundation stone of the Hamburg Green Hydrogen Hub, a 100 MW electrolyser on the former Moorburg coal power plant site, was laid in December 2025. It is to produce about 10,000 t of green hydrogen a year, with commercial operation planned for 2027.",
      initiative_url:
        "https://hgv.hamburg.de/en/aktuelles/kick-off-for-the-hydrogen-future-foundation-stone-laid-for-100-mw-electrolyzer-in-moorburg",
    },
    {
      kpi: "equipment_electrification",
      initiative:
        "In late 2023 HHLA's Container Terminal Altenwerder retired its last diesel automated guided vehicle. Its fleet of 95 battery-powered AGVs runs on green electricity, fully electrifying container transport between ship and stack.",
      initiative_url:
        "https://www.hafen-hamburg.de/en/press/news/farewell-to-fossil-fuels-agv-fleet-at-cta-successfully-converted-to-battery-powered-drive/",
    },
  ]),

  // Asia-Pacific
  ...forPort("Port of Singapore", [
    {
      kpi: "carbon_intensity",
      initiative:
        "The Maritime Singapore Decarbonisation Blueprint (2022) targets at least a 60% cut in absolute port terminal emissions from 2005 levels by 2030 and net zero by 2050, backed by at least S$300 million.",
      initiative_url:
        "https://www.mpa.gov.sg/maritime-singapore/sustainability/maritime-singapore-decarbonisation-blueprint",
    },
    {
      kpi: "green_tugs",
      initiative:
        "From 2030 all new harbour craft in the Port of Singapore must be fully electric, able to use B100 biofuel, or compatible with net-zero fuels such as hydrogen. In July 2023 MPA called for electric harbour craft designs for the port's roughly 1,600 harbour craft.",
      initiative_url:
        "https://www.mpa.gov.sg/media-centre/details/call-for-expression-of-interest-to-design-and-promote-adoption-of-electric-harbour-craft-in-singapore",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "In November 2025 MPA awarded methanol bunkering licences to three suppliers, chosen from 13 applicants, valid from 1 January 2026 to 31 December 2030.",
      initiative_url:
        "https://www.mpa.gov.sg/media-centre/details/singapore-to-award-licences-for-methanol-bunkering",
    },
  ]),
  ...forPort("Port of Shanghai", [
    {
      kpi: "shore_power",
      initiative:
        "SIPG's chairman said in June 2025 that shore power now covers all of Shanghai Port's container terminals, and that carbon emissions per TEU have fallen by nearly 24% since 2020.",
      initiative_url:
        "https://www.ics-shipping.org/news-item/gu-jinshan-shaping-port-strategy/",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "SIPG's bunkering vessel Haigang Zhiyuan carried out China's first ship-to-ship green methanol bunkering at Yangshan in April 2024, and in March 2025 supplied about 2,900 t of domestically produced green methanol to the container ship HMM Green.",
      initiative_url:
        "https://english.shanghai.gov.cn/en-GreenShipping-ShippingCenter/20250407/9f6eab4364ac42c89cc9832816082ce5.html",
    },
    {
      kpi: "equipment_electrification",
      initiative:
        "Luojing Container Terminal Phase I opened in August 2024 with a design capacity of 2.6 million TEU a year. All its equipment is electric, including 14 automated quay cranes, 31 automated rail-mounted gantries and 90 automated intelligent vehicles.",
      initiative_url: "https://en.portshanghai.com.cn/LatestNews/4018.jhtml",
    },
  ]),
  ...forPort("Busan Port", [
    {
      kpi: "carbon_intensity",
      initiative:
        "In April 2022 Busan Port Authority announced a plan to make Busan Port carbon neutral by 2050, with an interim goal of halving public-sector greenhouse gas emissions by 2030.",
      initiative_url:
        "https://www.ship-technology.com/news/busan-port-authority-carbon-neutrality/",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "In October 2024 Busan Port Authority completed Busan New Port's first hydrogen refuelling station for large cargo trucks, with a reported capacity of 180 kg per hour.",
      initiative_url:
        "https://fuelcellsworks.com/2024/10/14/fuel-cells/korea-busan-new-port-completes-first-hydrogen-refueling-station-for-cargo-trucks",
    },
    {
      kpi: "green_tugs",
      initiative:
        "Busan Port Authority's battery-electric port guide ferry E-Green entered service in late 2025. It carries 88 passengers on two 1,068 kWh battery packs and replaced a 28-year-old diesel vessel.",
      initiative_url:
        "https://www.bairdmaritime.com/passenger/ferry/vessel-review-e-green-electric-guide-ferry-enters-service-at-south-koreas-busan-port",
    },
  ]),

  // Middle East
  ...forPort("Jeddah Islamic Port", [
    {
      kpi: "carbon_intensity",
      initiative:
        "At the March 2025 inauguration of the expanded South Container Terminal (4 million TEU capacity), DP World set a goal of cutting the terminal's CO2 emissions by 50% within five years through electrified yard cranes and trucks, solar panels and water recycling.",
      initiative_url:
        "https://www.dpworld.com/en/news/dp-world-and-mawani-inaugurate-800-million-state-of-the-art-terminal-in-jeddah",
    },
    {
      kpi: "renewable_share",
      initiative:
        "The 225,000 m² Maersk Logistics Park at Jeddah Islamic Port opened in August 2024. It is designed to draw up to 70% of its electricity from 32,000 rooftop solar panels.",
      initiative_url:
        "https://www.saudigulfprojects.com/2024/08/maersk-mawani-inaugurates-logistics-park-at-jeddah-islamic-port/",
    },
  ]),
  ...forPort("Jebel Ali Port", [
    {
      kpi: "equipment_electrification",
      initiative:
        "DP World grew Jebel Ali's fleet of electric internal terminal vehicles from 14 in December 2024 to 146 by October 2025, cutting the terminal's greenhouse gas emissions by over 10%.",
      initiative_url:
        "https://www.dpworld.com/en/news/releases/uae/jebel-ali-port-expands-electric-fleet-10x-slashing-emissions",
    },
    {
      kpi: "renewable_share",
      initiative:
        "Since 2023 DP World's UAE operations, including Jebel Ali Port, have used 100% renewable electricity through DEWA renewable energy certificates from the Mohammed bin Rashid Al Maktoum Solar Park, cutting its UAE carbon emissions by about 47%.",
      initiative_url:
        "https://www.dpworld.com/en/news/dp-world-slashes-carbon-emissions-in-uae-by-accessing-renewable-energy",
    },
  ]),
  ...forPort("Hamad Port", [
    {
      kpi: "carbon_intensity",
      initiative:
        "Terminal operator QTerminals is the first company in Qatar to commit to Science Based Targets initiative validation, with a target of cutting CO2 emissions by 42% by 2030.",
      initiative_url:
        "https://middleeast.breakbulk.com/articles/qterminals-champions-green-innovation",
    },
    {
      kpi: "renewable_share",
      initiative:
        "QTerminals has installed 864 solar panels on the reefer gantries at Hamad Port, generating about 486 kW for the terminal grid, and plans to expand to 4.2 MW of solar capacity.",
      initiative_url:
        "https://middleeast.breakbulk.com/articles/qterminals-champions-green-innovation",
    },
    {
      kpi: "green_belt",
      initiative:
        "During construction of Hamad Port, at-risk marine life was relocated, including 139,117 mangroves, 4,257 m² of seagrass, 11,595 hard coral colonies and 121 m³ of reef.",
      initiative_url:
        "https://sustainableworldports.org/project/hamad-port-ensuring-sustainable-mega-port-development/",
    },
  ]),

  // The Americas
  ...forPort("Port of Los Angeles", [
    {
      kpi: "sulphur_air",
      initiative:
        "Under the San Pedro Bay Ports Clean Air Action Plan (adopted 2006, updated 2010 and 2017), the port's 2024 emissions inventory shows diesel particulate matter down 90%, sulphur oxides down 98% and nitrogen oxides down 73% compared with 2005.",
      initiative_url:
        "https://portoflosangeles.org/references/2025-news-releases/news_101625_air_emissions",
    },
    {
      kpi: "shore_power",
      initiative:
        "In June 2004 the port opened the world's first container terminal with Alternative Maritime Power (shore power), at Berth 100. It now has 80 shore power vaults across its container and cruise berths, more than any other port.",
      initiative_url:
        "https://www.portoflosangeles.org/environment/air-quality/alternative-maritime-power-(amp)",
    },
    {
      kpi: "green_hydrogen",
      initiative:
        "With Long Beach and Shanghai, the port released an implementation plan outline for a trans-Pacific Green Shipping Corridor in September 2023, aiming to demonstrate zero lifecycle-carbon container ships on the route by 2030.",
      initiative_url:
        "https://portoflosangeles.org/references/2023-news-releases/news_092223_green_shipping_corridor",
    },
  ]),
  ...forPort("Port of Long Beach", [
    {
      kpi: "equipment_electrification",
      initiative:
        "On 29 November 2023 a fleet of 33 battery-electric yard tractors entered service at SSA Terminals' Pier C, bringing zero-emission equipment to about 20% of the port's cargo-handling fleet.",
      initiative_url:
        "https://container-news.com/new-zero-emissions-yard-tractor-fleet-to-operate-at-port-of-long-beach/",
    },
    {
      kpi: "water",
      initiative:
        "In August 2009 the Long Beach and Los Angeles harbor commissions jointly adopted the Water Resources Action Plan, which targets the remaining water and sediment pollution sources in San Pedro Bay, including runoff from port land.",
      initiative_url:
        "https://portoflosangeles.org/environment/water-and-sediment-quality/water-resources-action-plan",
    },
    {
      kpi: "green_belt",
      initiative:
        "The port has provided more than $50 million for habitat restoration, including $11.4 million towards restoring the Bolsa Chica Wetlands.",
      initiative_url: "https://polb.com/port-info/green-port/",
    },
  ]),
  ...forPort("Port of New York and New Jersey", [
    {
      kpi: "carbon_intensity",
      initiative:
        "The Port Authority has committed to net-zero greenhouse gas emissions by 2050 with its tenants and partners. It publishes annual air emissions inventories and reports lower emissions over the past decade despite a 32% rise in cargo.",
      initiative_url:
        "https://www.panynj.gov/port/en/our-port/sustainability.html",
    },
    {
      kpi: "equipment_electrification",
      initiative:
        "In September 2026 the Port Authority and CALSTART launched $45 million in incentives, including up to $39 million in vouchers for zero-emission drayage trucks, yard tractors and chargers, and $5 million for up to five truck-charging hubs near the port.",
      initiative_url:
        "https://www.panynj.gov/port-authority/en/press-room/press-release-archives/2026-press-releases/port-authority-and-calstart-launch--45-million-electric-truck-an.html",
    },
    {
      kpi: "shore_power",
      initiative:
        "In November 2016 a $21 million shore power system became fully operational at the Brooklyn Cruise Terminal, the first on the US East Coast.",
      initiative_url:
        "https://shipandbunker.com/news/am/620521-shore-power-at-brooklyn-cruise-terminal-fully-operational-and-ready-for-ships",
    },
  ]),
  ...forPort("Port of Savannah", [
    {
      kpi: "equipment_electrification",
      initiative:
        "At Garden City Terminal, Georgia Ports Authority converted 19 diesel rubber-tyred gantry cranes to electric, electrified its ship-to-shore cranes, and electrified 104 refrigerated container racks with 2,496 slots.",
      initiative_url:
        "https://www.epa.gov/ports-initiative/georgia-ports-authority-reduces-diesel-emissions-improves-efficiency-and-saves",
    },
    {
      kpi: "shore_power",
      initiative:
        "In November 2024 the US EPA awarded Georgia Ports Authority $48.76 million under its Clean Ports Program for vessel shore power at Savannah and Brunswick and for replacing diesel terminal tractors with electric ones.",
      initiative_url:
        "https://www.epa.gov/newsreleases/epa-announces-48763746-clean-ports-investments-georgia-ports-authority",
    },
    {
      kpi: "carbon_intensity",
      initiative:
        "In June 2022 Georgia Ports Authority joined Green Marine, a voluntary certification programme that independently benchmarks its performance on greenhouse gases, spill prevention, waste and community relations.",
      initiative_url:
        "https://green-marine.org/stayinformed/news/georgia-ports-authority-joins-green-marine/",
    },
  ]),
  ...forPort("PortMiami", [
    {
      kpi: "shore_power",
      initiative:
        "In 2024 PortMiami and Florida Power & Light brought shore power into service at five cruise terminals. The system delivers up to 45 MW and can serve three ships at once.",
      initiative_url:
        "https://newsroom.fpl.com/FPLs-shore-power-revolutionizes-cruise-industry",
    },
    {
      kpi: "green_belt",
      initiative:
        "PortMiami has funded the outplanting of about 10,000 staghorn coral colonies with the University of Miami, and restored 16.6 acres of seagrass in Biscayne Bay and 42.5 acres of mangroves at Oleta River State Park.",
      initiative_url: "https://www.miamidade.gov/portmiami/sustainability.page",
    },
    {
      kpi: "equipment_electrification",
      initiative:
        "PortMiami replaced the diesel engines on all nine of its gantry cranes with electric drives, and has bought only electric gantry cranes since.",
      initiative_url: "https://www.miamidade.gov/portmiami/sustainability.page",
    },
  ]),

  // Africa
  ...forPort("Port of Cape Town", [
    {
      kpi: "water",
      initiative:
        "In 2019, after Cape Town's drought, Transnet approved further studies for a seawater desalination plant at the port's Quay 700 area, sized at about 1-3 million litres a day for port use.",
      initiative_url:
        "https://www.engineeringnews.co.za/article/transnet-approves-desalination-studies-for-cape-town-harbour-2019-04-01",
    },
  ]),
  ...forPort("Rivers Port, Port Harcourt", [
    {
      kpi: "waste",
      initiative:
        "The Nigerian Ports Authority engaged African Circle Pollution Management under a Build-Operate-Transfer agreement to build and operate reception facilities for ship-generated waste at Rivers Port.",
      initiative_url: "https://nigerianports.gov.ng/rivers/",
    },
  ]),
];
