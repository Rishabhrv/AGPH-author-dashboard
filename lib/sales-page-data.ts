// lib/sales-page-data.ts

export type PlatformKey = "amazon" | "flipkart" | "website";
export type SaleFormat = "Print" | "Ebook";

export interface PlatformStat {
  key: PlatformKey;
  label: string;
  units: number;
  grossRevenue: number;
  platformFee: number;
  royalty: number;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  bookTitle: string;
  platform: string;
  // Only meaningful for the "website" platform — Amazon/Flipkart sales are
  // always physical listings on those marketplaces.
  format?: SaleFormat;
  units: number;
  price: number;
  royalty: number;
}

export interface DailyPoint {
  date: string;
  units: number;
  earnings: number;
}

export interface StateData {
  state: string;
  value: number; // Total units
  amazon: number;
  flipkart: number;
  website: number;
  cx: string;
  cy: string;
}

export interface BookSummary {
  title: string;
  stage: string;
  unitsSold: number;
  rating: number;
  coverGradient: string;
  stateDistribution: StateData[];
}

export interface SalesDashboardSnapshot {
  date: string;
  totalEarnings: number;
  monthEarnings: number;
  payoutThreshold: number;
  payoutProgress: number;
  nextPayoutDate: string;
  nextPayoutStatus: "Scheduled" | "Processing" | "Pending threshold";
  tdsRate: number;
  platformBreakdown: PlatformStat[];
  transactions: Transaction[];
  books: BookSummary[];
}

// ---------- Internal Generators ----------

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function makeRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length) % items.length];
}

function between(rand: () => number, min: number, max: number) {
  return min + rand() * (max - min);
}

const AUTHOR_SEED = hashString("sales-dashboard-author");

const BOOK_TITLES = [
  "The Silent Orchard",
  "Beyond the Ganges",
  "Whispers of Malwa",
  "The Last Manuscript",
  "Monsoon Diaries",
  "Ashes of Avantika",
  "The Cartographer's Daughter",
  "Songs from the Narmada",
  "The Ink of Forgotten Kings",
];

const STAGES = [
  "Content Received",
  "ISBN Assigned",
  "Writing",
  "Cover Design",
  "Digital Proof",
  "Corrections",
  "Author Approved",
  "Printing",
  "Dispatched",
  "Listed on Platforms",
];

// Only 3 real sales channels. Ebook is NOT its own platform — it's a format
// sold through the AGPH website, so it lives inside "website" via the
// per-transaction `format` field instead of getting its own PlatformKey.
export const PLATFORM_META: Record<PlatformKey, { label: string; feeRate: number; royaltyShare: number; color: string }> = {
  amazon: { label: "Amazon", feeRate: 0.4, royaltyShare: 0.7, color: "#17171A" },
  flipkart: { label: "Flipkart", feeRate: 0.45, royaltyShare: 0.65, color: "#17171A99" },
  website: { label: "Website (AGPH)", feeRate: 0.15, royaltyShare: 0.9, color: "#17171A66" },
};

const COVERS = [
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
  "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  "linear-gradient(135deg, #f9d976 0%, #f39f86 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)",
];

const STATES = [
  { state: "Maharashtra", cx: "32%", cy: "60%" },
  { state: "Delhi", cx: "39%", cy: "28%" },
  { state: "Karnataka", cx: "34%", cy: "72%" },
  { state: "Tamil Nadu", cx: "41%", cy: "85%" },
  { state: "Uttar Pradesh", cx: "48%", cy: "38%" },
  { state: "West Bengal", cx: "69%", cy: "51%" },
  { state: "Gujarat", cx: "18%", cy: "50%" },
];

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return iso === todayISO() ? `Today · ${label}` : label;
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function generateTransactionsForDate(dateISO: string): Transaction[] {
  const rand = makeRandom(hashString(dateISO));
  const count = Math.floor(between(rand, 2, 9));
  const list: Transaction[] = [];
  const platformKeys = Object.keys(PLATFORM_META) as PlatformKey[]; // [amazon, flipkart, website]

  for (let i = 0; i < count; i++) {
    const r = rand();
    let platformKey = platformKeys[0]; // amazon
    if (r > 0.5) platformKey = platformKeys[1]; // flipkart
    if (r > 0.8) platformKey = platformKeys[2]; // website

    const meta = PLATFORM_META[platformKey];
    const title = pick(rand, BOOK_TITLES);
    const units = Math.max(1, Math.round(between(rand, 1, 3)));
    const price = Math.round(between(rand, 249, 599));
    const gross = price * units;
    const royalty = Math.round(gross * (1 - meta.feeRate) * meta.royaltyShare);

    // Only the website sells both formats; Amazon/Flipkart listings are print-only here.
    const format: SaleFormat | undefined =
      platformKey === "website" ? (rand() > 0.55 ? "Ebook" : "Print") : undefined;

    list.push({
      id: `${dateISO}-${i}`,
      date: dateISO,
      bookTitle: title,
      platform: meta.label,
      format,
      units,
      price,
      royalty,
    });
  }
  return list;
}

// Generates deterministic synthetic transactions across any inclusive date span.
// Capped at ~10 years as a runaway-loop guard.
export function getTransactionsInRange(startISO: string, endISOInclusive: string): Transaction[] {
  const txns: Transaction[] = [];
  let cursor = startISO;
  let guard = 0;
  while (cursor <= endISOInclusive && guard < 3660) {
    txns.push(...generateTransactionsForDate(cursor));
    cursor = addDays(cursor, 1);
    guard++;
  }
  return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function get30DayTransactions(endDateISO: string): Transaction[] {
  return getTransactionsInRange(addDays(endDateISO, -29), endDateISO);
}

export function summarizePlatforms(transactions: Transaction[]): PlatformStat[] {
  const totals: Record<PlatformKey, PlatformStat> = {} as Record<PlatformKey, PlatformStat>;
  (Object.keys(PLATFORM_META) as PlatformKey[]).forEach((key) => {
    const meta = PLATFORM_META[key];
    totals[key] = { key, label: meta.label, units: 0, grossRevenue: 0, platformFee: 0, royalty: 0, color: meta.color };
  });
  transactions.forEach((t) => {
    const key = (Object.keys(PLATFORM_META) as PlatformKey[]).find((k) => PLATFORM_META[k].label === t.platform)!;
    const meta = PLATFORM_META[key];
    const gross = t.price * t.units;
    totals[key].units += t.units;
    totals[key].grossRevenue += gross;
    totals[key].platformFee += Math.round(gross * meta.feeRate);
    totals[key].royalty += t.royalty;
  });
  return Object.values(totals);
}

export function getSalesDashboardSnapshot(dateISO: string): SalesDashboardSnapshot {
  const identityRand = makeRandom(AUTHOR_SEED);

  const books: BookSummary[] = BOOK_TITLES.map((title, i) => {
    const dist = [...STATES].sort(() => 0.5 - identityRand()).slice(0, 5).map(s => {
      // Calculate total units first
      const totalValue = Math.floor(between(identityRand, 50, 300));
      
      // Distribute the total across platforms
      const amazon = Math.floor(totalValue * 0.45);
      const flipkart = Math.floor(totalValue * 0.35);
      const website = totalValue - amazon - flipkart;

      return {
        ...s,
        value: totalValue,
        amazon,
        flipkart,
        website
      };
    }).sort((a, b) => b.value - a.value);

    return {
      title,
      stage: i === 0 || i === 1 ? "Live on Platforms" : pick(identityRand, STAGES),
      unitsSold: Math.round(between(identityRand, 40, 620)),
      rating: Math.round(between(identityRand, 36, 49)) / 10,
      coverGradient: COVERS[i % COVERS.length],
      stateDistribution: dist
    };
  }).sort((a, b) => b.unitsSold - a.unitsSold);

  return {
    date: dateISO,
    totalEarnings: Math.round(between(identityRand, 68000, 142000)),
    monthEarnings: Math.round(between(identityRand, 8000, 15000)),
    payoutThreshold: 5000,
    payoutProgress: 100,
    nextPayoutDate: addDays(dateISO, 15),
    nextPayoutStatus: "Processing",
    tdsRate: 10,
    platformBreakdown: [], // Computed dynamically in the UI
    transactions: [], // Computed dynamically in the UI
    books,
  };
}

// ---------- CSV Export ----------

export function exportTransactionsAsCSV(transactions: Transaction[], filename = "sales-export.csv"): void {
  if (typeof window === "undefined") return;

  const headers = ["Date", "Book", "Platform", "Format", "Units", "Price (INR)", "Royalty (INR)"];
  const escapeCell = (value: string | number) => {
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const rows = transactions.map((t) =>
    [t.date, t.bookTitle, t.platform, t.format ?? "", t.units, t.price, t.royalty].map(escapeCell).join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  // BOM prefix so Excel opens it as UTF-8 cleanly
  const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}