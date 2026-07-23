"use client";

import { useState, useMemo } from "react";
import { Download, ArrowUpRight } from "lucide-react";
import { transactionTabs, transactions, type Transaction } from "@/lib/data";

const statusStyles: Record<Transaction["status"], string> = {
  Paid: "bg-[#B9D9A0]/50 text-[#3F6B2B]",
  Requested: "bg-[#F6D65C]/50 text-[#7A6410]",
  Sent: "bg-[#AFCBEE]/50 text-[#2C5182]",
};

export default function TransactionsTableCard() {
  const [tab, setTab] = useState<string>("All");

  const filtered = useMemo(() => {
    if (tab === "All") return transactions;
    return transactions.filter(
      (t) => t.type.toLowerCase() === tab.toLowerCase()
    );
  }, [tab]);

  return (
    <div className="bg-panel rounded-xl2 p-4 shadow-card h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        {transactionTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              tab === t ? "bg-ink text-white" : "text-ink/50 hover:bg-cream"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="text-[11px] text-muted">
              <th className="font-semibold px-3 py-2">Type</th>
              <th className="font-semibold px-3 py-2">Send date</th>
              <th className="font-semibold px-3 py-2">Name</th>
              <th className="font-semibold px-3 py-2">Amount</th>
              <th className="font-semibold px-3 py-2">Recipient</th>
              <th className="font-semibold px-3 py-2">Due date</th>
              <th className="font-semibold px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr
                key={i}
                className="text-[12px] text-ink border-t border-line hover:bg-cream/60 transition-colors"
              >
                <td className="px-3 py-3 font-medium">{t.type}</td>
                <td className="px-3 py-3 text-ink/60">{t.sendDate}</td>
                <td className="px-3 py-3 font-semibold">{t.name}</td>
                <td className="px-3 py-3 text-ink/60">{t.amount}</td>
                <td className="px-3 py-3 text-ink/60 truncate max-w-[160px]">
                  {t.recipient}
                </td>
                <td className="px-3 py-3 text-ink/60">{t.dueDate}</td>
                <td className="px-3 py-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyles[t.status]}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 text-ink/40">
                    <Download size={13} />
                    <ArrowUpRight size={13} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
