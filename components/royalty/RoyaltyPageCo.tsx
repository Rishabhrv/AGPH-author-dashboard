"use client";

import { useMemo, useState, Fragment } from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Download,
  BookOpen,
  Crown,
  Search,
  X,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Percent,
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
import { formatINR } from "@/lib/sales-page-data";

const storeUrl = process.env.STORE_URL || "http://localhost:5000";

interface Transaction {
  bookTitle: string;
  platform: string;
  price: number;
  units: number;
  date: string;
  pages?: number;
  colorPages?: number;
  binding?: string;
  bindingCost?: number;
  sizeCost?: number;
  costPrice?: number;
}

interface Book {
  title: string;
  coverImage?: string;
  pages?: number;
  colorPages?: number;
  binding?: string;
  bindingCost?: number;
  sizeCost?: number;
  costPrice?: number;
}

interface EnrichedTransaction extends Transaction {
  gross: number;
  royalty: number;
  coverImage: string | null;
}

interface RoyaltyPageProps {
  initialData?: {
    transactions: Transaction[];
    books: Book[];
  } | null;
}

const PLATFORM_COLORS: Record<string, string> = {
  Amazon: "#17171A",
  Flipkart: "#17171A99",
  Website: "#17171A66",
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function RoyaltyPageCo({ initialData }: RoyaltyPageProps) {
  const transactions = useMemo(() => initialData?.transactions || [], [initialData]);
  const books = useMemo(() => initialData?.books || [], [initialData]);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [txnSort, setTxnSort] = useState<"recent" | "earnings">("recent");
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // Cover image and details lookup
  const bookDetails = useMemo(() => {
    const map: Record<string, { coverImage: string | null; pages: number; colorPages: number; binding: string; bindingCost: number; sizeCost: number; costPrice: number }> = {};
    books.forEach((b) => {
      if (b.title) {
        map[b.title] = {
          coverImage: b.coverImage
            ? b.coverImage.startsWith("http")
              ? b.coverImage
              : `${storeUrl}${b.coverImage}`
            : null,
          pages: b.pages || 0,
          colorPages: b.colorPages || 0,
          binding: b.binding || "",
          bindingCost: b.bindingCost || 0,
          sizeCost: b.sizeCost || 0,
          costPrice: b.costPrice || 0,
        };
      }
    });
    return map;
  }, [books]);

  // All transactions enriched with royalty math + normalized platform
  const enrichedTransactions: EnrichedTransaction[] = useMemo(() => {
    return transactions
      .map((t) => {
        const gross = t.price || 0;
        const units = t.units || 1;
        const platformMatch =
          ["Amazon", "Flipkart"].find((p) =>
            t.platform?.toLowerCase().includes(p.toLowerCase())
          ) || "Website";

        const details = bookDetails[t.bookTitle] || { coverImage: null, pages: 0, colorPages: 0, binding: "", bindingCost: 0, sizeCost: 0, costPrice: 0 };
        const H = gross / units; // Selling Price per book
        const B = t.pages || details.pages || 0; // Number of Pages
        const D = t.colorPages || details.colorPages || 0; // Color Pages

        const bindingType = (t.binding || details.binding || "").toLowerCase();
        let A = t.bindingCost ?? details.bindingCost ?? 0; // Binding
        if (bindingType.includes("hardcover")) {
          A = 180;
        } else if (bindingType.includes("paperback")) {
          A = 100;
        }

        const E = t.sizeCost || details.sizeCost || 0; // Book Size

        // Cost Price formula: ((B - D) * 0.8) + (D * 10) + A + E
        const calculatedCostPrice = ((B - D) * 0.8) + (D * 10) + A + E;
        const J = t.costPrice || details.costPrice || calculatedCostPrice; // Cost Price

        let royaltyPerBook = 0;
        if (platformMatch === "Amazon" || platformMatch === "Flipkart") {
          royaltyPerBook = H - ((B * 0.15) + J + (0.15 * H));
        } else {
          royaltyPerBook = H - ((B * 0.15) + J);
        }


        const royalty = royaltyPerBook * units;

        return {
          ...t,
          gross,
          royalty,
          platform: platformMatch,
          coverImage: details.coverImage,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, bookDetails]);

  // Years available for the filter
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    enrichedTransactions.forEach((t) => {
      if (t.date) years.add(t.date.substring(0, 4));
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [enrichedTransactions]);

  // Transactions within the selected year
  const yearFilteredTransactions = useMemo(() => {
    if (selectedYear === "all") return enrichedTransactions;
    return enrichedTransactions.filter((t) => t.date?.startsWith(selectedYear));
  }, [enrichedTransactions, selectedYear]);

  // Lifetime stats (always unfiltered)
  const lifetimeStats = useMemo(() => {
    return enrichedTransactions.reduce(
      (acc, t) => {
        acc.royalty += t.royalty;
        acc.gross += t.gross;
        return acc;
      },
      { royalty: 0, gross: 0 }
    );
  }, [enrichedTransactions]);

  // Core period stats
  const periodStats = useMemo(() => {
    const royalty = yearFilteredTransactions.reduce((s, t) => s + t.royalty, 0);
    const gross = yearFilteredTransactions.reduce((s, t) => s + t.gross, 0);
    const units = yearFilteredTransactions.reduce((s, t) => s + (t.units || 0), 0);
    return { royalty, gross, units, count: yearFilteredTransactions.length };
  }, [yearFilteredTransactions]);

  // Year-over-year growth
  const yoyGrowth = useMemo(() => {
    if (selectedYear === "all") return null;
    const prevYear = (parseInt(selectedYear, 10) - 1).toString();
    const prevRoyalty = enrichedTransactions
      .filter((t) => t.date?.startsWith(prevYear))
      .reduce((s, t) => s + t.royalty, 0);
    if (prevRoyalty <= 0) return null;
    const pct = ((periodStats.royalty - prevRoyalty) / prevRoyalty) * 100;
    return { pct, prevYear, prevRoyalty };
  }, [selectedYear, enrichedTransactions, periodStats.royalty]);

  // Platform breakdown
  const platformBreakdown = useMemo(() => {
    const map: Record<string, { grossRevenue: number; royalty: number; units: number }> = {};
    yearFilteredTransactions.forEach((t) => {
      if (!map[t.platform]) map[t.platform] = { grossRevenue: 0, royalty: 0, units: 0 };
      map[t.platform].grossRevenue += t.gross;
      map[t.platform].royalty += t.royalty;
      map[t.platform].units += t.units || 0;
    });
    const total = Object.values(map).reduce((s, v) => s + v.grossRevenue, 0);
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        ...data,
        color: PLATFORM_COLORS[name] || "#94a3b8",
        pct: total > 0 ? (data.grossRevenue / total) * 100 : 0,
      }))
      .sort((a, b) => b.grossRevenue - a.grossRevenue);
  }, [yearFilteredTransactions]);

  const totalPlatformRevenue = platformBreakdown.reduce((s, p) => s + p.grossRevenue, 0);

  // Top earning books
  const topBooks = useMemo(() => {
    const map: Record<string, { royalty: number; units: number }> = {};
    yearFilteredTransactions.forEach((t) => {
      const title = t.bookTitle || "Unknown Book";
      if (!map[title]) map[title] = { royalty: 0, units: 0 };
      map[title].royalty += t.royalty;
      map[title].units += t.units || 0;
    });
    return Object.entries(map)
      .map(([title, data]) => ({ title, ...data, coverImage: bookDetails[title]?.coverImage || null }))
      .sort((a, b) => b.royalty - a.royalty)
      .slice(0, 6);
  }, [yearFilteredTransactions, bookDetails]);

  // Trend chart: monthly when a year is selected, yearly for all-time
  const trendData = useMemo(() => {
    if (selectedYear === "all") {
      const yearMap: Record<string, number> = {};
      enrichedTransactions.forEach((t) => {
        const year = t.date ? t.date.substring(0, 4) : "Unknown";
        yearMap[year] = (yearMap[year] || 0) + t.royalty;
      });
      return Object.entries(yearMap)
        .map(([label, royalty]) => ({ label, royalty }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    const monthMap: Record<number, number> = {};
    yearFilteredTransactions.forEach((t) => {
      const month = t.date ? new Date(t.date).getMonth() : null;
      if (month === null || Number.isNaN(month)) return;
      monthMap[month] = (monthMap[month] || 0) + t.royalty;
    });
    return MONTH_LABELS.map((label, idx) => ({ label, royalty: monthMap[idx] || 0 }));
  }, [selectedYear, enrichedTransactions, yearFilteredTransactions]);

  // Search + sort for the transaction table
  const visibleTxns = useMemo(() => {
    let rows = yearFilteredTransactions;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter(
        (t) => t.bookTitle?.toLowerCase().includes(q) || t.platform.toLowerCase().includes(q)
      );
    }
    if (txnSort === "earnings") {
      rows = [...rows].sort((a, b) => b.royalty - a.royalty);
    }
    return rows;
  }, [yearFilteredTransactions, searchQuery, txnSort]);

  const handleExportCSV = () => {
    const header = ["Date", "Book", "Platform", "Units", "Price", "Gross", "Royalty"];
    const rows = yearFilteredTransactions.map((t) => [
      t.date,
      t.bookTitle,
      t.platform,
      String(t.units ?? ""),
      String(t.price ?? ""),
      t.gross.toFixed(2),
      t.royalty.toFixed(2),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `royalty-report-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const periodLabel = selectedYear === "all" ? "All Time" : selectedYear;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-ink tracking-tight">
            Royalty Earnings
          </h1>
          <p className="text-[13px] text-muted mt-1">
            Effective {lifetimeStats.gross > 0 ? ((lifetimeStats.royalty / lifetimeStats.gross) * 100).toFixed(1) : 0}% royalty · Lifetime {formatINR(lifetimeStats.royalty)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year filter pills */}
          <div className="flex items-center gap-1.5 bg-ink/5 rounded-full p-1">
            <button
              onClick={() => setSelectedYear("all")}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full capitalize transition-colors ${selectedYear === "all" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
                }`}
            >
              All
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full capitalize transition-colors ${selectedYear === year ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
                  }`}
              >
                {year}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-[13px] font-semibold bg-ink text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/40"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Metric Cards (3-up) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Royalty */}
        <div className="bg-yellow rounded-xl2 p-5 flex flex-col shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center text-ink">
                <IndianRupee size={16} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-semibold text-ink/80">
                {selectedYear === "all" ? "Total Royalty" : `${selectedYear} Royalty`}
              </p>
            </div>
            {yoyGrowth && (
              <span className={`flex items-center text-[10px] font-bold bg-white/40 px-2 py-1 rounded-full ${yoyGrowth.pct >= 0 ? "text-ink" : "text-red-700"
                }`}>
                {yoyGrowth.pct >= 0 ? (
                  <ArrowUpRight size={12} className="mr-0.5" />
                ) : (
                  <ArrowDownRight size={12} className="mr-0.5" />
                )}
                {Math.abs(yoyGrowth.pct).toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-extrabold text-ink mb-1">
            {formatINR(periodStats.royalty)}
          </p>
          <p className="text-[11px] font-medium text-ink/60">
            {yoyGrowth
              ? `vs ${formatINR(yoyGrowth.prevRoyalty)} in ${yoyGrowth.prevYear}`
              : `From ${periodStats.count} transactions`}
          </p>
        </div>

        {/* Card 2: Gross Revenue */}
        <div className="bg-pink rounded-xl2 p-5 flex flex-col shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center text-ink">
              <TrendingUp size={16} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-semibold text-ink/80">Gross Revenue</p>
          </div>
          <p className="text-2xl font-extrabold text-ink mb-1">
            {formatINR(periodStats.gross)}
          </p>
          <p className="text-[11px] font-medium text-ink/60">
            {periodStats.units} units · {periodLabel}
          </p>
        </div>

        {/* Card 3: Royalty Rate Info */}
        <div className="bg-blue rounded-xl2 p-5 flex flex-col shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center text-ink">
              <Percent size={16} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-semibold text-ink/80">Avg. Royalty Rate</p>
          </div>
          <p className="text-2xl font-extrabold text-ink mb-1">
            {periodStats.gross > 0 ? ((periodStats.royalty / periodStats.gross) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-[11px] font-medium text-ink/60">
            {formatINR(periodStats.royalty)} from {formatINR(periodStats.gross)} gross
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">

        {/* Left Column */}
        <div className="flex flex-col gap-4">

          {/* Royalty Trend Chart */}
          <div className="bg-panel rounded-xl2 p-5 shadow-card flex flex-col flex-1">
            <p className="text-sm font-bold text-ink mb-2">
              {selectedYear === "all" ? "Yearly Royalty Trend" : `Monthly Trend — ${selectedYear}`}
            </p>
            <div className="flex-1 min-h-[240px] -ml-4 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRoyalty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#17171A" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#17171A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#17171A15" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#17171A80" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: "#17171A80" }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ stroke: "#17171A40", strokeWidth: 1, strokeDasharray: "4 4" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                    formatter={(value: number) => [formatINR(value), "Royalty"]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Area
                    type="monotone"
                    dataKey="royalty"
                    name="Royalty"
                    stroke="#17171A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRoyalty)"
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-panel rounded-xl2 p-5 shadow-card flex flex-col">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <p className="text-sm font-bold text-ink">Royalty Transactions</p>
              <button
                onClick={() => setTxnSort(txnSort === "recent" ? "earnings" : "recent")}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 hover:text-ink transition-colors"
              >
                <ArrowUpDown size={12} />
                {txnSort === "recent" ? "Most recent" : "Top earning"}
              </button>
            </div>

            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by book or platform"
                className="w-full text-[12px] font-medium text-ink bg-cream rounded-lg pl-8 pr-8 py-2 outline-none placeholder:text-ink/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="overflow-x-auto no-scrollbar max-h-[400px]">
              <table className="w-full text-left text-[12px]">
                <thead className="sticky top-0 bg-panel z-10">
                  <tr className="text-ink/50 border-b border-ink/5">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Book & Platform</th>
                    <th className="pb-3 font-medium text-center">Qty</th>
                    <th className="pb-3 font-medium text-right">Gross</th>
                    <th className="pb-3 font-medium text-right text-ink">Royalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {visibleTxns.slice(0, 20).map((t, idx) => {
                    const dateObj = new Date(t.date);
                    const formatted = dateObj.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <tr key={idx} className="hover:bg-cream transition-colors group">
                        <td className="py-2.5 font-medium text-ink/70 whitespace-nowrap">
                          {formatted}
                        </td>
                        <td className="py-2.5">
                          <p className="font-semibold text-ink truncate max-w-[180px]">{t.bookTitle}</p>
                          <p className="text-[10px] text-ink/50">{t.platform}</p>
                        </td>
                        <td className="py-2.5 text-center font-medium text-ink/70">
                          {t.units}
                        </td>
                        <td className="py-2.5 text-right font-medium text-ink/70">
                          {formatINR(t.gross)}
                        </td>
                        <td className="py-2.5 text-right font-bold text-ink">
                          {formatINR(t.royalty)}
                        </td>
                      </tr>
                    );
                  })}
                  {visibleTxns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-ink/50">
                        {searchQuery ? `No transactions match "${searchQuery}".` : "No transactions available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {visibleTxns.length > 20 && (
              <p className="text-[10px] font-medium text-ink/40 mt-2 text-right">
                Showing 20 of {visibleTxns.length}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">

          {/* Platform Breakdown */}
          <div className="bg-panel rounded-xl2 p-5 shadow-card flex flex-col">
            <p className="text-sm font-bold text-ink mb-3">Royalty by Platform</p>

            {/* Revenue share bar */}
            {platformBreakdown.length > 0 && (
              <div className="mb-4">
                <div className="h-2 w-full rounded-full overflow-hidden flex bg-ink/5">
                  {platformBreakdown.map((p) => (
                    <div
                      key={p.name}
                      style={{
                        width: totalPlatformRevenue > 0 ? `${(p.grossRevenue / totalPlatformRevenue) * 100}%` : 0,
                        backgroundColor: p.color,
                      }}
                      className="h-full transition-all duration-700 ease-out"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {platformBreakdown.map((p) => (
                    <span key={p.name} className="flex items-center gap-1 text-[10px] font-semibold text-ink/60">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name} · {p.pct.toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-ink/50 border-b border-ink/5">
                    <th className="pb-3 font-medium">Platform</th>
                    <th className="pb-3 font-medium text-right">Gross</th>
                    <th className="pb-3 font-medium text-right text-ink">Royalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {platformBreakdown.map((p) => (
                    <Fragment key={p.name}>
                      <tr
                        onClick={() => setExpandedPlatform(expandedPlatform === p.name ? null : p.name)}
                        className="group hover:bg-cream/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3 font-semibold text-ink flex items-center gap-2">
                          <ChevronDown
                            size={14}
                            className={`text-ink/40 transition-transform ${expandedPlatform === p.name ? "rotate-180" : ""}`}
                          />
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <div className="flex flex-col">
                            <span>{p.name}</span>
                            <span className="text-[10px] text-ink/50 font-medium">{p.units} units</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-medium text-ink/70">
                          {formatINR(p.grossRevenue)}
                        </td>
                        <td className="py-3 text-right font-bold text-ink">
                          {formatINR(p.royalty)}
                        </td>
                      </tr>
                      {expandedPlatform === p.name && (
                        <tr>
                          <td colSpan={3} className="p-0 border-b border-ink/5 bg-cream/50">
                            <div className="p-4 pl-8 text-[11px]">
                              {(() => {
                                const pTxns = yearFilteredTransactions.filter((t) => t.platform === p.name);
                                const grouped = new Map<string, { units: number; royalty: number }>();
                                pTxns.forEach((t) => {
                                  const existing = grouped.get(t.date) || { units: 0, royalty: 0 };
                                  existing.units += t.units;
                                  existing.royalty += t.royalty;
                                  grouped.set(t.date, existing);
                                });
                                const entries = Array.from(grouped.entries()).sort(
                                  (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
                                );

                                if (entries.length === 0) return <p className="text-ink/50 italic">No sales data.</p>;
                                return (
                                  <table className="w-full text-left">
                                    <tbody>
                                      {entries.slice(0, 10).map(([date, data]) => {
                                        const d = new Date(date);
                                        const label = d.toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        });
                                        return (
                                          <tr key={date} className="border-b border-ink/5 last:border-0">
                                            <td className="py-1.5 font-medium text-ink/70">{label}</td>
                                            <td className="py-1.5 text-center font-medium text-ink/60">{data.units} unit{data.units > 1 ? "s" : ""}</td>
                                            <td className="py-1.5 text-right font-bold text-ink/80">{formatINR(data.royalty)}</td>
                                          </tr>
                                        );
                                      })}
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
                  {platformBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-ink/50">No platform data for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Earning Books */}
          <div className="bg-panel rounded-xl2 p-5 shadow-card flex flex-col">
            <p className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-ink/60" />
              Top Earning Books
            </p>
            <div className="flex flex-col gap-3">
              {topBooks.length === 0 ? (
                <p className="text-[11px] font-medium text-ink/40 italic text-center py-4">No data available.</p>
              ) : (
                topBooks.map((book, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden shadow-sm bg-ink/5 relative">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-ink/30 text-center p-0.5">No Cover</div>
                      )}
                      {idx === 0 && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-yellow flex items-center justify-center shadow-sm">
                          <Crown size={10} className="text-ink" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-ink truncate">{book.title}</p>
                      <p className="text-[10px] text-ink/50 mt-0.5">{book.units} units</p>
                    </div>
                    <p className="text-[12px] font-bold text-ink shrink-0">{formatINR(book.royalty)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}