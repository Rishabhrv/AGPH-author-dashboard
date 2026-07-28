"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  User,
  Lock,
  AlertCircle,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Star,
  Eye,
  EyeOff,
  IndianRupee,
} from "lucide-react";
import { loginAction } from "@/actions/auth";
import Logo from "@/public/Logo/AGPH_White_Logo.webp";

export default function LoginCo() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setErrorMsg("");

    startTransition(async () => {
      const res = await loginAction(null, formData);

      if (res?.error) {
        setErrorMsg(res.error);
      } else if (res?.success) {
        router.push("/");
      }
    });
  }

  return (
    <div className="min-h-screen w-full flex bg-[#f4f7fb]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[52%] relative bg-slate-900  overflow-hidden">
        {/* Cover image */}
        <div className="absolute inset-0">
          <img
            src="/login-cover.png"
            alt="Author Dashboard"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-[#275697]/40" />
        </div>

        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#275697]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col px-14 py-16  w-full h-full justify-between">
          {/* Top — Logo */}
          <div className="flex items-center">
            <Image
              src={Logo}
              alt="AGPH Logo"
              className="h-20 w-auto"
              height={40}
              width={82}
              priority
            />
          </div>

          {/* Middle — Headline + Features */}
          <div className="mb-auto mt-10 w-full">
            <h2 className="text-[45px] font-extrabold text-white tracking-tight leading-[1.15] mb-4">
              From manuscripts <br /> to salesmanage everything <br /><span className="text-sky-400">one dashboard.</span>

            </h2>
            <p className="text-[15px] font-medium text-slate-400 leading-j max-w-sm mb-7">
              Track sales, manage royalties, monitor reviews, and grow your author career — all from one place.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
                  <TrendingUp size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Real-time Sales Analytics</p>
                  <p className="text-[12px] font-medium text-slate-500">Track units sold across all platforms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
                  <IndianRupee size={16} className="text-sky-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Royalty Management</p>
                  <p className="text-[12px] font-medium text-slate-500">Transparent earnings breakdown</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
                  <Star size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Ratings & Reviews</p>
                  <p className="text-[12px] font-medium text-slate-500">Monitor reader feedback live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 sm:px-12 py-10 relative">
        {/* Subtle background decoration */}
        <div className="absolute top-[-80px] right-[-60px] w-[300px] h-[300px] rounded-full bg-[#275697]/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-40px] w-[250px] h-[250px] rounded-full bg-sky-400/[0.03] blur-3xl pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden flex items-center">
            <Image
              src={Logo}
              alt="AGPH Logo"
              className="h-9 w-auto"
              height={36}
              width={74}
              priority
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="mt-1.5 text-[14px] font-medium text-slate-500">
              Sign in to your author dashboard
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form action={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700 ml-0.5">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User
                    size={16}
                    className="text-slate-400 group-focus-within:text-[#275697] transition-colors"
                  />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#275697] focus:ring-4 focus:ring-[#275697]/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between ml-0.5">
                <label className="text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[12px] font-semibold text-[#275697] hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock
                    size={16}
                    className="text-slate-400 group-focus-within:text-[#275697] transition-colors"
                  />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-11 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#275697] focus:ring-4 focus:ring-[#275697]/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-3 w-full bg-slate-900 text-white rounded-xl py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    size={16}
                    className="opacity-60 group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-[13px] text-slate-500">
              Don&apos;t have an author account?{" "}
              <a href="#" className="font-bold text-[#275697] hover:underline">
                Apply now
              </a>
            </p>
          </div>

          {/* Copyright */}
          <p className="mt-8 text-center text-[12px] font-medium text-slate-400">
            © {new Date().getFullYear()} AGPH · Author Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

