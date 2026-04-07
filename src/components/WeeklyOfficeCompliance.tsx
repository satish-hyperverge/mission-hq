"use client";

import { Employee } from "@/lib/types";
import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { startOfWeek, addDays, format } from "date-fns";

const OFFICE_STATUSES = ["Office", "Client Location", "Split Day"];
const REQUIRED_DAYS = 4;

// Holidays in YYYY-MM-DD format
const HOLIDAYS = new Set([
  "2026-04-03", "2026-05-01", "2026-08-15", "2026-10-02",
  "2026-11-01", "2026-11-09", "2026-11-10", "2026-12-25",
]);

type WeekTab = "this" | "last";

interface Props {
  employees: Employee[];
  dates: string[];
}

export default function WeeklyOfficeCompliance({ employees, dates }: Props) {
  const [weekTab, setWeekTab] = useState<WeekTab>("this");
  const [showAll, setShowAll] = useState(false);

  const today = new Date();
  const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
  const lastMonday = addDays(thisMonday, -7);
  const monday = weekTab === "this" ? thisMonday : lastMonday;

  // Get Mon-Fri dates for the selected week, excluding holidays
  const weekDates = useMemo(() => {
    const dateSet = new Set(dates);
    return Array.from({ length: 5 }, (_, i) => {
      const day = addDays(monday, i);
      const dateStr = format(day, "yyyy-MM-dd");
      const isHoliday = HOLIDAYS.has(dateStr);
      const isFuture = day > today;
      return { dateStr, isHoliday, isFuture, hasData: dateSet.has(dateStr) };
    }).filter((d) => !d.isHoliday && !d.isFuture);
  }, [monday, dates, today]);

  const workingDaysCount = weekDates.length;
  const requiredDays = Math.min(REQUIRED_DAYS, workingDaysCount);

  // Calculate office days per employee for this week
  const employeeStats = useMemo(() => {
    return employees.map((emp) => {
      let officeDays = 0;
      weekDates.forEach(({ dateStr, hasData }) => {
        if (hasData) {
          const status = emp.statuses[dateStr];
          if (status && OFFICE_STATUSES.includes(status)) officeDays++;
        }
      });
      return {
        name: emp.name,
        email: emp.email,
        departments: emp.departments,
        department: emp.department,
        officeDays,
        isCompliant: officeDays >= requiredDays,
      };
    }).sort((a, b) => b.officeDays - a.officeDays);
  }, [employees, weekDates, requiredDays]);

  const compliantCount = employeeStats.filter((e) => e.isCompliant).length;
  const nonCompliantCount = employeeStats.length - compliantCount;
  const complianceRate = employeeStats.length > 0 ? Math.round((compliantCount / employeeStats.length) * 100) : 0;

  const weekLabel = `${format(addDays(monday, 0), "MMM d")} – ${format(addDays(monday, 4), "MMM d")}`;
  const isCurrentWeekPartial = weekTab === "this" && workingDaysCount < 5;

  const displayList = showAll ? employeeStats : employeeStats.slice(0, 10);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Weekly 4-Day Office Check</h2>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {weekLabel} &middot; {workingDaysCount} working day{workingDaysCount !== 1 ? "s" : ""}
              {isCurrentWeekPartial && " (in progress)"}
            </p>
          </div>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "var(--bg-inset)" }}>
          <button onClick={() => setWeekTab("this")}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
            style={{
              background: weekTab === "this" ? "var(--bg-surface)" : "transparent",
              color: weekTab === "this" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: weekTab === "this" ? "var(--shadow-xs)" : "none",
            }}>This Week</button>
          <button onClick={() => setWeekTab("last")}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
            style={{
              background: weekTab === "last" ? "var(--bg-surface)" : "transparent",
              color: weekTab === "last" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: weekTab === "last" ? "var(--shadow-xs)" : "none",
            }}>Last Week</button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-inset)", borderColor: "var(--border-subtle)" }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Compliance</div>
          <div className={`text-2xl font-bold font-mono ${complianceRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : complianceRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
            {complianceRate}%
          </div>
        </div>
        <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-inset)", borderColor: "var(--border-subtle)" }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Compliant</div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>{compliantCount}</span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>/ {employeeStats.length}</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-inset)", borderColor: "var(--border-subtle)" }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Not Yet</div>
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-red-400" />
            <span className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>{nonCompliantCount}</span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>/ {employeeStats.length}</span>
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div className="overflow-y-auto scrollbar-thin rounded-lg border" style={{ borderColor: "var(--border-subtle)", maxHeight: showAll ? "500px" : undefined }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10" style={{ background: "var(--bg-surface-secondary)" }}>
            <tr>
              <th className="text-left py-2.5 px-3 font-medium" style={{ color: "var(--text-secondary)" }}>Employee</th>
              <th className="text-left py-2.5 px-3 font-medium hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>Department</th>
              <th className="text-center py-2.5 px-3 font-medium" style={{ color: "var(--text-secondary)" }}>Office Days</th>
              <th className="text-center py-2.5 px-3 font-medium w-10" style={{ color: "var(--text-secondary)" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((emp) => (
              <tr key={emp.email} className="table-row-hover" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`avatar w-7 h-7 text-[10px] ${
                      emp.isCompliant
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    }`}>
                      {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>{emp.name}</div>
                      <div className="text-[10px] truncate max-w-[140px]" style={{ color: "var(--text-muted)" }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 hidden sm:table-cell text-[13px]" style={{ color: "var(--text-muted)" }}>
                  {emp.departments?.length > 1 ? (
                    <div className="flex flex-wrap gap-1">
                      {emp.departments.map((dept) => (
                        <span key={dept} className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: "var(--bg-inset)" }}>{dept}</span>
                      ))}
                    </div>
                  ) : emp.department}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>{emp.officeDays}</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>/ {requiredDays}</span>
                  </div>
                  <div className="w-16 mx-auto rounded-full h-1.5 mt-1" style={{ background: "var(--bg-inset)" }}>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${emp.isCompliant ? "bg-emerald-500" : emp.officeDays >= requiredDays - 1 ? "bg-amber-500" : "bg-red-400"}`}
                      style={{ width: `${Math.min((emp.officeDays / requiredDays) * 100, 100)}%` }}
                    />
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {emp.isCompliant
                    ? <CheckCircle2 size={16} className="text-emerald-500 inline" />
                    : <XCircle size={16} className="text-red-400 inline" />
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more/less */}
      {employeeStats.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
          style={{ color: "var(--text-muted)", background: "var(--bg-inset)" }}
        >
          {showAll ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show all {employeeStats.length} employees</>}
        </button>
      )}
    </div>
  );
}
