"use client";

import { useState } from "react";
import { Search, User, Bell, Settings } from "lucide-react";

export const searchFilters = ["Books", "Sales", "Reviews", "Community"];

export default function TopBar() {
  const [activeFilter, setActiveFilter] = useState(searchFilters[0]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 flex items-center gap-3 bg-panel rounded-full pl-2 pr-3 py-2 shadow-card">
        <span className="w-8 h-8 rounded-full bg-pink-soft flex items-center justify-center shrink-0">
          <Search size={15} className="text-ink" strokeWidth={2.5} />
        </span>
        <input
          type="text"
          placeholder="Search your dashboard..."
          className="bg-transparent outline-none text-sm placeholder:text-muted flex-1 min-w-[60px]"
        />
        <span className="hidden md:inline text-[13px] text-muted mr-1">In:</span>
        <div className="hidden md:flex items-center gap-1">
          {searchFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? "bg-ink text-white"
                  : "text-ink/70 hover:bg-cream"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <IconCircle aria-label="Profile">
          <User size={16} strokeWidth={2} />
        </IconCircle>
        <IconCircle aria-label="Notifications">
          <Bell size={16} strokeWidth={2} />
        </IconCircle>
        <IconCircle aria-label="Settings">
          <Settings size={16} strokeWidth={2} />
        </IconCircle>
      </div>
    </div>
  );
}

function IconCircle({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center hover:opacity-90 transition-opacity"
    >
      {children}
    </button>
  );
}