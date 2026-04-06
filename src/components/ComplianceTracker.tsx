"use client";

import { EmployeeAnalytics } from "@/lib/types";
import { CheckCircle2, XCircle, AlertTriangle, Shield, X } from "lucide-react";
import { useState } from "react";

interface Props {
  analytics: EmployeeAnalytics[];
  selectedDept: string;
}

type SortField = "name" | "department" | "officeDays" | "compliance";
type SortDir = "asc" | "desc";
type ViewFilter = "all" | "compliant" | "atRisk" | "nonCompliant";

export default function ComplianceTracker({ analytics, selectedDept }: Props) {
  const [sortField, setSortField] = useState<SortField>("compliance");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");

  const filtered = selectedDept === "All"
    ? analytics
    : analytics.filter((a) => a.department === selectedDept);

  const compliant = filtered.filter((a) => a.complianceRate >= 80);
  const atRisk = filtered.filter((a) => a.complianceRate >= 50 && a.complianceRate < 80);
  const nonCompliant = filtered.filter((a) => a.complianceRate < 50);

  const complianceRate = filtered.length > 0
    ? Math.round((compliant.length / filtered.length) * 100)
    : 0;

  const displayList = viewFilter === "all" ? filtered
    : viewFilter === "compliant" ? compliant
    : viewFilter === "atRisk" ? atRisk
    : nonCompliant;

  const sorted = [...displayList].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "department": cmp = a.department.localeCompare(b.department); break;
      case "officeDays": cmp = (a.office + a.clientLocation + a.splitDay) - (b.office + b.clientLocation + b.splitDay); break;
      case "compliance": cmp = a.complianceRate - b.complianceRate; break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? "opacity-100" : "opacity-30"}`} style={{ color: sortField === field ? "var(--accent)" : "var(--text-muted)" }}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const summaryItems: { label: string; count: number; icon: React.ReactNode; color: string; filter: ViewFilter }[] = [
    { label: "Compliant", count: compliant.length, icon: <CheckCircle2 size={14} />, color: "text-emerald-500", filter: "compliant" },
    { label: "At Risk", count: atRisk.length, icon: <AlertTriangle size={14} />, color: "text-amber-500", filter: "atRisk" },
    { label: "Non-Compliant", count: nonCompliant.length, icon: <XCircle size={14} />, color: "text-red-500", filter: "nonCompliant" },
  ];

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>4-Day Office Compliance</h2>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Office + Client + Split Day count toward requirement</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Team Rate</div>
            <div className={`text-lg font-bold font-mono ${complianceRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : complianceRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
              {complianceRate}%
            </div>
          </div>
          <div className="w-11 h-11 relative">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15" fill="none"
                stroke={complianceRate >= 80 ? "#22c55e" : complianceRate >= 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="2.5" strokeDasharray={`${complianceRate * 0.94} 100`}
                strokeLinecap="round" className="transition-all duration-300" />
            </svg>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {summaryItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setViewFilter(viewFilter === item.filter ? "all" : item.filter)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: viewFilter === item.filter ? "var(--accent-light)" : "var(--bg-inset)",
              color: viewFilter === item.filter ? "var(--accent)" : "var(--text-secondary)",
              border: viewFilter === item.filter ? "1px solid var(--accent-muted)" : "1px solid transparent",
            }}
          >
            <span className={item.color}>{item.icon}</span>
            <span className="font-bold font-mono">{item.count}</span>
            <span>{item.label}</span>
          </button>
        ))}
        {viewFilter !== "all" && (
          <button onClick={() => setViewFilter("all")} className="ml-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all"
            style={{ color: "var(--text-muted)" }}>
            <X size={12} className="inline mr-0.5" />Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10" style={{ background: "var(--bg-surface-secondary)" }}>
            <tr>
              <th onClick={() => toggleSort("name")} className="text-left py-2.5 px-3 font-medium cursor-pointer select-none" style={{ color: "var(--text-secondary)" }}>
                Employee <SortIcon field="name" />
              </th>
              <th onClick={() => toggleSort("department")} className="text-left py-2.5 px-3 font-medium cursor-pointer select-none hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                Department <SortIcon field="department" />
              </th>
              <th onClick={() => toggleSort("officeDays")} className="text-center py-2.5 px-3 font-medium cursor-pointer select-none" style={{ color: "var(--text-secondary)" }}>
                Office <SortIcon field="officeDays" />
              </th>
              <th onClick={() => toggleSort("compliance")} className="text-center py-2.5 px-3 font-medium cursor-pointer select-none" style={{ color: "var(--text-secondary)" }}>
                Compliance <SortIcon field="compliance" />
              </th>
              <th className="text-center py-2.5 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((emp) => {
              const officeDays = emp.office + emp.clientLocation + emp.splitDay;
              return (
                <tr key={emp.email} className="table-row-hover" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`avatar w-7 h-7 text-[10px] ${
                        emp.complianceRate >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : emp.complianceRate >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }`}>
                        {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>{emp.name}</div>
                        <div className="text-[11px] sm:hidden" style={{ color: "var(--text-muted)" }}>{emp.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 hidden sm:table-cell text-[13px]" style={{ color: "var(--text-muted)" }}>{emp.department}</td>
                  <td className="py-2.5 px-3 text-center font-semibold font-mono text-[13px]" style={{ color: "var(--text-primary)" }}>{officeDays}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 rounded-full h-1.5" style={{ background: "var(--bg-inset)" }}>
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${emp.complianceRate >= 80 ? "bg-emerald-500" : emp.complianceRate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(emp.complianceRate, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold font-mono w-10 ${
                        emp.complianceRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : emp.complianceRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                      }`}>{Math.round(emp.complianceRate)}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {emp.complianceRate >= 80 ? (
                      <CheckCircle2 size={14} className="text-emerald-500 inline" />
                    ) : emp.complianceRate >= 50 ? (
                      <AlertTriangle size={14} className="text-amber-500 inline" />
                    ) : (
                      <XCircle size={14} className="text-red-500 inline" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No employees match this filter
          </div>
        )}
      </div>
    </div>
  );
}
