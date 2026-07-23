"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { loginAction } from "@/actions/auth";

export default function LoginCo() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

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
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel - Image/Marketing */}
      <div className="hidden lg:flex w-1/2 relative bg-ink items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/login-cover.png" 
            alt="Author Dashboard" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink to-yellow rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl mb-8 border border-white/20 backdrop-blur-sm">
            AG
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Empower your writing journey.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Access your author dashboard to track sales, manage royalties, and connect with your audience in real-time.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-ink/5 relative">
        {/* Decorative elements for the right panel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          
          <div className="mb-10 lg:hidden text-center">
             <div className="w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-extrabold text-xl shadow-md">
                AG
             </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-[14px] text-ink/60">
              Sign in to your account to continue
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-pink/10 border border-pink/20 rounded-xl flex items-start gap-3 text-pink">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form action={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-ink/70 uppercase tracking-wider pl-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-ink">
                  <User size={18} className="text-ink/40 group-focus-within:text-ink transition-colors" />
                </div>
                <input 
                  name="username"
                  type="text" 
                  required
                  placeholder="Enter your username"
                  className="w-full bg-white border border-ink/10 rounded-xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-ink outline-none focus:border-ink/40 focus:ring-4 focus:ring-ink/5 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[12px] font-bold text-ink/70 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-[12px] font-bold text-ink/60 hover:text-ink transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-ink">
                  <Lock size={18} className="text-ink/40 group-focus-within:text-ink transition-colors" />
                </div>
                <input 
                  name="password"
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-ink/10 rounded-xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-ink outline-none focus:border-ink/40 focus:ring-4 focus:ring-ink/5 transition-all shadow-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="mt-4 w-full bg-ink text-white rounded-xl py-4 text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-ink/90 transition-all shadow-lg shadow-ink/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[13px] text-ink/60">
              Don't have an author account? <a href="#" className="font-bold text-ink hover:underline">Apply now</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
