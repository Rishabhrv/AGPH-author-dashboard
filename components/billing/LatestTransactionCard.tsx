import { Repeat } from "lucide-react";
import { latestTransactions } from "@/lib/data";

export default function LatestTransactionCard() {
  return (
    <div>
      <p className="text-sm font-bold text-ink mb-3">Latest transaction</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {latestTransactions.map((t) => (
          <div
            key={t.id}
            className="bg-panel rounded-xl2 p-3.5 shadow-card flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-cream flex items-center justify-center">
                <Repeat size={13} className="text-ink/60" strokeWidth={2} />
              </span>
              <span className="text-[13px] font-bold text-[#3F6B2B] bg-[#B9D9A0]/40 px-2 py-0.5 rounded-full">
                {t.amount}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-bold text-ink truncate">{t.payer}</p>
              <p className="text-[11px] text-muted truncate">{t.note}</p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-line">
              <span>{t.id}</span>
              <span>{t.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
