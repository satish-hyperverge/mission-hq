"use client";

import { Employee, STATUS_COLORS } from "@/lib/types";
import { computeEmployeeAnalytics } from "@/lib/utils";
import { X, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface Props {
  employee: Employee;
  dates: string[];
  onClose: () => void;
}

export default function EmployeeDetail({ employee, dates, onClose }: Props) {
  const analytics = computeEmployeeAnalytics(employee, dates);

  const statCounts = [
    { label: "Office", value: analytics.office, color: "text-green-600 dark:text-green-400" },
    { label: "Home", value: analytics.home, color: "text-blue-600 dark:text-blue-400" },
    { label: "Client", value: analytics.clientLocation, color: "text-amber-600 dark:text-amber-400" },
    { label: "Split", value: analytics.splitDay, color: "text-violet-600 dark:text-violet-400" },
    { label: "Travel", value: analytics.travel, color: "text-pink-600 dark:text-pink-400" },
    { label: "Leave", value: analytics.leave, color: "text-gray-500 dark:text-gray-400" },
    { label: "Pending", value: analytics.pending, color: "text-red-600 dark:text-red-400" },
  ];

  const recentDates = dates.slice(-30);

  return (
    <div className="animate-backdrop fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="animate-modal bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{employee.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email} &middot; {employee.department}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Compliance Rate */}
        <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Compliance Rate</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {Math.round(analytics.complianceRate)}%
              {analytics.complianceRate >= 80 ? (
                <CheckCircle2 size={18} className="text-green-500 inline ml-2" />
              ) : analytics.complianceRate >= 50 ? (
                <AlertTriangle size={18} className="text-amber-500 inline ml-2" />
              ) : (
                <XCircle size={18} className="text-red-500 inline ml-2" />
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${analytics.complianceRate >= 80 ? "bg-green-500" : analytics.complianceRate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(analytics.complianceRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Counts */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-5">
          {statCounts.map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity Heatmap */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last 30 Working Days</h3>
        <div className="grid grid-cols-6 gap-1.5 mb-5">
          {recentDates.map((d) => {
            const status = employee.statuses[d] || "";
            const bg = STATUS_COLORS[status] || "#f3f4f6";
            const dateObj = new Date(d + "T00:00:00");
            return (
              <div
                key={d}
                className="rounded-md p-1.5 text-center text-[10px] border border-gray-100 dark:border-slate-700"
                style={{ backgroundColor: bg + "20" }}
                title={`${d}: ${status || "No data"}`}
              >
                <div className="font-medium" style={{ color: bg === "#f3f4f6" ? "#9ca3af" : bg }}>
                  {dateObj.toLocaleDateString("en-IN", { day: "numeric" })}
                </div>
                <div className="truncate text-[8px] text-gray-500 dark:text-gray-400">{status || "—"}</div>
              </div>
            );
          })}
        </div>

        {/* Weekly Compliance Breakdown */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Weekly Compliance</h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {analytics.weeklyCompliance.slice().reverse().slice(0, 12).map((w) => (
            <div key={w.weekStart} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
              <span className="w-32 text-gray-600 dark:text-gray-400">{w.weekLabel}</span>
              <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${w.isCompliant ? "bg-green-500" : "bg-red-400"}`}
                  style={{ width: `${(w.officeDays / 5) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-gray-600 dark:text-gray-400">{w.officeDays}/{w.totalWorkDays} days</span>
              {w.isCompliant ? (
                <CheckCircle2 size={14} className="text-green-500" />
              ) : (
                <XCircle size={14} className="text-red-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
