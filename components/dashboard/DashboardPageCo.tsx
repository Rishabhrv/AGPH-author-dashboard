"use client";

import { useMemo, useState, useEffect, type ReactNode } from "react";
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
  ExternalLink,
  FileText,
  LifeBuoy,
  MessageSquare,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------------ */
/*  TYPES                                                                    */
/* ------------------------------------------------------------------------ */

interface DashboardPageProps {
  profileData: any;
  salesData: any;
  reviewsData: any;
  booksProgress: any[];
}

interface SalesTrendPoint {
  date: string;
  label: string;
  sales: number;
  revenue: number;
}

interface PlatformShare {
  name: string;
  value: number;
  color: string;
  isPlaceholder?: boolean;
}

interface ActivityItem {
  id: string;
  type: "sale" | "milestone" | "review";
  title: string;
  description: string;
  amount?: number;
  dateKey: string;
  timeLabel: string;
  timestamp: number;
}

interface PipelineBook {
  id: string;
  title: string;
  stage: string;
  progress: number;
  needsAttention: boolean;
  correctionLink?: string;
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

function toDrivePreviewUrl(url: string): string {
  if (!url) return "";
  const match = url.match(/\/file\/d\/([^/?]+)/);
  if (match && match[1]) {
    return `/api/proxy-drive?fileId=${match[1]}`;
  }
  return url;
}

function PdfModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <FileText size={14} className="text-white" />
          </div>
          <span className="text-[14px] font-bold text-white tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full">
            <ExternalLink size={12} /> Open in Drive
          </a>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4 md:p-8">
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
          <iframe src={url} className="w-full h-full border-0" allow="autoplay" title={title} />
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_STYLES: Record<ActivityItem["type"], { icon: any; iconClass: string; bgClass: string }> = {
  sale: { icon: DollarSign, iconClass: "text-emerald-600", bgClass: "bg-emerald-50" },
  milestone: { icon: Sparkles, iconClass: "text-blue-600", bgClass: "bg-blue-50" },
  review: { icon: Star, iconClass: "text-[#275697]", bgClass: "bg-[#275697]/10" },
};

/* ------------------------------------------------------------------------ */
/*  COMPONENTS                                                               */
/* ------------------------------------------------------------------------ */

function SectionCard({ title, icon: Icon, action, children, className = "" }: { title?: string; icon?: any; action?: ReactNode; children: ReactNode; className?: string; }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-[#275697]" />}
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({ label, value, sublabel, trend, icon: Icon }: { label: string; value: string; sublabel?: string; trend?: number; icon: any; }) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{label}</span>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
          <Icon className="h-4 w-4 text-[#275697]" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-black text-slate-900">{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
        {sublabel && <span className="text-xs font-medium text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
}

function CalendarWidget({ monthDate, onMonthChange, selectedKey, onSelectKey, calendarSales }: { monthDate: Date; onMonthChange: (next: Date) => void; selectedKey: string | null; onSelectKey: (key: string | null) => void; calendarSales: Record<string, number> }) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const TODAY = new Date();

  return (
    <SectionCard
      title="Sales Calendar"
      icon={CalendarDays}
      action={
        <div className="flex items-center gap-1">
          <button onClick={() => onMonthChange(new Date(year, month - 1, 1))} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-28 text-center text-xs font-bold text-slate-700">{monthLabel}</span>
          <button onClick={() => onMonthChange(new Date(year, month + 1, 1))} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} className="h-9" />;
              const key = toDateKey(date);
              const sales = calendarSales[key];
              const isFuture = date > TODAY;
              const isToday = key === toDateKey(TODAY);
              const isSelected = key === selectedKey;
              return (
                <button
                  key={di}
                  disabled={isFuture}
                  onClick={() => onSelectKey(isSelected ? null : key)}
                  className={`relative h-9 rounded-md text-xs font-medium transition ${isFuture ? "cursor-default text-slate-300" : "text-slate-700 hover:bg-slate-100"} ${isSelected ? "bg-slate-800 text-white hover:bg-slate-800" : ""} ${isToday && !isSelected ? "ring-1 ring-inset ring-slate-300" : ""}`}
                >
                  {date.getDate()}
                  {sales !== undefined && sales > 0 && (
                    <span className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${isSelected ? "bg-[#275697]" : "bg-[#275697]"}`} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#275697]" /> Days with sales
        </span>
        {selectedKey && (
          <button onClick={() => onSelectKey(null)} className="font-bold text-slate-600 hover:text-slate-900">
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

export default function DashboardPageCo({ profileData, salesData, reviewsData, booksProgress }: DashboardPageProps) {
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

  // Author details
  const name = profileData?.authorName || profileData?.legalName || "Author";
  const initials = name.substring(0, 2).toUpperCase();

  const allTxns = salesData?.transactions || [];
  const allReviews = reviewsData?.reviews || [];
  const allBooks = booksProgress || [];

  // Data aggregations
  const { stats, salesTrend, platformShare, recentActivity, pipelineBooks, topBooks, calendarSales } = useMemo(() => {

    let lifetimeEarnings = 0;
    let thisMonthEarnings = 0;
    let lastMonthEarnings = 0;
    let weekSales = 0;
    let weekRevenue = 0;

    const currentMonthKey = toDateKey(today).slice(0, 7); // YYYY-MM
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthKey = toDateKey(prevMonthDate).slice(0, 7);

    // Calculate 7 days ago limit
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const platformTotals: Record<string, number> = {
      "Amazon": 0, "AGPH Store": 0, "Flipkart": 0, "Google Play": 0
    };
    const platformUnits: Record<string, number> = {
      "Amazon": 0, "AGPH Store": 0, "Flipkart": 0, "Google Play": 0
    };

    const trendMap: Record<string, SalesTrendPoint> = {};
    for (let i = 0; i < 7; i++) {
      let d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const k = toDateKey(d);
      trendMap[k] = { date: k, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), sales: 0, revenue: 0 };
    }

    const calSales: Record<string, number> = {};
    const bookEarnings: Record<string, { units: number; revenue: number; title: string }> = {};

    // 1. Process Transactions
    const activities: ActivityItem[] = [];

    allTxns.forEach((t: any) => {
      const gross = parseFloat(t.price) || 0;
      const units = parseInt(t.units) || 1;
      const dateKey = (t.date || "").slice(0, 10);

      lifetimeEarnings += gross;

      if (dateKey.startsWith(currentMonthKey)) thisMonthEarnings += gross;
      if (dateKey.startsWith(lastMonthKey)) lastMonthEarnings += gross;

      const txnDate = new Date(t.date);
      if (txnDate >= sevenDaysAgo) {
        if (trendMap[dateKey]) {
          trendMap[dateKey].sales += units;
          trendMap[dateKey].revenue += gross;
        }
        weekSales += units;
        weekRevenue += gross;
      }

      calSales[dateKey] = (calSales[dateKey] || 0) + units;

      const platLower = (t.platform || "").toLowerCase();
      let platKey = "AGPH Store";
      if (platLower.includes("amazon")) platKey = "Amazon";
      if (platLower.includes("flipkart")) platKey = "Flipkart";
      if (platLower.includes("google") || platLower.includes("play")) platKey = "Google Play";
      platformTotals[platKey] += gross;
      platformUnits[platKey] += units;

      const bTitle = t.bookTitle || t.book_title || "Unknown Book";
      if (!bookEarnings[t.book_id]) bookEarnings[t.book_id] = { units: 0, revenue: 0, title: bTitle };
      bookEarnings[t.book_id].units += units;
      bookEarnings[t.book_id].revenue += gross;

      // Activity item for sale
      activities.push({
        id: `sale-${t.id}`,
        type: "sale",
        title: `New sale — "${bTitle}"`,
        description: `Purchased via ${platKey}`,
        amount: gross,
        dateKey: dateKey,
        timeLabel: txnDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        timestamp: txnDate.getTime()
      });
    });

    // 2. Process Reviews for Activity
    allReviews.forEach((r: any) => {
      const rDate = new Date(r.created_at || r.scraped_at || r.isoDate || new Date().toISOString());
      const dateKey = toDateKey(rDate);
      activities.push({
        id: `rev-${r.id || r.review_id || Math.random()}`,
        type: "review",
        title: `New ${r.rating}-star review`,
        description: `"${r.book || "Your book"}" received a new review on ${r.platform || "Platform"}`,
        dateKey: dateKey,
        timeLabel: rDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        timestamp: rDate.getTime()
      });
    });

    activities.sort((a, b) => b.timestamp - a.timestamp);

    // 3. Process Books Progress
    const pipeBooks: PipelineBook[] = [];
    let publishedCount = 0;

    allBooks.forEach(b => {
      const hasStoreLinks = b.amazon_link || b.agph_link || b.flipkart_link || b.google_link;
      if (hasStoreLinks) {
        publishedCount++;
      } else {
        // Rough estimate of progress
        let progress = 10;
        let stage = "Content Received";
        if (b.writing_end) { stage = "Cover Design"; progress = 50; }
        else if (b.writing_start) { stage = "Writing"; progress = 30; }
        else if (b.isbn) { stage = "ISBN Assigned"; progress = 20; }

        const activeCorrections = (b.corrections || []).filter((c: any) => c.is_active);
        let needsAttention = activeCorrections.length > 0;
        let correctionLink = "";

        if (needsAttention) {
          const c = activeCorrections[0];
          if (c.section === "cover") {
            correctionLink = b.cover_pdf_link || "";
          } else if (c.section === "formatting" || c.section === "proofreading") {
            correctionLink = b.proof_pdf_link || "";
          }
        }

        pipeBooks.push({
          id: String(b.book_id),
          title: b.title || "Untitled",
          stage,
          progress,
          needsAttention,
          correctionLink: toDrivePreviewUrl(correctionLink),
          eta: "In Progress"
        });
      }
    });

    // 4. Calculate Top Books
    const sortedTopBooks = Object.keys(bookEarnings)
      .map(bid => {
        const b = bookEarnings[bid];
        // Find average rating from reviews if possible
        const bReviews = allReviews.filter((r: any) => r.book === b.title);
        const avgRating = bReviews.length > 0 ? (bReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / bReviews.length) : 0;
        return {
          id: bid,
          title: b.title,
          unitsSold: b.units,
          revenue: b.revenue,
          rating: Number(avgRating.toFixed(1))
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Platform share colors matching brand (Sky, Blue, Slate, Green)
    const PCOLORS: Record<string, string> = { "Amazon": "#1E3A8A", "AGPH Store": "#275697", "Flipkart": "#10B981", "Google Play": "#64748B" };
    const platformsArr: PlatformShare[] = Object.keys(platformUnits).filter(k => platformUnits[k] > 0).map(k => ({
      name: k,
      value: platformUnits[k],
      color: PCOLORS[k] || "#000"
    }));

    return {
      stats: {
        thisMonthEarnings,
        lastMonthEarnings,
        lifetimeEarnings,
        booksInPipeline: pipeBooks.length,
        publishedBooks: publishedCount,
        payoutProgress: 0, // Placeholder
        payoutThreshold: 5000,
        nextPayoutDate: "TBD",
        monthlyGoal: 10000,
        pendingActions: pipeBooks.filter(p => p.needsAttention).length,
      },
      salesTrend: Object.values(trendMap),
      platformShare: platformsArr.length > 0 ? platformsArr : [{ name: "No Sales", value: 1, color: "#cbd5e1", isPlaceholder: true }],
      recentActivity: activities,
      pipelineBooks: pipeBooks,
      topBooks: sortedTopBooks,
      calendarSales: calSales,
    };
  }, [allTxns, allReviews, allBooks, profileData]);

  const earningsTrend = pctChange(stats.thisMonthEarnings, stats.lastMonthEarnings);
  const goalProgress = Math.min(100, Math.round((stats.thisMonthEarnings / stats.monthlyGoal) * 100)) || 0;

  const filteredActivity = useMemo(
    () => (selectedDateKey ? recentActivity.filter((a) => a.dateKey === selectedDateKey) : recentActivity),
    [selectedDateKey, recentActivity]
  );

  const weekRevenue = salesTrend.reduce((sum, p) => sum + p.revenue, 0);
  const weekSales = salesTrend.reduce((sum, p) => sum + p.sales, 0);

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-2">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 shadow-lg border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#275697]/20 rounded-full blur-3xl translate-y-1/2" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-bold tracking-wide text-slate-300 uppercase">Welcome back,</p>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{name}</h1>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm font-medium text-slate-400">
                Here's everything happening across your books today — earnings, sales momentum, and what needs your attention.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white">
                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-bold tracking-wide uppercase text-slate-300">{stats.publishedBooks} published books</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link href="/sales" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-600 transition-colors">
                View Full Sales Report <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* PENDING ACTIONS BANNER */}
        {stats.pendingActions > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm text-slate-800">
                You have <span className="font-bold text-orange-600">{stats.pendingActions} items</span> that need your attention across your book pipeline.
              </p>
            </div>
            <Link href="/books" className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-800">
              Review now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          <StatCard label="This Month" value={formatINR(stats.thisMonthEarnings)} trend={earningsTrend} sublabel="vs last month" icon={DollarSign} />
          <StatCard label="Lifetime Earnings" value={formatINR(stats.lifetimeEarnings)} sublabel="all-time, all platforms" icon={Wallet} />
          <StatCard label="Books in Pipeline" value={String(stats.booksInPipeline)} sublabel={`${stats.publishedBooks} already published`} icon={BookOpen} />
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard title="7-Day Sales Trend" icon={TrendingUp} className="xl:col-span-2" action={<span className="text-xs font-bold text-slate-500">{weekSales} units · <span className="text-slate-800">{formatINR(weekRevenue)}</span></span>}>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#275697" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#275697" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number, name: string) => name === "revenue" ? [formatINR(value), "Revenue"] : [value, "Units sold"]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#275697" strokeWidth={3} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Platform Breakdown" icon={BookOpen}>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformShare} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={2}>
                    {platformShare.map((entry, idx) => <Cell key={idx} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string, props: any) => [props.payload.isPlaceholder ? "0 units" : `${value} units`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {platformShare.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-slate-600">
                    <span className="h-3 w-3 rounded-md" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-bold text-slate-900">{p.isPlaceholder ? "0 units" : `${p.value} units`}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* CALENDAR + ACTIVITY ROW */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <CalendarWidget monthDate={calendarMonth} onMonthChange={setCalendarMonth} selectedKey={selectedDateKey} onSelectKey={setSelectedDateKey} calendarSales={calendarSales} />

          <SectionCard title="Recent Activity" icon={Clock3} className="xl:col-span-2" action={selectedDateKey ? <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">Filtered to {new Date(selectedDateKey).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span> : <span className="text-xs font-bold text-slate-400">{recentActivity.length} updates</span>}>
            {filteredActivity.length === 0 ? (
              <p className="py-6 text-center text-sm font-medium text-slate-500">No activity on this day.</p>
            ) : (
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredActivity.slice(0, 30).map((item) => {
                  const style = ACTIVITY_STYLES[item.type];
                  const Icon = style.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${style.bgClass}`}>
                        <Icon className={`h-4 w-4 ${style.iconClass}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-slate-800">{item.title}</p>
                          {item.amount !== undefined && <span className="shrink-0 text-sm font-black text-emerald-600">+{formatINR(item.amount)}</span>}
                        </div>
                        <p className="text-xs font-medium text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* PIPELINE + TOP BOOKS + QUICK ACTIONS ROW */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard title="Book Pipeline" icon={BookOpen} action={<Link href="/books" className="text-xs font-bold text-blue-900 hover:text-blue-700">View all</Link>}>
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {pipelineBooks.length === 0 ? (
                <p className="text-sm font-medium text-slate-500">No books in pipeline.</p>
              ) : pipelineBooks.map((book) => (
                <div key={book.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-slate-800">{book.title}</p>
                    {book.needsAttention && (
                      <div className="flex shrink-0 items-center gap-2">
                        {book.correctionLink && (
                          <button onClick={() => setPdfPreview({ url: book.correctionLink!, title: `Correction - ${book.title}` })} className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2">View file</button>
                        )}
                        <span className="flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600"><AlertTriangle className="h-3 w-3" /> Action needed</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${book.needsAttention ? "bg-orange-400" : "bg-blue-900"}`} style={{ width: `${book.progress}%` }} />
                    </div>
                    <span className="shrink-0 text-[11px] font-bold tracking-wide text-slate-400 uppercase">{book.stage}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">ETA {book.eta}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Top Performing Books" icon={Star} action={<Link href="/reviews" className="text-xs font-bold text-blue-900 hover:text-blue-700">All reviews</Link>}>
            <div className="space-y-4">
              {topBooks.length === 0 ? (
                <p className="text-sm font-medium text-slate-500">No sales data yet.</p>
              ) : topBooks.map((book, i) => (
                <div key={book.id} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-xs font-black text-orange-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{book.title}</p>
                    <p className="text-xs font-medium text-slate-500"><span className="text-orange-600 font-bold">{book.unitsSold.toLocaleString("en-IN")}</span> units · {formatINR(book.revenue)}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#275697] bg-[#275697]/10 px-2 py-1 rounded-md">
                    <Star className="h-3 w-3 fill-[#275697] text-[#275697]" /> {book.rating > 0 ? book.rating : "—"}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions" icon={Sparkles}>
            <div className="space-y-2">
              <Link href="/sales" className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                <span className="flex items-center gap-2"><Download className="h-4 w-4 text-[#275697]" /> Export sales CSV</span>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </Link>
              <Link href="/community" className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[#275697]" /> Post a community update</span>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </Link>
              <Link href="/support" className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                <span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-[#275697]" /> Raise a support ticket</span>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </Link>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-xs font-bold tracking-wide uppercase">
                <span className="text-slate-500">Monthly goal</span>
                <span className="text-slate-800">{formatINR(stats.thisMonthEarnings)} <span className="text-slate-400">/ {formatINR(stats.monthlyGoal)}</span></span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${goalProgress}%` }} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {goalProgress}% of this month's goal reached
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
      {pdfPreview && <PdfModal url={pdfPreview.url} title={pdfPreview.title} onClose={() => setPdfPreview(null)} />}
    </div>
  );
}