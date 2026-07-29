"use client";
import Link from "next/link";
import Image from "next/image";

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
  LayoutDashboard,
} from "lucide-react";
import Logo from "@/public/Logo/AGPH-Logo-Black-600x290.webp";


// --- Navigation Data ---
const generalNav = [
  { label: "Overview", href: "/", icon: "dashboard" },
  { label: "Sales", href: "/sales", icon: "sales" },
  { label: "Book Progress", href: "/books", icon: "books" },
  { label: "Ratings & Reviews", href: "/reviews", icon: "reviews" },
  { label: "Royalty", href: "/royalty", icon: "royalty" },
];

const toolsNav = [
  { label: "Author Profile", href: "/profile", icon: "profile" },
];

const icons: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
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
      className={`sticky top-5 h-[calc(100vh-40px)] hidden lg:flex flex-col shrink-0 bg-white border border-slate-200 rounded-[22px] py-5 shadow-sm transition-all duration-300 ease-in-out ${isCollapsed ? "w-[75px] px-3" : "w-[240px] px-4"
        }`}
    >
      {/* Header / Logo */}
      <div
        className={`flex items-center mt-3 mb-8 h-10 ${isCollapsed ? "justify-center" : " px-1"
          }`}
      >
        {!isCollapsed && (
          <Link href="/" className="w-full text-slate-900 text-xl font-extrabold tracking-tight whitespace-nowrap flex items-center justify-center gap-2">
            <Image
              src={Logo}
              alt="AGPH Logo"
              className="h-13 p-6 w-auto items-center"
              unoptimized
            />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 shrink-0 transition-colors"
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
            <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 whitespace-nowrap">
              Dashboard
            </p>
          )}
          <ul className="flex flex-col gap-1">
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
            <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 whitespace-nowrap">
              Account Tools
            </p>
          )}
          <ul className="flex flex-col gap-1">
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
      <div className="pt-4 mt-auto border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center py-2.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"
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

  // Smarter matching: checks if 'active' matches the route href OR the icon name
  const isActive = item.href === active || item.icon === active || item.label === active;

  return (
    <li>
      <a
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={`relative flex items-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isCollapsed ? "justify-center " : "gap-3 px-3"
          } ${isActive
            ? "bg-sky-50 text-[#275697]"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-md bg-[#275697] transition-all duration-300" />
        )}
        <Icon
          size={18}
          strokeWidth={isActive ? 2.5 : 2}
          className={`shrink-0 ${isActive ? "text-[#275697]" : "text-slate-400"}`}
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