import type { City, District, Provider, Service } from "./types";

/**
 * Seed / demo data.
 *
 * Two jobs:
 *  1. It is the fallback the data layer serves when Supabase is not
 *     configured, so the app runs and demos with zero setup.
 *  2. It mirrors supabase/seed.sql, which loads the same reference data
 *     (cities, districts, services) into a real database.
 *
 * The PROVIDERS below are invented examples, flagged `is_demo`. They are
 * never presented as real businesses: the UI labels them, and their CR
 * numbers are obvious placeholders. Real providers only enter the
 * directory through Wathq verification.
 */

export const CITIES: City[] = [
  { id: "city-riyadh", slug: "riyadh", name_ar: "الرياض", name_en: "Riyadh" },
];

const D = (slug: string, ar: string, en: string): District => ({
  id: `district-${slug}`,
  city_id: "city-riyadh",
  slug,
  name_ar: ar,
  name_en: en,
});

export const DISTRICTS: District[] = [
  D("olaya", "العليا", "Al Olaya"),
  D("malaz", "الملز", "Al Malaz"),
  D("nakheel", "النخيل", "Al Nakheel"),
  D("yasmin", "الياسمين", "Al Yasmin"),
  D("narjis", "النرجس", "Al Narjis"),
  D("king-fahd", "الملك فهد", "King Fahd"),
  D("sulimaniyah", "السليمانية", "Al Sulimaniyah"),
  D("rawdah", "الروضة", "Al Rawdah"),
  D("wurud", "الورود", "Al Wurud"),
  D("irqah", "عرقة", "Irqah"),
  D("aqiq", "العقيق", "Al Aqiq"),
  D("hittin", "حطين", "Hittin"),
  D("muruj", "المروج", "Al Muruj"),
  D("izdihar", "الازدهار", "Al Izdihar"),
  D("sahafah", "الصحافة", "Al Sahafah"),
  D("qurtubah", "قرطبة", "Qurtubah"),
  D("naseem", "النسيم", "Al Naseem"),
  D("shifa", "الشفا", "Al Shifa"),
];

const S = (
  slug: string,
  category: string,
  ar: string,
  en: string,
  descAr: string,
  descEn: string,
  min: number,
  max: number,
  recurring = false,
  order = 0,
): Service => ({
  id: `service-${slug}`,
  slug,
  category,
  name_ar: ar,
  name_en: en,
  description_ar: descAr,
  description_en: descEn,
  typical_price_min: min,
  typical_price_max: max,
  is_recurring: recurring,
  sort_order: order,
});

/**
 * AC first — Step 1 §04 ranked it the strongest consumer wedge: climate makes
 * it non-optional and the annual contract makes it recurring. The taxonomy is
 * deliberately generic so cleaning and plumbing are inserts, not a migration.
 */
export const SERVICES: Service[] = [
  S("ac-split-clean", "ac", "تنظيف مكيف سبليت", "Split AC deep clean",
    "تنظيف عميق للوحدة الداخلية والخارجية مع تعقيم المرشحات.",
    "Deep clean of indoor and outdoor units, including filter sanitising.",
    99, 150, false, 1),
  S("ac-window-clean", "ac", "تنظيف مكيف شباك", "Window AC clean",
    "فك وتنظيف وتعقيم مكيف الشباك.",
    "Removal, cleaning and sanitising of a window unit.",
    89, 120, false, 2),
  S("ac-repair", "ac", "إصلاح مكيف", "AC repair",
    "تشخيص وإصلاح الأعطال — لا يبرد، تسريب مياه، أصوات غير طبيعية.",
    "Diagnosis and repair — not cooling, water leaks, unusual noise.",
    150, 400, false, 3),
  S("ac-gas-refill", "ac", "تعبئة فريون", "Refrigerant refill",
    "فحص التسريب وتعبئة غاز التبريد.",
    "Leak check and refrigerant top-up.",
    150, 300, false, 4),
  S("ac-install", "ac", "تركيب مكيف", "AC installation",
    "تركيب وحدة جديدة مع التمديدات والتشغيل.",
    "New unit installation including pipework and commissioning.",
    200, 450, false, 5),
  S("ac-amc", "ac", "عقد صيانة سنوي", "Annual maintenance contract",
    "زيارات صيانة مجدولة على مدار السنة مع خصم على قطع الغيار.",
    "Scheduled maintenance visits across the year, with discounted parts.",
    500, 800, true, 6),
  S("ac-duct-clean", "ac", "تنظيف مجاري التكييف", "Duct cleaning",
    "تنظيف وتعقيم مجاري الهواء للمنازل والمكاتب.",
    "Cleaning and sanitising of air ducts for homes and offices.",
    300, 800, false, 7),
  S("water-tank-clean", "cleaning", "تنظيف خزانات المياه", "Water tank cleaning",
    "تنظيف وتعقيم الخزان مع شهادة.",
    "Tank cleaning and sanitising, with a certificate.",
    200, 400, true, 8),
  S("home-clean", "cleaning", "تنظيف منازل", "Home cleaning",
    "تنظيف شامل بالساعة أو بالعقد الشهري.",
    "Full clean, hourly or on a monthly contract.",
    99, 400, true, 9),
];

const P = (
  slug: string,
  ar: string,
  en: string,
  aboutAr: string,
  aboutEn: string,
  services: string[],
  districts: string[],
  rating: number,
  jobs: number,
): Provider => ({
  id: `provider-${slug}`,
  slug,
  name_ar: ar,
  name_en: en,
  about_ar: aboutAr,
  about_en: aboutEn,
  city_id: "city-riyadh",
  cr_number: "10XXXXXXXX",
  cr_verified_at: null,
  status: "active",
  rating,
  jobs_completed: jobs,
  credit_balance: 10,
  service_slugs: services,
  district_slugs: districts,
  is_demo: true,
});

export const PROVIDERS: Provider[] = [
  P("demo-nasim", "مؤسسة نسيم الشمال للتكييف", "Nasim Al Shamal AC (demo)",
    "مثال توضيحي — بيانات غير حقيقية.",
    "Illustrative example — not a real business.",
    ["ac-split-clean", "ac-repair", "ac-gas-refill", "ac-amc"],
    ["olaya", "sulimaniyah", "malaz", "wurud"], 4.6, 128),
  P("demo-burudah", "شركة البرودة الذكية", "Smart Cooling Co (demo)",
    "مثال توضيحي — بيانات غير حقيقية.",
    "Illustrative example — not a real business.",
    ["ac-split-clean", "ac-install", "ac-duct-clean", "ac-amc"],
    ["nakheel", "yasmin", "narjis", "sahafah"], 4.4, 96),
  P("demo-itqan", "مؤسسة إتقان للصيانة", "Itqan Maintenance (demo)",
    "مثال توضيحي — بيانات غير حقيقية.",
    "Illustrative example — not a real business.",
    ["ac-repair", "ac-window-clean", "water-tank-clean"],
    ["naseem", "malaz", "shifa", "qurtubah"], 4.2, 71),
  P("demo-jazeera", "الجزيرة لخدمات التكييف", "Al Jazeera AC Services (demo)",
    "مثال توضيحي — بيانات غير حقيقية.",
    "Illustrative example — not a real business.",
    ["ac-split-clean", "ac-gas-refill", "ac-repair", "ac-duct-clean"],
    ["king-fahd", "olaya", "izdihar", "muruj"], 4.7, 204),
  P("demo-safwa", "الصفوة للتنظيف والصيانة", "Al Safwa Clean & Maintain (demo)",
    "مثال توضيحي — بيانات غير حقيقية.",
    "Illustrative example — not a real business.",
    ["home-clean", "water-tank-clean", "ac-split-clean"],
    ["rawdah", "hittin", "aqiq", "irqah"], 4.1, 58),
  P("demo-riyadh-cool", "الرياض كول للتكييف", "Riyadh Cool (demo)",
    "مثال توضيحي — بيانات غير حقيقية.",
    "Illustrative example — not a real business.",
    ["ac-amc", "ac-install", "ac-split-clean"],
    ["yasmin", "narjis", "sahafah", "qurtubah", "nakheel"], 4.5, 143),
];
