import { Heart, Video } from "lucide-react";
import { waitingForBills } from "@/lib/data";

const icons: Record<string, React.ElementType> = { heart: Heart, video: Video };

export default function WaitingForBillsCard() {
  return (
    <div>
      <p className="text-sm font-bold text-ink mb-3">Waiting for bills</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {waitingForBills.map((p) => {
          const Icon = icons[p.icon];
          return (
            <div
              key={p.name}
              className="bg-panel rounded-xl2 p-3.5 shadow-card flex flex-col gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-9 h-9 rounded-full ${p.avatarColor} flex items-center justify-center shrink-0`}
                >
                  <Icon size={15} className="text-ink" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink truncate">{p.name}</p>
                  <p className="text-[11px] text-muted truncate">{p.detail}</p>
                </div>
                <span className="text-[11px] font-semibold text-ink/60 shrink-0">
                  {p.time}
                </span>
              </div>
              <button className="w-full bg-ink text-white text-[12px] font-semibold rounded-full py-2">
                Request payment
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
