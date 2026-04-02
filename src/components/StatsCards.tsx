"use client";

import { Employee } from "@/lib/types";
import { Building2, Home, MapPin, ArrowLeftRight, Plane, TreePalm, AlertCircle, Users } from "lucide-react";

interface Props {
  employees: Employee[];
  date: string;
}

export default function StatsCards({ employees, date }: Props) {
  const counts = { Office: 0, Home: 0, "Client Location": 0, "Split Day": 0, Travel: 0, Leave: 0, Pending: 0, "No Data": 0 };

  employees.forEach((emp) => {
    const status = emp.statuses[date] || "No Data";
    if (status in counts) {
      counts[status as keyof typeof counts]++;
    } else {
      counts["No Data"]++;
    }
  });

  const total = employees.length;
  const responded = total - counts.Pending - counts["No Data"];
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const cards = [
    { label: "Total Team", value: total, icon: <Users size={18} />, color: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300" },
    { label: "Office", value: counts.Office, icon: <Building2 size={18} />, color: "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400" },
    { label: "Home", value: counts.Home, icon: <Home size={18} />, color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400" },
    { label: "Client", value: counts["Client Location"], icon: <MapPin size={18} />, color: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400" },
    { label: "Split Day", value: counts["Split Day"], icon: <ArrowLeftRight size={18} />, color: "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-400" },
    { label: "Travel", value: counts.Travel, icon: <Plane size={18} />, color: "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-400" },
    { label: "Leave", value: counts.Leave, icon: <TreePalm size={18} />, color: "bg-gray-50 border-gray-200 text-gray-600 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-400" },
    { label: "Pending", value: counts.Pending, icon: <AlertCircle size={18} />, color: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400" },
  ];

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Today&apos;s Overview</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Response Rate</div>
            <div className={`text-sm font-bold ${responseRate >= 80 ? "text-green-600 dark:text-green-400" : responseRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
              {responseRate}%
            </div>
          </div>
          <div className="w-12 h-12 relative">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={responseRate >= 80 ? "#22c55e" : responseRate >= 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="3"
                strokeDasharray={`${responseRate}, 100`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
              {responded}/{total}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {cards.map((card) => (
          <div key={card.label} className={`card-hover rounded-xl border p-3 cursor-default ${card.color}`}>
            <div className="flex items-center gap-1.5 mb-1 opacity-70">{card.icon}<span className="text-[11px] font-medium">{card.label}</span></div>
            <div className="text-2xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
