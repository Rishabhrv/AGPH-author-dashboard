"use client";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  TrendingUp,
  BookOpen,
  Trophy,
  Star,
  Bell,
  HelpCircle,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Megaphone,
  Image as ImageIcon,
  FileText,
  Library,
  IndianRupee,
} from "lucide-react";

// --- Navigation Data ---
const generalNav = [
  { label: "Sales", href: "/sales", icon: "sales" },
  { label: "Book Progress", href: "/books", icon: "books" },
  { label: "Community", href: "/community", icon: "community" },
  { label: "Ratings & Reviews", href: "/reviews", icon: "reviews" },
  { label: "Royalty", href: "/royalty", icon: "royalty" },
];


const toolsNav = [
  { label: "Support", href: "/support", icon: "support" },
  { label: "Author Profile", href: "/profile", icon: "profile" },
];

const icons: Record<string, React.ElementType> = {
  sales: TrendingUp,
  audience: Users,
  books: BookOpen,
  community: Trophy,
  reviews: Star,
  promos: Megaphone,
  assets: ImageIcon,
  submit: FileText,
  notifications: Bell,
  knowledge: Library,
  support: HelpCircle,
  profile: User,
  royalty: IndianRupee,
};

export default function Sidebar({ active }: { active: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <aside
      className={`sticky top-5 h-[calc(100vh-40px)] hidden lg:flex flex-col shrink-0 bg-gradient-to-r from-ink to-ink/90  rounded-[22px] py-5 transition-all duration-300 ease-in-out ${isCollapsed ? "w-[75px] px-3" : "w-[240px] px-4"
        }`}
    >
      {/* Header / Logo */}
      <div
        className={`flex items-center mb-8 h-7 ${isCollapsed ? "justify-center" : "justify-between px-1"
          }`}
      >
        {!isCollapsed && (
          <Link href="/" className="text-white text-xl font-extrabold tracking-tight whitespace-nowrap">
            AGPH
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-7 h-7 rounded-full bg-pink flex items-center justify-center text-ink shrink-0 transition-transform hover:scale-105"
        >
          {isCollapsed ? (
            <ChevronRight size={14} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={14} strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-6 overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Section 1: General Dashboard */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold tracking-wide text-white/35 uppercase mb-2 whitespace-nowrap">
              Dashboard
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {generalNav.map((item) => (
              <NavRow
                key={item.label}
                item={item}
                active={active}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </div>


        {/* Section 3: Account Tools */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold tracking-wide text-white/35 uppercase mb-2 whitespace-nowrap">
              Account Tools
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {toolsNav.map((item) => (
              <NavRow
                key={item.label}
                item={item}
                active={active}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="pt-4 mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center py-2.5 text-white/60 text-sm font-medium hover:text-white transition-colors ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut size={17} strokeWidth={2} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </aside>
  );
}

function NavRow({
  item,
  active,
  isCollapsed,
}: {
  item: { label: string; href: string; icon: string };
  active: string;
  isCollapsed: boolean;
}) {
  const Icon = icons[item.icon] ?? TrendingUp;

  // Smaarter matching: checks if 'active' matches the route href OR the icon name
  const isActive = item.href === active || item.icon === active || item.label === active;

  return (
    <li>
      <a
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={`relative flex items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isCollapsed ? "justify-center " : "gap-3 px-3"
          } ${isActive
            ? "bg-white/[0.07] text-white"
            : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
          }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-pink transition-all duration-300" />
        )}
        <Icon
          size={17}
          strokeWidth={2}
          className={`shrink-0 ${isActive ? "text-pink" : ""}`}
        />
        {!isCollapsed && (
          <span className="truncate whitespace-nowrap transition-opacity duration-300">
            {item.label}
          </span>
        )}
      </a>
    </li>
  );
}