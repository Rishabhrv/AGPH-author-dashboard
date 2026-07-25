"use client";

import { useState, useMemo, useRef, Fragment } from "react";
import India from "@svg-maps/india";
import {
  TrendingUp,
  IndianRupee,
  Download,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  MapPin,
  Crown,
  Trophy,
  Search,
  X,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  exportTransactionsAsCSV,
  addDays,
  todayISO,
  formatINR,
  formatDisplayDate,
  StateData,
  PLATFORM_META,
  PlatformKey,
} from "@/lib/sales-page-data";

type FilterMode = "preset" | "single" | "range" | "month";
type TxnSort = "recent" | "earnings";
const storeUrl = process.env.STORE_URL || "http://localhost:5000";


// Inline styles (not Tailwind color tokens) so this doesn't depend on your theme config
const RANK_BADGE_STYLE: Record<number, { background: string; color: string }> = {
  1: { background: "linear-gradient(135deg, #FFD873 0%, #F5B942 100%)", color: "#17171A" },
  2: { background: "linear-gradient(135deg, #E2E5EA 0%, #B8BEC7 100%)", color: "#17171A" },
  3: { background: "linear-gradient(135deg, #E8A66B 0%, #C97B3D 100%)", color: "#FFFFFF" },
};

function shortLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysBetweenInclusive(startISO: string, endISO: string): number {
  const start = new Date(startISO);
  const end = new Date(endISO);
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

export default function SalesPage({ initialData }: { initialData?: any; storeUrl?: string }) {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // --- Date filter state ---
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("preset");
  const [presetDays, setPresetDays] = useState(30);
  const [singleDate, setSingleDate] = useState(todayISO());
  const [rangeStart, setRangeStart] = useState(addDays(todayISO(), -29));
  const [rangeEnd, setRangeEnd] = useState(todayISO());
  const [monthValue, setMonthValue] = useState(todayISO().slice(0, 7));

  // --- New: trend comparison + transaction search/sort ---
  const [showCompare, setShowCompare] = useState(false);
  const [txnQuery, setTxnQuery] = useState("");
  const [txnSort, setTxnSort] = useState<TxnSort>("recent");

  const today = todayISO();

  const allTxns = useMemo(() => {
    const rawTxns = initialData?.transactions || [];
    return rawTxns.map((t: any) => {
      let metaKey = (Object.keys(PLATFORM_META) as PlatformKey[]).find(
        (k) => PLATFORM_META[k].label.toLowerCase().includes(t.platform.toLowerCase()) || t.platform.toLowerCase().includes(k)
      ) || "website";

      const meta = PLATFORM_META[metaKey as PlatformKey];
      const gross = t.price || 0;

      return {
        ...t,
        platformKey: metaKey,
        platform: meta.label,

        gross
      };
    });
  }, [initialData]);

  const snapshot = useMemo(() => {
    if (initialData?.books) {
      return {
        books: initialData.books,
        totalEarnings: allTxns.reduce((sum: number, t: any) => sum + t.gross, 0)
      };
    }
    return { books: [], totalEarnings: 0 };
  }, [initialData, allTxns]);

  const selectedBookLifetimeEarnings = useMemo(() => {
    if (!selectedBook) return snapshot.totalEarnings;
    return allTxns
      .filter((t: any) => t.bookTitle === selectedBook)
      .reduce((sum: number, t: any) => sum + t.gross, 0);
  }, [selectedBook, allTxns, snapshot.totalEarnings]);

  // Resolve the active date period from whichever filter mode is selected
  const activePeriod = useMemo(() => {
    if (filterMode === "single") {
      return { start: singleDate, end: singleDate, label: shortLabel(singleDate) };
    }
    if (filterMode === "month") {
      const [y, m] = monthValue.split("-").map(Number);
      const start = `${monthValue}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${monthValue}-${String(lastDay).padStart(2, "0")}`;
      const label = new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      return { start, end, label };
    }
    if (filterMode === "range") {
      return {
        start: rangeStart,
        end: rangeEnd,
        label: `${shortLabel(rangeStart)} – ${shortLabel(rangeEnd)}`,
      };
    }
    const start = addDays(today, -(presetDays - 1));
    return { start, end: today, label: `Last ${presetDays} Days` };
  }, [filterMode, singleDate, monthValue, rangeStart, rangeEnd, presetDays, today]);

  const periodTxns = useMemo(
    () => allTxns.filter((t: any) => t.date >= activePeriod.start && t.date <= activePeriod.end),
    [allTxns, activePeriod.start, activePeriod.end]
  );

  // --- Filtering Logic ---
  const filteredTxns = useMemo(() => {
    if (!selectedBook) return periodTxns;
    return periodTxns.filter((t: any) => t.bookTitle === selectedBook);
  }, [periodTxns, selectedBook]);

  const activePlatforms = useMemo(() => {
    const totals: Record<string, any> = {};
    (Object.keys(PLATFORM_META) as PlatformKey[]).forEach((key) => {
      const meta = PLATFORM_META[key];
      totals[key] = { key, label: meta.label, units: 0, grossRevenue: 0, platformFee: 0, color: meta.color };
    });
    filteredTxns.forEach((t: any) => {
      const key = t.platformKey;
      const meta = PLATFORM_META[key as PlatformKey];
      totals[key].units += t.units;
      totals[key].grossRevenue += t.gross;
      totals[key].platformFee += Math.round(t.gross * meta.feeRate);

    });
    return Object.values(totals);
  }, [filteredTxns]);
  const periodEarnings = filteredTxns.reduce((sum: number, t: any) => sum + t.gross, 0);
  const periodUnits = filteredTxns.reduce((sum: number, t: any) => sum + t.units, 0);

  // --- New: previous-period comparison (same length window immediately before) ---
  const periodLengthDays = useMemo(
    () => daysBetweenInclusive(activePeriod.start, activePeriod.end),
    [activePeriod.start, activePeriod.end]
  );

  const prevPeriod = useMemo(() => {
    const prevEnd = addDays(activePeriod.start, -1);
    const prevStart = addDays(prevEnd, -(periodLengthDays - 1));
    return { start: prevStart, end: prevEnd };
  }, [activePeriod.start, periodLengthDays]);

  const prevFilteredTxns = useMemo(() => {
    const txns = allTxns.filter((t: any) => t.date >= prevPeriod.start && t.date <= prevPeriod.end);
    return selectedBook ? txns.filter((t: any) => t.bookTitle === selectedBook) : txns;
  }, [allTxns, prevPeriod.start, prevPeriod.end, selectedBook]);

  const prevPeriodEarnings = prevFilteredTxns.reduce((sum: number, t: any) => sum + t.gross, 0);

  const earningsChangePct = useMemo(() => {
    if (prevPeriodEarnings > 0) {
      return ((periodEarnings - prevPeriodEarnings) / prevPeriodEarnings) * 100;
    }
    return periodEarnings > 0 ? 100 : 0;
  }, [periodEarnings, prevPeriodEarnings]);

  // --- New: top platform for the period, used in the third metric card ---
  const topPlatform = useMemo(() => {
    if (activePlatforms.length === 0) return null;
    return [...activePlatforms].sort((a, b) => b.grossRevenue - a.grossRevenue)[0];
  }, [activePlatforms]);

  const topPlatformShare = topPlatform && periodEarnings > 0
    ? (topPlatform.grossRevenue / periodEarnings) * 100
    : 0;

  // --- New: per-book unit counts for the active period, shown in the carousel ---
  const bookPeriodUnits = useMemo(() => {
    const map = new Map<string, number>();
    periodTxns.forEach((t: any) => map.set(t.bookTitle, (map.get(t.bookTitle) || 0) + t.units));
    return map;
  }, [periodTxns]);

  // Group transactions by date for the chart, across whatever period is active
  const activeTrendData = useMemo(() => {
    const map = new Map<string, number>();
    let cursor = activePeriod.start;
    let guard = 0;
    while (cursor <= activePeriod.end && guard < 3660) {
      map.set(cursor, 0);
      cursor = addDays(cursor, 1);
      guard++;
    }
    filteredTxns.forEach((t: any) => {
      if (map.has(t.date)) {
        map.set(t.date, map.get(t.date)! + t.gross);
      }
    });
    return Array.from(map.entries()).map(([date, earnings]) => ({ date, earnings }));
  }, [filteredTxns, activePeriod.start, activePeriod.end]);

  // --- New: previous-period series aligned by day-index onto the current period's dates ---
  const trendData = useMemo(() => {
    if (!showCompare) return activeTrendData;
    const prevMap = new Map<string, number>();
    let cursor = prevPeriod.start;
    let guard = 0;
    while (cursor <= prevPeriod.end && guard < 3660) {
      prevMap.set(cursor, 0);
      cursor = addDays(cursor, 1);
      guard++;
    }
    prevFilteredTxns.forEach((t: any) => {
      if (prevMap.has(t.date)) prevMap.set(t.date, prevMap.get(t.date)! + t.gross);
    });
    const prevValues = Array.from(prevMap.values());
    return activeTrendData.map((d, i) => ({ ...d, prevEarnings: prevValues[i] ?? 0 }));
  }, [activeTrendData, showCompare, prevPeriod.start, prevPeriod.end, prevFilteredTxns]);

  // Get Map Data
  const mapData = useMemo(() => {
    if (selectedBook) return snapshot.books.find((b: any) => b.title === selectedBook)?.stateDistribution || [];

    const agg = new Map<string, StateData>();
    snapshot.books.forEach((b: any) => {
      b.stateDistribution.forEach((s: any) => {
        if (agg.has(s.state)) {
          const existing = agg.get(s.state)!;
          existing.value += s.value;
          existing.amazon += s.amazon;
          existing.flipkart += s.flipkart;
          existing.website += s.website;
        } else {
          agg.set(s.state, { ...s });
        }
      });
    });
    return Array.from(agg.values()).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [selectedBook, snapshot.books]);

  // Sorted copy for the ranked list (independent of map-lookup ordering)
  const rankedMapData = useMemo(
    () => [...mapData].sort((a, b) => b.value - a.value),
    [mapData]
  );

  const maxMapValue = Math.max(...mapData.map((s: any) => s.value), 1);

  const valueByStateName = useMemo(() => {
    const m = new Map<string, number>();
    mapData.forEach((d: any) => m.set(d.state.trim().toLowerCase(), d.value));
    return m;
  }, [mapData]);

  // Find all data for the currently hovered state
  const hoveredStateInfo = useMemo(() => {
    if (!hoveredState) return null;

    // Find matching state inside mapData
    const data = mapData.find((d: any) => d.state.trim().toLowerCase() === hoveredState);
    if (data) return data;

    // Fallback name for states with 0 sales
    const loc = India.locations.find((l: any) => l.name.trim().toLowerCase() === hoveredState);
    return loc ? { state: loc.name, value: 0, amazon: 0, flipkart: 0, website: 0 } : null;
  }, [hoveredState, mapData]);

  // --- New: search + sort over the visible transaction list ---
  const visibleTxns = useMemo(() => {
    let rows = filteredTxns;
    if (txnQuery.trim()) {
      const q = txnQuery.trim().toLowerCase();
      rows = rows.filter(
        (t: any) => t.bookTitle.toLowerCase().includes(q) || t.platform.toLowerCase().includes(q)
      );
    }
    if (txnSort === "earnings") {
      rows = [...rows].sort((a, b) => b.grossRevenue - a.grossRevenue);
    }
    return rows;
  }, [filteredTxns, txnQuery, txnSort]);

  const totalPlatformRevenue = activePlatforms.reduce((sum, p) => sum + p.grossRevenue, 0);

  const handleExportCSV = () => {
    const filename = `sales-revenue_${activePeriod.start}_to_${activePeriod.end}${selectedBook ? `_${selectedBook.replace(/\s+/g, "-")}` : ""
      }.csv`;
    exportTransactionsAsCSV(filteredTxns, filename);
  };

  const scrollCarousel = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Sales & Revenue
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Tracking {snapshot.books.length} {snapshot.books.length === 1 ? "book" : "books"} across Amazon, Flipkart & AGPH. Select one below to filter.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen((v) => !v)}
              className="flex items-center gap-2 text-[13px] font-semibold bg-white shadow-sm text-slate-900 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/40"
            >
              <Calendar size={14} className="text-slate-500" />
              {activePeriod.label}
              <ChevronDown
                size={14}
                className={`text-slate-500 ml-1 transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDatePickerOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsDatePickerOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl2 shadow-sm border border-slate-200 p-4 z-30">
                  <div className="flex gap-1 mb-4 bg-slate-100 rounded-full p-1">
                    {(["preset", "single", "range", "month"] as FilterMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setFilterMode(m)}
                        className={`flex-1 text-[11px] font-bold py-1.5 rounded-full capitalize transition-colors ${filterMode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        {m === "preset" ? "Quick" : m}
                      </button>
                    ))}
                  </div>

                  {filterMode === "preset" && (
                    <div className="flex flex-col gap-1.5">
                      {[7, 30, 90].map((d: any) => (
                        <button
                          key={d}
                          onClick={() => {
                            setPresetDays(d);
                            setIsDatePickerOpen(false);
                          }}
                          className={`text-left text-[13px] font-semibold px-3 py-2 rounded-lg transition-colors ${presetDays === d ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-900"
                            }`}
                        >
                          Last {d} Days
                        </button>
                      ))}
                    </div>
                  )}

                  {filterMode === "single" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-slate-500">Pick a date</label>
                      <input
                        type="date"
                        value={singleDate}
                        max={today}
                        onChange={(e) => setSingleDate(e.target.value)}
                        className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none"
                      />
                      <button
                        onClick={() => setIsDatePickerOpen(false)}
                        className="mt-1 text-[12px] font-bold bg-slate-900 text-white rounded-lg py-2"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {filterMode === "range" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-slate-500">Start date</label>
                      <input
                        type="date"
                        value={rangeStart}
                        max={rangeEnd}
                        onChange={(e) => setRangeStart(e.target.value)}
                        className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none"
                      />
                      <label className="text-[11px] font-semibold text-slate-500 mt-1">End date</label>
                      <input
                        type="date"
                        value={rangeEnd}
                        min={rangeStart}
                        max={today}
                        onChange={(e) => setRangeEnd(e.target.value)}
                        className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none"
                      />
                      <button
                        onClick={() => setIsDatePickerOpen(false)}
                        className="mt-1 text-[12px] font-bold bg-slate-900 text-white rounded-lg py-2"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {filterMode === "month" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-slate-500">Pick a month</label>
                      <input
                        type="month"
                        value={monthValue}
                        max={today.slice(0, 7)}
                        onChange={(e) => setMonthValue(e.target.value)}
                        className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none"
                      />
                      <button
                        onClick={() => setIsDatePickerOpen(false)}
                        className="mt-1 text-[12px] font-bold bg-slate-900 text-white rounded-lg py-2"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-[13px] font-semibold bg-slate-900 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/40"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Book Cover Carousel (Filter) */}
      <div className="relative">
        <button
          onClick={() => scrollCarousel("left")}
          className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-sm items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 snap-x scroll-smooth"
        >
          <button
            onClick={() => setSelectedBook(null)}
            className={`snap-start flex-shrink-0 w-32 flex flex-col gap-2 group transition-opacity ${!selectedBook ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
          >
            <div className={`w-full aspect-[2/3] rounded-xl flex items-center justify-center bg-white shadow-sm border-2 transition-colors ${!selectedBook ? 'border-slate-300' : 'border-transparent'}`}>
              <BookOpen size={24} className={!selectedBook ? 'text-slate-900' : 'text-slate-500'} />
            </div>
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[12px] font-bold text-slate-900">All Books</p>
              <p className="text-[10px] font-semibold text-slate-500">{periodTxns.reduce((s: number, t: any) => s + t.units, 0)}u</p>
            </div>
          </button>

          {snapshot.books.map((book: any, index: number) => {
            const rank = index + 1;
            const badgeStyle = RANK_BADGE_STYLE[rank];
            const unitsInPeriod = bookPeriodUnits.get(book.title) || 0;
            return (
              <button
                key={book.title}
                onClick={() => setSelectedBook(book.title)}
                className={`snap-start flex-shrink-0 w-32 flex flex-col gap-2 group hover:opacity-90 `}
              >
                <div className="relative">
                  {badgeStyle && (
                    <span
                      style={badgeStyle}
                      className="absolute -top-1 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shadow-sm border-2 border-white"
                    >
                      #{rank}
                    </span>
                  )}
                  {book.coverImage ? (
                    <img
                      src={`${storeUrl}${book.coverImage}`}
                      alt={book.title}
                      className={`w-full h-full rounded-xl shadow-sm border-2 transition-colors ${selectedBook === book.title ? 'border-slate-300' : 'border-transparent'}`}
                    />
                  ) : (
                    <div
                      style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}
                      className={`w-full h-full  rounded-xl shadow-sm border-2 transition-colors flex items-end p-3 ${selectedBook === book.title ? 'border-slate-300' : 'border-transparent'}`}
                    >
                      <div className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded w-full text-left truncate shadow-sm">
                        {book.title}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-0.5">
                  <p className="text-[11px] font-semibold text-slate-500 truncate">{activePeriod.label}</p>
                  <p className="text-[10px] font-bold text-slate-500 shrink-0 ml-1">{unitsInPeriod}u</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollCarousel("right")}
          className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-sm items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Top Summary Metrics (3-up) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              {selectedBook ? 'Filtered Lifetime' : 'Lifetime Earnings'}
            </span>
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
              <IndianRupee className="h-4 w-4 text-[#275697]" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">
            {formatINR(selectedBookLifetimeEarnings)}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Across all platforms & formats</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              {activePeriod.label}
            </span>
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
              <TrendingUp className="h-4 w-4 text-[#275697]" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">
            {formatINR(periodEarnings)}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${earningsChangePct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {earningsChangePct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(earningsChangePct).toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              {periodUnits} units · vs {formatINR(prevPeriodEarnings)} prior
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Top Platform</span>
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
              <Trophy className="h-4 w-4 text-[#275697]" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">
            {topPlatform ? topPlatform.label : "—"}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              {topPlatform ? `${topPlatformShare.toFixed(0)}% of ${activePeriod.label.toLowerCase()} revenue` : "No sales in this period"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart & Geographic Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">

        {/* Left Column: Revenue Trend Chart */}
        <div className="bg-white rounded-xl2 p-5 shadow-sm flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900">
              {selectedBook ? `Revenue: ${selectedBook}` : `Revenue Trend — ${activePeriod.label}`}
            </p>
            <button
              onClick={() => setShowCompare((v) => !v)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${showCompare ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900"
                }`}
            >
              <Layers size={12} />
              vs previous period
            </button>
          </div>
          {showCompare && (
            <div className="flex items-center gap-4 mb-4">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="w-3 h-[2px] bg-slate-900 inline-block" /> This period
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="w-3 h-[2px] bg-slate-100 inline-block" style={{ borderTop: "2px dashed #17171A50" }} /> Previous period
              </span>
            </div>
          )}
          <div className="flex-1 min-h-[240px] -ml-4 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#17171A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#17171A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#17171A15" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.split("-")[2]}
                  tick={{ fontSize: 10, fill: '#17171A80' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fontSize: 10, fill: '#17171A80' }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: '#17171A40', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value: number, name: string) => [formatINR(value), name]}
                  labelFormatter={(label) => formatDisplayDate(label)}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  name="This period"
                  stroke="#17171A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
                {showCompare && (
                  <Area
                    type="monotone"
                    dataKey="prevEarnings"
                    name="Previous period"
                    stroke="#17171A50"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={0}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* India Geographic Distribution (real state boundaries) */}
        <div className="bg-white rounded-xl2 p-5 shadow-sm flex flex-col relative overflow-hidden">
          <p className="text-sm font-bold text-slate-900 mb-6 relative z-10">Geographic Distribution</p>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full relative z-10">

            <div className="flex flex-col gap-4 justify-center">
              {rankedMapData.map((data, i) => {
                const key = data.state.trim().toLowerCase();
                const isDimmed = hoveredState !== null && hoveredState !== key;
                return (
                  <div
                    key={data.state}
                    onMouseEnter={() => setHoveredState(key)}
                    onMouseLeave={() => setHoveredState(null)}
                    className={`flex flex-col gap-1.5 cursor-pointer transition-opacity duration-200 ${isDimmed ? "opacity-35" : "opacity-100"
                      }`}
                  >
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-900">
                      <span className="flex items-center gap-1.5 truncate">
                        {i === 0 ? (
                          <Crown size={11} className="text-amber-500 shrink-0" />
                        ) : (
                          <MapPin size={10} className="text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{data.state}</span>
                      </span>
                      <span className="shrink-0 ml-2">{data.value} u</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${(data.value / maxMapValue) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {rankedMapData.length === 0 && (
                <p className="text-[11px] font-medium text-slate-500 italic">No regional sales yet for this selection.</p>
              )}
            </div>

            <div className="relative w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-2">
              <svg viewBox={India.viewBox} className="w-full h-full max-w-[210px]">
                {India.locations.map((loc) => {
                  const key = loc.name.trim().toLowerCase();
                  const value = valueByStateName.get(key);
                  const isActive = value !== undefined;
                  const intensity = isActive ? 0.3 + 0.7 * (value / maxMapValue) : 0;
                  const isHovered = hoveredState === key;
                  return (
                    <path
                      key={loc.id}
                      d={loc.path}
                      onMouseEnter={() => setHoveredState(key)}
                      onMouseLeave={() => setHoveredState(null)}
                      fill={isActive ? `rgba(255,105,180,${intensity})` : "#17171A0D"}
                      stroke={isHovered ? "#17171A" : isActive ? "#17171A30" : "#17171A15"}
                      strokeWidth={isHovered ? 0.7 : 0.3}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Dynamic Platform Info Box underneath Map */}
              <div className="h-9 text-center flex flex-col items-center justify-center gap-0.5 mt-1">
                {hoveredStateInfo ? (
                  <>
                    <p className="text-[11px] font-bold text-slate-900">
                      {hoveredStateInfo.state}
                      {hoveredStateInfo.value > 0 && ` : ${hoveredStateInfo.value} u`}
                    </p>
                    {hoveredStateInfo.value > 0 && (
                      <div className="flex items-center gap-3 text-[9px] font-medium text-slate-500">
                        <span>Amz: <span className="text-slate-900 font-bold">{hoveredStateInfo.amazon}</span></span>
                        <span>Flp: <span className="text-slate-900 font-bold">{hoveredStateInfo.flipkart}</span></span>
                        <span>Web: <span className="text-slate-900 font-bold">{hoveredStateInfo.website}</span></span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[10px] font-medium text-slate-500 italic">Hover a state for details</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Grid: Platform Deductions & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl2 p-5 shadow-sm flex flex-col">
          <p className="text-sm font-bold text-slate-900 mb-3">Deductions by Platform</p>

          {/* Revenue share bar */}
          {activePlatforms.length > 0 && (
            <div className="mb-4">
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-100">
                {activePlatforms.map((p) => (
                  <div
                    key={p.key}
                    style={{
                      width: totalPlatformRevenue > 0 ? `${(p.grossRevenue / totalPlatformRevenue) * 100}%` : 0,
                      backgroundColor: p.color,
                    }}
                    className="h-full transition-all duration-700 ease-out"
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {activePlatforms.map((p) => (
                  <span key={p.key} className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.label} · {totalPlatformRevenue > 0 ? ((p.grossRevenue / totalPlatformRevenue) * 100).toFixed(0) : 0}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="pb-3 font-medium">Platform</th>
                  <th className="pb-3 font-medium text-right">Gross</th>
                  <th className="pb-3 font-medium text-right text-slate-900">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {activePlatforms.map((p) => (
                  <Fragment key={p.key}>
                    <tr
                      onClick={() => setExpandedPlatform(expandedPlatform === p.key ? null : p.key)}
                      className="group hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <ChevronDown
                          size={14}
                          className={`text-slate-500 transition-transform ${expandedPlatform === p.key ? "rotate-180" : ""}`}
                        />
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <div className="flex flex-col">
                          <span>{p.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{p.units} units</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium text-slate-500">
                        {formatINR(p.grossRevenue)}
                      </td>

                      <td className="py-3 text-right font-bold text-slate-900">
                        {formatINR(p.grossRevenue)}
                      </td>
                    </tr>
                    {expandedPlatform === p.key && (
                      <tr>
                        <td colSpan={4} className="p-0 border-b border-slate-200 bg-slate-50/50">
                          <div className="p-4 pl-8 text-[11px]">
                            {(() => {
                              const pTxns = filteredTxns.filter((t: any) => t.platform === p.label);
                              const grouped = new Map<string, number>();
                              pTxns.forEach((t: any) => {
                                grouped.set(t.date, (grouped.get(t.date) || 0) + t.units);
                              });
                              const entries = Array.from(grouped.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

                              if (entries.length === 0) return <p className="text-slate-500 italic">No sales data.</p>;
                              return (
                                <table className="w-full text-left">
                                  <tbody>
                                    {entries.map(([date, count]) => (
                                      <tr key={date} className="border-b border-slate-200 last:border-0">
                                        <td className="py-1.5 font-medium text-slate-500">{formatDisplayDate(date)}</td>
                                        <td className="py-1.5 text-right font-bold text-slate-500">{count} {count === 1 ? 'book' : 'books'} sold</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {activePlatforms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">No sales on platforms for this selection.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl2 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900">Recent Transactions</p>
            <button
              onClick={() => setTxnSort(txnSort === "recent" ? "earnings" : "recent")}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowUpDown size={12} />
              {txnSort === "recent" ? "Most recent" : "Top earning"}
            </button>
          </div>

          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={txnQuery}
              onChange={(e) => setTxnQuery(e.target.value)}
              placeholder="Search by book or platform"
              className="w-full text-[12px] font-medium text-slate-900 bg-slate-50 rounded-lg pl-8 pr-8 py-2 outline-none placeholder:text-slate-500"
            />
            {txnQuery && (
              <button
                onClick={() => setTxnQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="overflow-x-auto no-scrollbar max-h-[300px]">
            <table className="w-full text-left text-[12px]">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Title & Platform</th>
                  <th className="pb-3 font-medium text-center">Qty</th>
                  <th className="pb-3 font-medium text-right text-slate-900">Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {visibleTxns.slice(0, 15).map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-2.5 font-medium text-slate-500 whitespace-nowrap">
                      {formatDisplayDate(t.date).replace("Today · ", "")}
                    </td>
                    <td className="py-2.5">
                      <p className="font-semibold text-slate-900 truncate max-w-[150px]">{t.bookTitle}</p>
                      <p className="text-[10px] text-slate-500">
                        {t.platform}{t.format ? ` · ${t.format}` : ""}
                      </p>
                    </td>
                    <td className="py-2.5 text-center font-medium text-slate-500">
                      {t.units}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatINR(t.gross)}
                    </td>
                  </tr>
                ))}
                {visibleTxns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      {txnQuery ? `No transactions match "${txnQuery}".` : "No recent transactions."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {visibleTxns.length > 15 && (
            <p className="text-[10px] font-medium text-slate-500 mt-2 text-right">
              Showing 15 of {visibleTxns.length}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}