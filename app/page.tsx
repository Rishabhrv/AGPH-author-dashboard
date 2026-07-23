"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Download,
  LifeBuoy,
  MessageSquare,
  PlusCircle,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";

/* ------------------------------------------------------------------------ */
/*  TYPES — keep these stable; only the DATA below should change later      */
/* ------------------------------------------------------------------------ */

interface SalesTrendPoint {
  date: string; // YYYY-MM-DD
  label: string; // short display label, e.g. "Jul 9"
  sales: number;
  revenue: number;
}

interface PlatformShare {
  name: string;
  value: number; // percentage, should sum to ~100 across the array
  color: string;
}

interface ActivityItem {
  id: string;
  type: "sale" | "milestone" | "review";
  title: string;
  description: string;
  amount?: number;
  dateKey: string; // YYYY-MM-DD, used to match the calendar filter
  timeLabel: string;
}

interface PipelineBook {
  id: string;
  title: string;
  stage: string;
  progress: number; // 0-100
  needsAttention: boolean;
  eta: string;
}

interface TopBook {
  id: string;
  title: string;
  unitsSold: number;
  revenue: number;
  rating: number;
}

/* ------------------------------------------------------------------------ */
/*  DUMMY DATA — replace with API/DB-backed data later                      */
/* ------------------------------------------------------------------------ */

const AUTHOR = {
  name: "Rohan Mehta",
  initials: "RM",
  tier: "Bestselling Author",
  memberSince: "2022",
};

const STATS = {
  thisMonthEarnings: 42850,
  lastMonthEarnings: 36120,
  lifetimeEarnings: 687400,
  booksInPipeline: 6,
  publishedBooks: 14,
  payoutProgress: 68,
  payoutThreshold: 50000,
  nextPayoutDate: "Aug 1, 2026",
  monthlyGoal: 60000,
  pendingActions: 3,
};

const SALES_TREND: SalesTrendPoint[] = [
  { date: "2026-07-09", label: "Jul 9", sales: 8, revenue: 2150 },
  { date: "2026-07-10", label: "Jul 10", sales: 11, revenue: 2980 },
  { date: "2026-07-11", label: "Jul 11", sales: 9, revenue: 2430 },
  { date: "2026-07-12", label: "Jul 12", sales: 14, revenue: 3820 },
  { date: "2026-07-13", label: "Jul 13", sales: 17, revenue: 4650 },
  { date: "2026-07-14", label: "Jul 14", sales: 13, revenue: 3540 },
  { date: "2026-07-15", label: "Jul 15", sales: 19, revenue: 5120 },
];

const PLATFORM_BREAKDOWN: PlatformShare[] = [
  { name: "Amazon", value: 46, color: "#6366f1" },
  { name: "AGPH Store", value: 28, color: "#f59e0b" },
  { name: "Flipkart", value: 18, color: "#10b981" },
  { name: "Ebook", value: 8, color: "#8b5cf6" },
];

// Sparse daily sales counts used to light up the calendar. Only past/today
// dates carry data — future dates in the month are intentionally blank.
const CALENDAR_SALES: Record<string, number> = {
  "2026-07-01": 4,
  "2026-07-02": 6,
  "2026-07-03": 2,
  "2026-07-05": 9,
  "2026-07-06": 3,
  "2026-07-08": 7,
  "2026-07-09": 8,
  "2026-07-10": 11,
  "2026-07-11": 9,
  "2026-07-12": 14,
  "2026-07-13": 17,
  "2026-07-14": 13,
  "2026-07-15": 19,
};

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "sale", title: 'New sale — "The Silent Orchard"', description: "Paperback purchased via Amazon", amount: 349, dateKey: "2026-07-15", timeLabel: "10:42 AM" },
  { id: "a2", type: "milestone", title: "1,000 copies sold!", description: '"Whispers of Malwa" crossed 1,000 units lifetime', dateKey: "2026-07-15", timeLabel: "9:15 AM" },
  { id: "a3", type: "sale", title: 'New sale — "Whispers of Malwa"', description: "Ebook purchased via AGPH Store", amount: 199, dateKey: "2026-07-14", timeLabel: "6:03 PM" },
  { id: "a4", type: "review", title: "New 5-star review", description: '"The Silent Orchard" received a glowing review', dateKey: "2026-07-14", timeLabel: "2:20 PM" },
  { id: "a5", type: "sale", title: 'New sale — "Bhopal Nights"', description: "Paperback purchased via Flipkart", amount: 299, dateKey: "2026-07-13", timeLabel: "11:47 AM" },
  { id: "a6", type: "sale", title: 'New sale — "The Silent Orchard"', description: "Hardcover purchased via Amazon", amount: 499, dateKey: "2026-07-12", timeLabel: "4:10 PM" },
  { id: "a7", type: "milestone", title: "Cover approved", description: '"Letters from the Narmada" moved to Formatting', dateKey: "2026-07-11", timeLabel: "1:00 PM" },
  { id: "a8", type: "review", title: "New 4-star review", description: '"Bhopal Nights" received a new reader review', dateKey: "2026-07-10", timeLabel: "8:30 AM" },
];

const PIPELINE_BOOKS: PipelineBook[] = [
  { id: "b1", title: "Letters from the Narmada", stage: "Printing", progress: 75, needsAttention: false, eta: "Jul 22, 2026" },
  { id: "b2", title: "The Glass Bazaar", stage: "Cover Design", progress: 45, needsAttention: true, eta: "Jul 29, 2026" },
  { id: "b3", title: "Monsoon Ledger", stage: "Writing", progress: 30, needsAttention: false, eta: "Aug 5, 2026" },
  { id: "b4", title: "Field Notes on Forgetting", stage: "Content Received", progress: 10, needsAttention: true, eta: "Aug 20, 2026" },
];

const TOP_BOOKS: TopBook[] = [
  { id: "t1", title: "The Silent Orchard", unitsSold: 2140, revenue: 318600, rating: 4.8 },
  { id: "t2", title: "Whispers of Malwa", unitsSold: 1560, revenue: 210400, rating: 4.6 },
  { id: "t3", title: "Bhopal Nights", unitsSold: 980, revenue: 142200, rating: 4.4 },
];

/* ------------------------------------------------------------------------ */
/*  HELPERS                                                                  */
/* ------------------------------------------------------------------------ */

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const pctChange = (current: number, previous: number) =>
  previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Builds a Sun-Sat week matrix for a given month, with nulls for blank cells. */
function getMonthMatrix(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (Date | null)[][] = [];
  let day = 1 - startWeekday;
  while (day <= daysInMonth) {
    const week: (Date | null)[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null);
      day++;
    }
    weeks.push(week);
  }
  return weeks;
}

const TODAY = new Date("2026-07-15T00:00:00");

const ACTIVITY_STYLES: Record<ActivityItem["type"], { icon: typeof CheckCircle2; iconClass: string; bgClass: string }> = {
  sale: { icon: DollarSign, iconClass: "text-emerald-600", bgClass: "bg-emerald-50" },
  milestone: { icon: Sparkles, iconClass: "text-indigo-600", bgClass: "bg-indigo-50" },
  review: { icon: Star, iconClass: "text-amber-500", bgClass: "bg-amber-50" },
};

/* ------------------------------------------------------------------------ */
/*  SMALL PRESENTATIONAL COMPONENTS                                          */
/* ------------------------------------------------------------------------ */

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title?: string;
  icon?: typeof CheckCircle2;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  trend?: number;
  icon: typeof DollarSign;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <div className="rounded-lg bg-indigo-50 p-2">
          <Icon className="h-4 w-4 text-indigo-600" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
        {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*  CALENDAR WIDGET                                                          */
/* ------------------------------------------------------------------------ */

function CalendarWidget({
  monthDate,
  onMonthChange,
  selectedKey,
  onSelectKey,
}: {
  monthDate: Date;
  onMonthChange: (next: Date) => void;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <SectionCard
      title="Sales Calendar"
      icon={CalendarDays}
      action={
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMonthChange(new Date(year, month - 1, 1))}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-28 text-center text-xs font-medium text-slate-600">{monthLabel}</span>
          <button
            onClick={() => onMonthChange(new Date(year, month + 1, 1))}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} className="h-9" />;
              const key = toDateKey(date);
              const sales = CALENDAR_SALES[key];
              const isFuture = date > TODAY;
              const isToday = key === toDateKey(TODAY);
              const isSelected = key === selectedKey;
              return (
                <button
                  key={di}
                  disabled={isFuture}
                  onClick={() => onSelectKey(isSelected ? null : key)}
                  className={`relative h-9 rounded-lg text-xs transition ${isFuture
                    ? "cursor-default text-slate-300"
                    : "text-slate-700 hover:bg-indigo-50"
                    } ${isSelected ? "bg-indigo-600 text-white hover:bg-indigo-600" : ""} ${isToday && !isSelected ? "ring-1 ring-inset ring-indigo-400" : ""
                    }`}
                >
                  {date.getDate()}
                  {sales !== undefined && (
                    <span
                      className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"
                        }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Days with sales
        </span>
        {selectedKey && (
          <button onClick={() => onSelectKey(null)} className="font-medium text-indigo-600 hover:text-indigo-700">
            Clear filter
          </button>
        )}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------ */
/*  MAIN PAGE                                                                */
/* ------------------------------------------------------------------------ */

export default function DashboardPage() {
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 6, 1));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const earningsTrend = pctChange(STATS.thisMonthEarnings, STATS.lastMonthEarnings);
  const goalProgress = Math.min(100, Math.round((STATS.thisMonthEarnings / STATS.monthlyGoal) * 100));

  const filteredActivity = useMemo(
    () => (selectedDateKey ? RECENT_ACTIVITY.filter((a) => a.dateKey === selectedDateKey) : RECENT_ACTIVITY),
    [selectedDateKey]
  );

  const weekRevenue = SALES_TREND.reduce((sum, p) => sum + p.revenue, 0);
  const weekSales = SALES_TREND.reduce((sum, p) => sum + p.sales, 0);

  return (
    <AppShell active="Dashboard">
      <div className="min-h-screen ">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* HERO                                                              */}
          {/* ---------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-ink to-ink/90 px-6 py-8 sm:px-10 sm:py-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-pink/20 rounded-full blur-3xl translate-y-1/2" />
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold text-white ring-1 ring-white/30">
                    {AUTHOR.initials}
                  </div>
                  <div>
                    <p className="text-sm text-white">Welcome back,</p>
                    <h1 className="text-xl font-semibold text-white sm:text-2xl">{AUTHOR.name}</h1>
                  </div>
                </div>
                <p className="mt-4 max-w-md text-sm text-white">
                  Here's everything happening across your books today — earnings, sales momentum, and what needs your attention.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white">
                  <span className="rounded-full bg-white/15 px-3 py-1 font-medium">{AUTHOR.tier}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1">Member since {AUTHOR.memberSince}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1">{STATS.publishedBooks} published books</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Link
                  href="/sales"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/30 hover:bg-white/25"
                >
                  View Full Sales Report <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* PENDING ACTIONS BANNER                                            */}
          {/* ---------------------------------------------------------------- */}
          {STATS.pendingActions > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-sm text-amber-800">
                  You have <span className="font-semibold">{STATS.pendingActions} items</span> that need your attention across your book pipeline.
                </p>
              </div>
              <Link href="/books" className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-900">
                Review now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* KPI CARDS                                                         */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="This Month"
              value={formatINR(STATS.thisMonthEarnings)}
              trend={earningsTrend}
              sublabel="vs last month"
              icon={DollarSign}
            />
            <StatCard label="Lifetime Earnings" value={formatINR(STATS.lifetimeEarnings)} sublabel="all-time, all platforms" icon={Wallet} />
            <StatCard
              label="Books in Pipeline"
              value={String(STATS.booksInPipeline)}
              sublabel={`${STATS.publishedBooks} already published`}
              icon={BookOpen}
            />
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Payout Progress</span>
                <div className="rounded-lg bg-indigo-50 p-2">
                  <Wallet className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">{STATS.payoutProgress}%</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${STATS.payoutProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">Next payout {STATS.nextPayoutDate}</p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* CHARTS ROW                                                        */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <SectionCard
              title="7-Day Sales Trend"
              icon={TrendingUp}
              className="xl:col-span-2"
              action={
                <span className="text-xs text-slate-500">
                  {weekSales} units · {formatINR(weekRevenue)}
                </span>
              }
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === "revenue" ? [formatINR(value), "Revenue"] : [value, "Units sold"]
                      }
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Platform Breakdown" icon={BookOpen}>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PLATFORM_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={2}>
                      {PLATFORM_BREAKDOWN.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, ""]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {PLATFORM_BREAKDOWN.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                    <span className="font-medium text-slate-800">{p.value}%</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* CALENDAR + ACTIVITY ROW                                           */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <CalendarWidget
              monthDate={calendarMonth}
              onMonthChange={setCalendarMonth}
              selectedKey={selectedDateKey}
              onSelectKey={setSelectedDateKey}
            />

            <SectionCard
              title="Recent Activity"
              icon={Clock3}
              className="xl:col-span-2"
              action={
                selectedDateKey ? (
                  <span className="text-xs font-medium text-indigo-600">
                    Filtered to {new Date(selectedDateKey).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">{RECENT_ACTIVITY.length} updates</span>
                )
              }
            >
              {filteredActivity.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No activity on this day.</p>
              ) : (
                <div className="space-y-4">
                  {filteredActivity.map((item) => {
                    const style = ACTIVITY_STYLES[item.type];
                    const Icon = style.icon;
                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${style.bgClass}`}>
                          <Icon className={`h-4 w-4 ${style.iconClass}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                            {item.amount !== undefined && (
                              <span className="shrink-0 text-sm font-semibold text-emerald-600">+{formatINR(item.amount)}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">{item.timeLabel}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* PIPELINE + TOP BOOKS + QUICK ACTIONS ROW                          */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard
              title="Book Pipeline"
              icon={BookOpen}
              action={
                <Link href="/books" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  View all
                </Link>
              }
            >
              <div className="space-y-4">
                {PIPELINE_BOOKS.map((book) => (
                  <div key={book.id}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-800">{book.title}</p>
                      {book.needsAttention && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                          <AlertTriangle className="h-3 w-3" /> Action needed
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${book.needsAttention ? "bg-rose-400" : "bg-indigo-500"}`}
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400">{book.stage}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">ETA {book.eta}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Top Performing Books"
              icon={Star}
              action={
                <Link href="/reviews" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  All reviews
                </Link>
              }
            >
              <div className="space-y-4">
                {TOP_BOOKS.map((book, i) => (
                  <div key={book.id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{book.title}</p>
                      <p className="text-xs text-slate-500">
                        {book.unitsSold.toLocaleString("en-IN")} units · {formatINR(book.revenue)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {book.rating}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Quick Actions" icon={Sparkles}>
              <div className="space-y-2">
                <Link
                  href="/sales"
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-2.5 text-sm text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-slate-400" /> Export sales CSV
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
                </Link>
                <Link
                  href="/community"
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-2.5 text-sm text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400" /> Post a community update
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
                </Link>
                <Link
                  href="/support"
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-2.5 text-sm text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <span className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4 text-slate-400" /> Raise a support ticket
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
                </Link>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Monthly goal</span>
                  <span className="text-slate-500">
                    {formatINR(STATS.thisMonthEarnings)} / {formatINR(STATS.monthlyGoal)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${goalProgress}%` }} />
                </div>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {goalProgress}% of this month's goal reached
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}