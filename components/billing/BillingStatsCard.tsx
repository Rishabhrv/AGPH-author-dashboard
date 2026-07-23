import { Heart, Wallet, Banknote, ArrowUp, ArrowDown } from "lucide-react";
import { billingStats } from "@/lib/data";

const icons: Record<string, React.ElementType> = {
  "Payments received": Heart,
  "Payments requested": Wallet,
  "Non insurance payments": Banknote,
};

export default function BillingStatsCard() {
  return (
    <div className="flex flex-col gap-3 h-full">
      {billingStats.map((s) => {
        const Icon = icons[s.label];
        const up = s.trend === "up";
        return (
          <div
            key={s.label}
            className={`rounded-xl2 p-4 flex-1 flex flex-col justify-between ${s.color}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={15} className="text-ink/70" strokeWidth={2} />
                <span className="text-[13px] font-semibold text-ink/80">{s.label}</span>
              </div>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-2xl font-extrabold text-ink leading-none">{s.value}</p>
                <p className="text-[10px] text-ink/50 mt-1.5">{s.note}</p>
              </div>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full ${
                  up ? "bg-white/50 text-[#3F6B2B]" : "bg-white/50 text-[#9A3B3B]"
                }`}
              >
                {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {s.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
