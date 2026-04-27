"use client";

import { Employee } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { startOfMonth, endOfMonth, parseISO, format } from "date-fns";

type ViewMode = "week" | "month";

interface Props {
  employees: Employee[];
  dates: string[];
  selectedDept: string;
  selectedDate: string;
}

export default function TeamBreakdown({ employees, dates, selectedDept, selectedDate }: Props) {
  const filtered = selectedDept === "All"
    ? employees
    : employees.filter((e) => e.departments.includes(selectedDept));

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [page, setPage] = useState(0);

  const allPastDates = dates.filter((d) => d <= selectedDate);
  const daysPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(allPastDates.length / daysPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const weekDates = allPastDates.slice(-(currentPage + 1) * daysPerPage, allPastDates.length - currentPage * daysPerPage);

  // Months that have at least one date in the dataset
  const monthsWithData = useMemo(() => {
    const set = new Set<string>();
    dates.forEach((d) => set.add(d.slice(0, 7)));
    return Array.from(set).sort();
  }, [dates]);

  const todayMonthKey = format(startOfMonth(today), "yyyy-MM");
  const initialMonthKey = monthsWithData.includes(todayMonthKey)
    ? todayMonthKey
    : (monthsWithData[monthsWithData.length - 1] ?? todayMonthKey);

  const [viewedMonthKey, setViewedMonthKey] = useState(initialMonthKey);
  const monthAnchor = useMemo(() => parseISO(`${viewedMonthKey}-01`), [viewedMonthKey]);
  const monthEnd = useMemo(() => endOfMonth(monthAnchor), [monthAnchor]);
  const monthAnchorStr = format(monthAnchor, "yyyy-MM-dd");
  const monthEndStr = format(monthEnd, "yyyy-MM-dd");

  const monthDates = useMemo(() => {
    return dates.filter((d) => d >= monthAnchorStr && d <= monthEndStr && d <= todayStr);
  }, [dates, monthAnchorStr, monthEndStr, todayStr]);

  const monthIdx = monthsWithData.indexOf(viewedMonthKey);
  const prevMonthKey = monthIdx > 0 ? monthsWithData[monthIdx - 1] : null;
  const nextMonthKey = monthIdx >= 0 && monthIdx < monthsWithData.length - 1 ? monthsWithData[monthIdx + 1] : null;

  // Reverse so latest date renders as the first (leftmost) column
  const pastDates = (viewMode === "month" ? monthDates : weekDates).slice().reverse();

  const grouped = useMemo(() => {
    const map: Record<string, Employee[]> = {};
    filtered.forEach((e) => {
      const depts = selectedDept !== "All" ? [selectedDept] : (e.departments.length > 0 ? e.departments : [e.department || "Unassigned"]);
      depts.forEach((dept) => {
        if (!map[dept]) map[dept] = [];
        map[dept].push(e);
      });
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, selectedDept]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Department Status View</h2>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {filtered.length} employees across {grouped.length} department{grouped.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View mode toggle */}
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "var(--bg-inset)" }}>
            {(["week", "month"] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md transition-all capitalize"
                style={{
                  background: viewMode === m ? "var(--bg-surface)" : "transparent",
                  color: viewMode === m ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: viewMode === m ? "var(--shadow-xs)" : "none",
                }}>{m}</button>
            ))}
          </div>

          {/* Navigation */}
          {viewMode === "week" ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.min(currentPage + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--text-muted)" }}
                aria-label="Older week"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[11px] min-w-[90px] text-center font-mono" style={{ color: "var(--text-muted)" }}>
                {pastDates.length > 0 && (
                  <>
                    {new Date(pastDates[pastDates.length - 1] + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {" – "}
                    {new Date(pastDates[0] + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </>
                )}
              </span>
              <button
                onClick={() => setPage(Math.max(currentPage - 1, 0))}
                disabled={currentPage <= 0}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--text-muted)" }}
                aria-label="Newer week"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => prevMonthKey && setViewedMonthKey(prevMonthKey)}
                disabled={!prevMonthKey}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--text-muted)" }}
                aria-label="Previous month"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[11px] min-w-[100px] text-center font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {format(monthAnchor, "MMM yyyy")}
              </span>
              <button
                onClick={() => nextMonthKey && setViewedMonthKey(nextMonthKey)}
                disabled={!nextMonthKey}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--text-muted)" }}
                aria-label="Next month"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-auto scrollbar-thin rounded-lg border" style={{ borderColor: "var(--border-subtle)", maxHeight: 680 }}>
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr style={{ background: "var(--bg-surface-secondary)" }}>
              <th
                className="text-left py-2.5 px-3 font-medium sticky left-0 w-[300px] min-w-[300px] z-20"
                style={{
                  background: "var(--bg-surface-secondary)",
                  borderRight: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  borderBottom: "1px solid var(--border-default)",
                }}
              >
                Employee
              </th>
              {pastDates.map((d) => (
                <th
                  key={d}
                  className="text-center py-2.5 px-3 font-medium min-w-[110px]"
                  style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}
                >
                  <div className="text-xs">{new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}</div>
                  <div className="text-[10px] font-normal" style={{ color: "var(--text-muted)" }}>
                    {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(([dept, emps]) => (
              <React.Fragment key={dept}>
                <tr style={{ background: "var(--bg-surface-secondary)" }}>
                  <td
                    className="py-2 px-3 sticky left-0 z-10 whitespace-nowrap"
                    style={{
                      background: "var(--bg-surface-secondary)",
                      borderRight: "1px solid var(--border-default)",
                      boxShadow: "1px 0 0 0 var(--border-default)",
                    }}
                  >
                    <span className="section-label">{dept}</span>
                    <span className="text-[10px] ml-2" style={{ color: "var(--text-muted)" }}>({emps.length})</span>
                  </td>
                  {pastDates.map((d) => (
                    <td key={d} style={{ background: "var(--bg-surface-secondary)" }} />
                  ))}
                </tr>
                {emps.map((emp) => (
                  <tr key={emp.email} className="table-row-hover" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td
                      className="py-2.5 px-3 sticky left-0 z-10"
                      style={{
                        background: "var(--bg-surface)",
                        borderRight: "1px solid var(--border-default)",
                        boxShadow: "1px 0 0 0 var(--border-default)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="avatar w-7 h-7 text-[10px] flex-shrink-0" style={{ background: "var(--bg-inset)", color: "var(--text-muted)" }}>
                          {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{emp.name}</div>
                          <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    {pastDates.map((d) => (
                      <td key={d} className="py-2.5 px-3 text-center">
                        <StatusBadge status={emp.statuses[d] || "—"} size="xs" />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No employees found
          </div>
        )}
      </div>
    </div>
  );
}
