"use client";

import { Employee } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

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

  const allPastDates = dates.filter((d) => d <= selectedDate);
  const [page, setPage] = useState(0);
  const daysPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(allPastDates.length / daysPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const pastDates = allPastDates.slice(-(currentPage + 1) * daysPerPage, allPastDates.length - currentPage * daysPerPage);

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

        {/* Date pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.min(currentPage + 1, totalPages - 1))}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-[11px] min-w-[70px] text-center font-mono" style={{ color: "var(--text-muted)" }}>
            {pastDates.length > 0 && (
              <>
                {new Date(pastDates[0] + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                {" – "}
                {new Date(pastDates[pastDates.length - 1] + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </>
            )}
          </span>
          <button
            onClick={() => setPage(Math.max(currentPage - 1, 0))}
            disabled={currentPage <= 0}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-surface-secondary)" }}>
              <th className="text-left py-2.5 px-3 font-medium sticky left-0 min-w-[200px] z-10" style={{ background: "var(--bg-surface-secondary)", color: "var(--text-secondary)" }}>
                Employee
              </th>
              {pastDates.map((d) => (
                <th key={d} className="text-center py-2.5 px-3 font-medium min-w-[110px]" style={{ color: "var(--text-secondary)" }}>
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
                <tr>
                  <td colSpan={pastDates.length + 1} className="py-2 px-3 sticky left-0" style={{ background: "var(--bg-surface-secondary)" }}>
                    <span className="section-label">{dept}</span>
                    <span className="text-[10px] ml-2" style={{ color: "var(--text-muted)" }}>({emps.length})</span>
                  </td>
                </tr>
                {emps.map((emp) => (
                  <tr key={emp.email} className="table-row-hover" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td className="py-2.5 px-3 sticky left-0 z-10" style={{ background: "var(--bg-surface)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar w-7 h-7 text-[10px]" style={{ background: "var(--bg-inset)", color: "var(--text-muted)" }}>
                          {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>{emp.name}</div>
                          <div className="text-[10px] truncate max-w-[140px]" style={{ color: "var(--text-muted)" }}>{emp.email}</div>
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
