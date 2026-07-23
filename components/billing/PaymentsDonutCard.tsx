"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DollarSign, Heart, CreditCard } from "lucide-react";

const segments = [
  { value: 38, color: "#F6D65C" },
  { value: 34, color: "#F5B9D1" },
  { value: 28, color: "#AFCBEE" },
];

export default function PaymentsDonutCard() {
  return (
    <div className="bg-panel rounded-xl2 p-5 shadow-card flex flex-col items-center justify-center h-full min-h-[280px] relative">
      <div className="relative w-[210px] h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              innerRadius={78}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
              stroke="none"
              cornerRadius={12}
            >
              {segments.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[32px] font-extrabold text-ink tracking-tight">
            23,4k
          </span>
        </div>

        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-yellow flex items-center justify-center border-4 border-panel">
          <DollarSign size={16} className="text-ink" strokeWidth={2.5} />
        </span>
        <span className="absolute right-6 top-3 w-9 h-9 rounded-full bg-pink flex items-center justify-center border-4 border-panel">
          <Heart size={16} className="text-ink" strokeWidth={2.5} />
        </span>
        <span className="absolute right-8 bottom-6 w-9 h-9 rounded-full bg-blue flex items-center justify-center border-4 border-panel">
          <CreditCard size={16} className="text-ink" strokeWidth={2.5} />
        </span>
      </div>
    </div>
  );
}
