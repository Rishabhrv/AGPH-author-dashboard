"use client";

import { useState, useRef, useEffect } from "react";
import { Search, User, Bell, LogOut, Medal, BookOpen, TrendingUp, Star, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import { logoutAction, getAuthorProfileData, getAuthorBadges } from "@/actions/auth";
import { searchDashboard, SearchResult } from "@/actions/search";
import BadgeSystemCo, { TIERS } from "../profile/BadgeSystemCo";

export const searchFilters = ["Sales", "Reviews"];


export default function TopBar() {
  const [activeFilter, setActiveFilter] = useState(searchFilters[0]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentTierName, setCurrentTierName] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const platformDot: Record<string, string> = {
    Amazon: "bg-amber-500",
    Flipkart: "bg-blue-600",
    Website: "bg-slate-400",
  };

  useEffect(() => {
    getAuthorProfileData().then((data) => {
      if (data && data.profileImageUrl) {
        setProfileImage(data.profileImageUrl);
      }
    });
    getAuthorBadges().then((data) => {
      if (data && data.current_tier) {
        setCurrentTierName(data.current_tier);
      }
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      searchDashboard(searchQuery, activeFilter).then(res => {
        setSearchResults(res);
        setIsSearching(false);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeFilter]);

  const getIconForType = (type: string) => {
    switch (type) {
      case "book": return <BookOpen size={16} className="text-slate-400" />;
      case "sale": return <TrendingUp size={16} className="text-slate-400" />;
      case "review": return <Star size={16} className="text-slate-400" />;
      case "community": return <Users size={16} className="text-slate-400" />;
      default: return <Search size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="flex-1 w-full relative z-40" ref={searchRef}>
        <div className={`flex items-center gap-3 bg-white border border-slate-200 rounded-lg pl-3 pr-2 py-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-slate-300 ${isSearchOpen && (searchResults.length > 0 || isSearching) ? 'rounded-b-none border-b-0 shadow-md' : ''}`}>
          <Search size={16} className="text-slate-400 shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search your dashboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 flex-1 min-w-[60px]"
          />
          {isSearching && (
            <Loader2 size={16} className="text-slate-400 animate-spin shrink-0" />
          )}
          <div className="hidden md:flex items-center gap-1">
            {searchFilters.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setActiveFilter(f);
                  setSearchQuery("");
                }}
                className={`px-3 py-1.5 rounded-md text-[12px] font-bold whitespace-nowrap transition-colors ${activeFilter === f
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 border-t-0 rounded-b-lg shadow-lg max-h-[400px] overflow-y-auto">
            {isSearching && searchResults.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">
                Searching {activeFilter}...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col ">
                {searchResults.map((result, idx) => (
                  result.type === "sale_book" ? (
                    <Link
                      href={result.url}
                      key={result.id + "-" + idx}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      {/* Cover Image */}
                      {result.image && result.image !== "" ? (
                        <img src={result.image} alt={result.title} className="w-20 h-28  rounded-md shadow-sm border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-20 h-28 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <BookOpen size={24} className="text-slate-400" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex flex-col flex-1 max-w-[300px]">
                        <span className="text-[14px] font-bold text-slate-900 line-clamp-1">{result.title}</span>
                        <span className="text-[13px] font-semibold text-emerald-600 mb-1">₹{result.price} MRP</span>
                        <div className="flex flex-col gap-1.5 flex-1 max-w-[200px]">
                          {result.recentSales?.map((sale, sIdx) => {
                            const dateStr = sale.date
                              ? new Date(sale.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : '';
                            return (
                              <div key={sIdx} className="flex items-center justify-between text-[12px]">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${platformDot[sale.platform] ?? "bg-slate-400"}`} />
                                  {sale.platform}
                                </span>
                                <span className="flex items-center gap-2.5 tabular-nums">
                                  <span className="font-bold text-slate-800">{sale.units}×</span>
                                  <span className="text-slate-400 text-[11px]">{dateStr}</span>
                                </span>
                              </div>
                            );
                          })}
                          {(!result.recentSales || result.recentSales.length === 0) && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full w-fit">
                              No recent sales
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Graph */}
                      <div className="w-32 h-20 shrink-0  hidden sm:block">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={result.chartData}>
                            <defs>
                              <linearGradient id={`colorUnits-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#275697" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#275697" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis hide dataKey="date" />
                            <YAxis hide domain={[0, 'dataMax']} />
                            <Tooltip
                              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '10px', padding: '4px 8px' }}
                              formatter={(value: number) => [`${value} units sold`, '']}
                              labelFormatter={(label) => {
                                if (!label) return '';
                                const d = new Date(label + "-01");
                                return isNaN(d.getTime()) ? label : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                              }}
                              labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '2px' }}
                            />
                            <Area type="monotone" dataKey="units" stroke="#275697" strokeWidth={2} fillOpacity={1} fill={`url(#colorUnits-${idx})`} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Link>
                  ) : result.type === "review_book" ? (
                    <Link
                      href={result.url}
                      key={result.id + "-" + idx}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      {/* Cover Image */}
                      {result.image && result.image !== "" ? (
                        <img src={result.image} alt={result.title} className="w-20 h-28 rounded-md shadow-sm border border-slate-200 shrink-0 object-cover" />
                      ) : (
                        <div className="w-20 h-28 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <BookOpen size={24} className="text-slate-400" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex flex-col flex-1 max-w-[250px]">
                        <span className="text-[14px] font-bold text-slate-900 line-clamp-1">{result.title}</span>
                        <span className="text-[13px] font-semibold text-emerald-600 mb-1">₹{result.price} MRP</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star size={12} fill="currentColor" />
                            <span className="ml-1 text-[11px] font-bold text-amber-700">{result.rating}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">({result.reviewsCount} reviews)</span>
                        </div>
                      </div>

                      {/* 3 Reviews Side by Side */}
                      <div className="ml-auto hidden md:flex items-stretch gap-3 flex-1 max-w-[550px]">
                        {result.recentReviews?.map((rev: any, rIdx: number) => (
                          <div key={rIdx} className="flex-1 bg-white border border-slate-200 rounded-md p-3 flex flex-col justify-between shadow-sm">
                            <div className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">"{rev.text}"</div>
                            <div className="mt-2 flex items-center justify-between pt-2">
                              <span className="text-[10px] font-bold text-slate-400 line-clamp-1">{rev.reviewer}</span>
                              <span className="flex items-center text-amber-500 text-[10px] font-bold"><Star size={10} fill="currentColor" className="mr-0.5" />{rev.rating}</span>
                            </div>
                          </div>
                        ))}
                        {(!result.recentReviews || result.recentReviews.length === 0) && (
                          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">No reviews yet</div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <Link
                      href={result.url}
                      key={result.id + "-" + idx}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        {getIconForType(result.type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 line-clamp-1">{result.title}</span>
                        <span className="text-xs font-medium text-slate-500 line-clamp-1">{result.subtitle}</span>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm font-medium">No results found for "{searchQuery}" in {activeFilter}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {currentTierName ? (() => {
          const tier = TIERS.find(t => t.name === currentTierName) || TIERS[0];
          const TierIcon = tier.icon;
          return (
            <button
              aria-label="Badges & Ranks"
              onClick={() => setIsBadgeModalOpen(true)}
              className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity bg-gradient-to-br ${tier.color} text-white shadow-sm`}
            >
              <TierIcon size={18} strokeWidth={2.5} />
            </button>
          );
        })() : (
          <IconSquare aria-label="Badges & Ranks" onClick={() => setIsBadgeModalOpen(true)}>
            <Medal size={18} strokeWidth={2} />
          </IconSquare>
        )}

        <IconSquare aria-label="Notifications">
          <Bell size={18} strokeWidth={2} />
        </IconSquare>

        <div className="relative shrink-0 ml-2" ref={profileRef}>
          <button
            aria-label="Profile"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 min-w-[40px] min-h-[40px] aspect-square rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center overflow-hidden hover:bg-slate-200 transition-colors shrink-0 p-0"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} strokeWidth={2} />
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 overflow-hidden">
              <Link
                href="/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User size={14} className="text-slate-400" /> Author Profile
              </Link>
              <div className="h-px bg-slate-100 my-1 mx-2" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logoutAction();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <BadgeSystemCo isOpen={isBadgeModalOpen} onClose={() => setIsBadgeModalOpen(false)} />
    </div>
  );
}

function IconSquare({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
    >
      {children}
    </button>
  );
}