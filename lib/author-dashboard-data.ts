// lib/author-dashboard-data.ts
//
// Mock data layer for the Author Dashboard main page.
// Every "date filtered" field is deterministically seeded from the selected
// date string, so the same date always returns the same numbers (no
// flicker/re-randomizing on re-render) while different dates genuinely look
// different. "Identity" fields (rating, leaderboard rank, top book) are
// seeded from a stable author id instead, since those represent the
// author's current standing rather than something that happened on one day.
//
// TODO: once the Flask backend is wired up, replace the body of
// getDashboardSnapshot() with a fetch to something like
// GET /api/author/dashboard?date=YYYY-MM-DD and keep this file's types as
// the contract between frontend and API.

// ---------- Types ----------

export type PlatformKey = "amazon" | "flipkart" | "agphStore" | "ebook";

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
  date: string; // yyyy-mm-dd
  bookTitle: string;
  platform: string;
  units: number;
  price: number;
  royalty: number;
}

export type NotificationType = "sales" | "payout" | "review" | "rank" | "status";

export interface MilestoneNotification {
  id: string;
  time: string; // "09:40 a.m"
  type: NotificationType;
  title: string;
  detail: string;
  bg: "bg-yellow" | "bg-pink" | "bg-sage" | "bg-blue";
}

export interface DailyPoint {
  date: string;
  units: number;
  earnings: number;
}

export interface BookSummary {
  title: string;
  stage: string;
  unitsSold: number;
  rating: number;
}

export interface DashboardSnapshot {
  date: string;
  totalEarnings: number;
  monthEarnings: number;
  payoutThreshold: number;
  payoutProgress: number;
  nextPayoutDate: string;
  nextPayoutStatus: "Scheduled" | "Processing" | "Pending threshold";
  tdsRate: number;
  platformBreakdown: PlatformStat[];
  salesTrend: DailyPoint[];
  transactions: Transaction[];
  notifications: MilestoneNotification[];
  books: BookSummary[];
  topBook: BookSummary;
  featuredInProgressBook: BookSummary;
  leaderboard: { rank: number; scope: string; trend: "up" | "down" | "same"; delta: number };
  authorRating: {
    score: number;
    tier: "Bronze" | "Silver" | "Gold";
    totalBooksSold: number;
    reviewCount: number;
  };
}

// ---------- Deterministic seeding ----------

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

// ---------- Reference data ----------

const AUTHOR_SEED = hashString("author-current-session");

const BOOK_TITLES = [
  "The Silent Orchard",
  "Beyond the Ganges",
  "Whispers of Malwa",
  "The Last Manuscript",
  "Monsoon Diaries",
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

const PLATFORM_META: Record<
  PlatformKey,
  { label: string; feeRate: number; royaltyShare: number; color: string; weight: number }
> = {
  amazon: { label: "Amazon", feeRate: 0.4, royaltyShare: 0.7, color: "#17171A", weight: 0.5 },
  flipkart: { label: "Flipkart", feeRate: 0.45, royaltyShare: 0.65, color: "#17171A99", weight: 0.22 },
  agphStore: { label: "AGPH Store", feeRate: 0.15, royaltyShare: 0.9, color: "#17171A66", weight: 0.16 },
  ebook: { label: "Ebook", feeRate: 0.3, royaltyShare: 0.75, color: "#17171A40", weight: 0.12 },
};

export function todayISO(): string {
  return toISO(new Date());
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const label = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return iso === todayISO() ? `Today · ${label}` : label;
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toISO(date);
}

// ---------- Calendar math ----------

export interface CalendarCell {
  day: number | null;
  date: string | null;
}

export function getMonthMatrix(year: number, month: number): CalendarCell[][] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, date: null });

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    )
  );
}

export function weekLabelForRow(row: CalendarCell[]): string {
  const anchor = row[3]?.date ?? row.find((c) => c.date)?.date;
  if (!anchor) return "";
  const [y, m, d] = anchor.split("-").map(Number);
  return `W${isoWeekNumber(new Date(y, m - 1, d))}`;
}

// ---------- Generators ----------

function generateTransactionsForDate(dateISO: string): Transaction[] {
  const rand = makeRandom(hashString(dateISO));
  const count = Math.floor(between(rand, 0, 6.2)); // some dates land at 0 on purpose
  const list: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const platformKey = pick(rand, Object.keys(PLATFORM_META) as PlatformKey[]);
    const meta = PLATFORM_META[platformKey];
    const title = pick(rand, BOOK_TITLES);
    const units = Math.max(1, Math.round(between(rand, 1, 3.4)));
    const price = Math.round(between(rand, 249, 599));
    const gross = price * units;
    const royalty = Math.round(gross * (1 - meta.feeRate) * meta.royaltyShare);
    list.push({
      id: `${dateISO}-${i}`,
      date: dateISO,
      bookTitle: title,
      platform: meta.label,
      units,
      price,
      royalty,
    });
  }
  return list;
}

function summarizePlatforms(transactions: Transaction[]): PlatformStat[] {
  const totals: Record<PlatformKey, PlatformStat> = {} as Record<PlatformKey, PlatformStat>;
  (Object.keys(PLATFORM_META) as PlatformKey[]).forEach((key) => {
    const meta = PLATFORM_META[key];
    totals[key] = {
      key,
      label: meta.label,
      units: 0,
      grossRevenue: 0,
      platformFee: 0,
      royalty: 0,
      color: meta.color,
    };
  });
  transactions.forEach((t) => {
    const key = (Object.keys(PLATFORM_META) as PlatformKey[]).find(
      (k) => PLATFORM_META[k].label === t.platform
    )!;
    const meta = PLATFORM_META[key];
    const gross = t.price * t.units;
    totals[key].units += t.units;
    totals[key].grossRevenue += gross;
    totals[key].platformFee += Math.round(gross * meta.feeRate);
    totals[key].royalty += t.royalty;
  });
  return Object.values(totals);
}

function generateNotificationsForDate(dateISO: string, dayTotals: PlatformStat[]): MilestoneNotification[] {
  const rand = makeRandom(hashString(`notif-${dateISO}`));
  const notifications: MilestoneNotification[] = [];
  const totalUnits = dayTotals.reduce((sum, p) => sum + p.units, 0);
  const totalRoyalty = dayTotals.reduce((sum, p) => sum + p.royalty, 0);

  if (totalUnits > 0 && rand() > 0.35) {
    notifications.push({
      id: `${dateISO}-sales`,
      time: `${Math.floor(between(rand, 9, 20))}:${Math.floor(between(rand, 0, 59))
        .toString()
        .padStart(2, "0")} ${rand() > 0.5 ? "a.m" : "p.m"}`,
      type: "sales",
      title: `${totalUnits} ${totalUnits === 1 ? "copy" : "copies"} sold`,
      detail: `Across ${dayTotals.filter((p) => p.units > 0).length} platform(s), earning ${formatINR(
        totalRoyalty
      )}`,
      bg: "bg-yellow",
    });
  }
  if (rand() > 0.75) {
    const book = pick(rand, BOOK_TITLES);
    const stars = Math.floor(between(rand, 3, 5.9));
    notifications.push({
      id: `${dateISO}-review`,
      time: `${Math.floor(between(rand, 9, 20))}:${Math.floor(between(rand, 0, 59))
        .toString()
        .padStart(2, "0")} ${rand() > 0.5 ? "a.m" : "p.m"}`,
      type: "review",
      title: `New ${stars}★ review on '${book}'`,
      detail: "Left on Amazon",
      bg: "bg-pink",
    });
  }
  if (rand() > 0.85) {
    notifications.push({
      id: `${dateISO}-payout`,
      time: "10:00 a.m",
      type: "payout",
      title: `Payout of ${formatINR(between(rand, 3000, 9000))} processed`,
      detail: "Bank transfer · UPI",
      bg: "bg-blue",
    });
  }
  if (rand() > 0.88) {
    const book = pick(rand, BOOK_TITLES);
    const stage = pick(rand, STAGES);
    notifications.push({
      id: `${dateISO}-status`,
      time: "11:15 a.m",
      type: "status",
      title: `'${book}' status changed to '${stage}'`,
      detail: "Book Progress & Updates",
      bg: "bg-sage",
    });
  }
  return notifications;
}

export function getSalesTrend(dateISO: string, days = 7): DailyPoint[] {
  const points: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(dateISO, -i);
    const txns = generateTransactionsForDate(d);
    points.push({
      date: d,
      units: txns.reduce((sum, t) => sum + t.units, 0),
      earnings: txns.reduce((sum, t) => sum + t.royalty, 0),
    });
  }
  return points;
}

export function getDashboardSnapshot(dateISO: string): DashboardSnapshot {
  const transactions = generateTransactionsForDate(dateISO);
  const platformBreakdown = summarizePlatforms(transactions);
  const notifications = generateNotificationsForDate(dateISO, platformBreakdown);
  const salesTrend = getSalesTrend(dateISO, 7);

  const monthEarnings = salesTrend.reduce((sum, p) => sum + p.earnings, 0) * 4.3; // rough 30-day extrapolation
  const payoutThreshold = 5000;
  const payoutProgress = Math.min(100, Math.round((monthEarnings / payoutThreshold) * 100));

  const identityRand = makeRandom(AUTHOR_SEED);
  const totalEarnings = Math.round(between(identityRand, 68000, 142000));
  const totalBooksSold = Math.round(between(identityRand, 900, 2400));
  const reviewCount = Math.round(between(identityRand, 80, 340));
  const ratingScore = Math.round(between(identityRand, 38, 49)) / 10;
  const tier: DashboardSnapshot["authorRating"]["tier"] =
    ratingScore >= 4.5 ? "Gold" : ratingScore >= 4.0 ? "Silver" : "Bronze";

  const rank = Math.round(between(identityRand, 60, 180));
  const trend = pick(identityRand, ["up", "up", "down", "same"] as const);
  const delta = Math.round(between(identityRand, 2, 20));

  const books: BookSummary[] = BOOK_TITLES.map((title, i) => ({
    title,
    stage: i === 0 || i === 1 ? "Listed on Platforms" : pick(identityRand, STAGES),
    unitsSold: Math.round(between(identityRand, 40, 620)),
    rating: Math.round(between(identityRand, 36, 49)) / 10,
  })).sort((a, b) => b.unitsSold - a.unitsSold);

  const topBook = books[0];
  const featuredInProgressBook =
    books.find((b) => b.stage !== "Listed on Platforms") ?? books[books.length - 1];

  return {
    date: dateISO,
    totalEarnings,
    monthEarnings: Math.round(monthEarnings),
    payoutThreshold,
    payoutProgress,
    nextPayoutDate: addDays(dateISO, 30 - new Date(dateISO).getDate()),
    nextPayoutStatus: payoutProgress >= 100 ? "Processing" : payoutProgress > 60 ? "Scheduled" : "Pending threshold",
    tdsRate: 10,
    platformBreakdown,
    salesTrend,
    transactions,
    notifications,
    books,
    topBook,
    featuredInProgressBook,
    leaderboard: { rank, scope: "Madhya Pradesh", trend, delta },
    authorRating: { score: ratingScore, tier, totalBooksSold, reviewCount },
  };
}

export function exportTransactionsCSV(transactions: Transaction[], dateISO: string): void {
  const header = "Date,Book Title,Platform,Units,Price,Royalty\n";
  const rows = transactions
    .map((t) => `${t.date},"${t.bookTitle}",${t.platform},${t.units},${t.price},${t.royalty}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `agph-sales-${dateISO}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
