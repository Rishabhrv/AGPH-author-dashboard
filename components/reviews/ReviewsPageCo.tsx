"use client";

import { useState, useMemo, useRef } from "react";
import { Star, TrendingUp, MessageCircle, ChevronDown, ArrowUpRight, Search, Calendar, ChevronLeft, ChevronRight, BookOpen, ThumbsUp, Quote, Download } from "lucide-react";

type FilterMode = "preset" | "single" | "range" | "month";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const PLATFORM_COLORS: Record<string, string> = {
  Amazon: "#FF9900",
  Flipkart: "#2874F0",
  "AGPH Website": "#34A853",
};

export default function ReviewsPageCo({ initialData, storeUrl = "http://localhost:5000" }: { initialData?: any; storeUrl?: string }) {
  const allReviews = useMemo(() => initialData?.reviews || [], [initialData]);
  const booksData = useMemo(() => initialData?.books || [], [initialData]);

  // Compute summary stats
  const summaryData = useMemo(() => {
    if (!allReviews.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: [
          { stars: 5, count: 0, percent: 0 },
          { stars: 4, count: 0, percent: 0 },
          { stars: 3, count: 0, percent: 0 },
          { stars: 2, count: 0, percent: 0 },
          { stars: 1, count: 0, percent: 0 },
        ]
      };
    }
    const total = allReviews.length;
    let sum = 0;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    allReviews.forEach((r: any) => {
      sum += r.rating;
      if (counts[r.rating as keyof typeof counts] !== undefined) {
        counts[r.rating as keyof typeof counts]++;
      }
    });

    const avg = sum / total;
    return {
      averageRating: Number(avg.toFixed(1)),
      totalReviews: total,
      distribution: [
        { stars: 5, count: counts[5], percent: Math.round((counts[5] / total) * 100) },
        { stars: 4, count: counts[4], percent: Math.round((counts[4] / total) * 100) },
        { stars: 3, count: counts[3], percent: Math.round((counts[3] / total) * 100) },
        { stars: 2, count: counts[2], percent: Math.round((counts[2] / total) * 100) },
        { stars: 1, count: counts[1], percent: Math.round((counts[1] / total) * 100) },
      ]
    };
  }, [allReviews]);

  const [filterPlatform, setFilterPlatform] = useState("All Platforms");
  const [filterRating, setFilterRating] = useState("All Ratings");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("preset");
  const [presetDays, setPresetDays] = useState<number | "all">("all");
  const [singleDate, setSingleDate] = useState("2026-07-14");
  const [rangeStart, setRangeStart] = useState("2026-06-14");
  const [rangeEnd, setRangeEnd] = useState("2026-07-14");
  const [monthValue, setMonthValue] = useState("2026-07");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Helper: subtract days from an ISO date string
  const addDays = (iso: string, days: number) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  // Resolve the active date period with start/end for filtering
  const activePeriod = useMemo(() => {
    if (filterMode === "single") {
      return { start: singleDate, end: singleDate, label: singleDate };
    }
    if (filterMode === "month") {
      const [y, m] = monthValue.split("-").map(Number);
      const start = `${monthValue}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${monthValue}-${String(lastDay).padStart(2, "0")}`;
      return { start, end, label: monthValue };
    }
    if (filterMode === "range") {
      return { start: rangeStart, end: rangeEnd, label: `${rangeStart} – ${rangeEnd}` };
    }
    if (presetDays === "all") {
      return { start: "2000-01-01", end: today, label: "All Time" };
    }
    const start = addDays(today, -(presetDays - 1));
    return { start, end: today, label: `Last ${presetDays} Days` };
  }, [filterMode, singleDate, monthValue, rangeStart, rangeEnd, presetDays, today]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter((review: any) => {
      // Date filter
      if (review.isoDate < activePeriod.start || review.isoDate > activePeriod.end) return false;
      // Platform filter
      if (filterPlatform !== "All Platforms" && review.platform !== filterPlatform) return false;
      // Rating filter
      if (filterRating !== "All Ratings" && review.rating.toString() !== filterRating.split(" ")[0]) return false;
      // Search filter
      if (searchQuery && !review.book.toLowerCase().includes(searchQuery.toLowerCase()) && !review.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Book filter
      if (selectedBook && review.book !== selectedBook) return false;
      return true;
    });
  }, [allReviews, activePeriod, filterPlatform, filterRating, searchQuery, selectedBook]);

  const scrollCarousel = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Reviewer", "Date", "Rating", "Book", "Platform", "Review", "Helpful Count"];
    const rows = filteredReviews.map((r: any) => [
      r.reviewer,
      r.isoDate,
      r.rating.toString(),
      r.book,
      r.platform,
      `"${r.text.replace(/"/g, '""')}"`,
      r.helpfulCount.toString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reviews_${activePeriod.start}_to_${activePeriod.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Ratings & Reviews</h1>
          <p className="text-[14px] text-slate-500 font-medium">Track reader feedback across all platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen((v) => !v)}
              className="flex items-center gap-2 text-[13px] font-semibold bg-white shadow-sm text-slate-900 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors border border-slate-200"
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
                        className={`flex-1 text-[11px] font-bold py-1.5 rounded-full capitalize transition-colors ${filterMode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
                      >
                        {m === "preset" ? "Quick" : m}
                      </button>
                    ))}
                  </div>

                  {filterMode === "preset" && (
                    <div className="flex flex-col gap-1.5">
                      {[7, 30, 90, 365, "all"].map((d) => (
                        <button
                          key={d}
                          onClick={() => { setPresetDays(d as any); setIsDatePickerOpen(false); }}
                          className={`text-left text-[13px] font-semibold px-3 py-2 rounded-lg transition-colors ${presetDays === d ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-900"}`}
                        >
                          {d === "all" ? "All Time" : `Last ${d} Days`}
                        </button>
                      ))}
                    </div>
                  )}

                  {filterMode === "single" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-slate-500">Pick a date</label>
                      <input type="date" value={singleDate} max={today} onChange={(e) => setSingleDate(e.target.value)} className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none" />
                      <button onClick={() => setIsDatePickerOpen(false)} className="mt-1 text-[12px] font-bold bg-slate-900 text-white rounded-lg py-2">Apply</button>
                    </div>
                  )}

                  {filterMode === "range" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-slate-500">Start date</label>
                      <input type="date" value={rangeStart} max={rangeEnd} onChange={(e) => setRangeStart(e.target.value)} className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none" />
                      <label className="text-[11px] font-semibold text-slate-500 mt-1">End date</label>
                      <input type="date" value={rangeEnd} min={rangeStart} max={today} onChange={(e) => setRangeEnd(e.target.value)} className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none" />
                      <button onClick={() => setIsDatePickerOpen(false)} className="mt-1 text-[12px] font-bold bg-slate-900 text-white rounded-lg py-2">Apply</button>
                    </div>
                  )}

                  {filterMode === "month" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-slate-500">Pick a month</label>
                      <input type="month" value={monthValue} max={today.slice(0, 7)} onChange={(e) => setMonthValue(e.target.value)} className="w-full text-[13px] font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 outline-none" />
                      <button onClick={() => setIsDatePickerOpen(false)} className="mt-1 text-[12px] font-bold bg-slate-900 text-white rounded-lg py-2">Apply</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-[13px] font-bold shadow-md hover:bg-slate-100 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Overall Rating Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

          <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4">Overall Rating</h3>

          <div className="flex items-end gap-3 mb-3">
            <div className="text-4xl font-black text-slate-900">{summaryData.averageRating}</div>
            <div className="text-sm font-semibold text-slate-500">out of 5</div>
          </div>
          <div className="flex gap-1 mt-3 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={s <= Math.round(summaryData.averageRating) ? "fill-yellow text-yellow" : "fill-ink/10 text-transparent"}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{summaryData.totalReviews.toLocaleString()} Global Ratings</p>

          <div className="mt-auto pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-[12px] font-bold">
              <span className="text-slate-500">Versus last month</span>
              <span className="text-green flex items-center gap-1"><ArrowUpRight size={14} /> +0.2</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:col-span-2">
          <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4">Rating Distribution</h3>

          <div className="flex flex-col gap-2.5 flex-1 justify-center">
            {summaryData.distribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-[13px] font-bold text-slate-900">{dist.stars}</span>
                  <Star size={12} className="text-yellow" fill="currentColor" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow to-pink rounded-full"
                    style={{ width: `${dist.percent}%` }}
                  />
                </div>

                <div className="w-16 text-right shrink-0">
                  <span className="text-[12px] font-medium text-slate-500">{dist.percent}%</span>
                </div>
              </div>
            ))}
          </div>
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

        <div className="w-full overflow-x-auto no-scrollbar pb-2 scroll-smooth" ref={carouselRef}>
          <div className="flex gap-4 min-w-max px-2">
            <button
              onClick={() => setSelectedBook(null)}
              className={`flex-shrink-0 w-32 flex flex-col gap-3 group transition-opacity ${selectedBook === null ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
            >
              <div className={`w-full aspect-[2/3] rounded-xl flex items-center justify-center border-2 transition-colors ${selectedBook === null ? 'border-slate-300 bg-slate-100' : 'border-transparent bg-slate-100'}`}>
                <BookOpen size={32} className="text-slate-500" />
              </div>
              <p className="text-[11px] font-bold text-slate-500 truncate w-full text-center">All Books</p>
            </button>

            {booksData.map((book: any, idx: number) => (
              <button
                key={book.title}
                onClick={() => setSelectedBook(book.title)}
                className={`flex-shrink-0 w-32 flex flex-col gap-3 group transition-opacity `}
              >
                {book.coverImage ? (
                  <img
                    src={`${storeUrl}${book.coverImage}`}
                    alt={book.title}
                    className={`w-full h-full  rounded-xl shadow-sm border-2 transition-colors ${selectedBook === book.title ? 'border-slate-300' : 'border-transparent'}`}
                  />
                ) : (
                  <div
                    style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}
                    className={`w-full h-full rounded-xl shadow-sm border-2 transition-colors flex items-end p-3 ${selectedBook === book.title ? 'border-slate-300' : 'border-transparent'}`}
                  >
                    <div className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded w-full text-left truncate shadow-sm">
                      {book.title}
                    </div>
                  </div>
                )}
                <p className="text-[11px] font-bold text-slate-500 truncate w-full text-center">{book.title}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => scrollCarousel("right")}
          className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-sm items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Filters and Search inline */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-100 transition-colors border-none rounded-xl py-2 pl-4 pr-10 text-[13px] font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option>All Platforms</option>
              <option>Amazon</option>
              <option>Flipkart</option>
              <option>AGPH Website</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-100 transition-colors border-none rounded-xl py-2 pl-4 pr-10 text-[13px] font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option>All Ratings</option>
              <option>5 Stars</option>
              <option>4 Stars</option>
              <option>3 Stars</option>
              <option>2 Stars</option>
              <option>1 Star</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search reviews or books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-slate-200 rounded-xl py-2 pl-9 pr-4 text-[13px] font-medium text-slate-900 outline-none transition-colors"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review: any, index: number) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {/* Decorative quote watermark */}
              <Quote size={80} className="absolute -top-3 -right-3 text-orange-200/30 rotate-12" />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    style={{ background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length] }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[12px] shadow-sm shrink-0"
                  >
                    {review.reviewer.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">{review.reviewer}</h4>
                    <p className="text-[11px] font-medium text-slate-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        fill={s <= review.rating ? "currentColor" : "none"}
                        className={s <= review.rating ? "text-yellow" : "text-slate-500"}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${PLATFORM_COLORS[review.platform] || "#666"}15`,
                      color: PLATFORM_COLORS[review.platform] || "#666",
                    }}
                  >
                    {review.platform}
                  </span>
                </div>
              </div>

              {/* Book tag */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {review.book}
                </span>
              </div>

              {/* Review text */}
              <p className="text-[13px] text-slate-500 leading-relaxed flex-1">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200">
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  <ThumbsUp size={12} />
                  Helpful ({review.helpfulCount})
                </button>
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  <MessageCircle size={12} />
                  Reply
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
            <MessageCircle size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-[16px] font-bold text-slate-900 mb-1">No reviews found</h3>
            <p className="text-[13px] text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

    </div>
  );
}

