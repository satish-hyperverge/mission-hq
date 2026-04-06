"use client";

import { Search, X, Calendar, Building } from "lucide-react";

interface Props {
  departments: string[];
  selectedDept: string;
  onDeptChange: (dept: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  dates: string[];
}

export default function Filters({
  departments,
  selectedDept,
  onDeptChange,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  dates,
}: Props) {
  const hasActiveFilters = selectedDept !== "All" || searchQuery.length > 0;
  const activeCount = (selectedDept !== "All" ? 1 : 0) + (searchQuery.length > 0 ? 1 : 0);

  const clearAll = () => {
    onDeptChange("All");
    onSearchChange("");
  };

  return (
    <div className="card p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Filter label */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white rounded-full leading-none" style={{ background: "var(--accent)" }}>
              {activeCount}
            </span>
          )}
        </div>

        <div className="w-px h-6 hidden sm:block" style={{ background: "var(--border-default)" }} />

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-[13px] rounded-lg border focus:outline-none transition-all"
            style={{
              background: "var(--bg-surface-secondary)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "var(--text-faint)" }}>
              <X size={9} className="text-white" />
            </button>
          )}
        </div>

        {/* Department */}
        <div className="relative">
          <Building size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <select
            value={selectedDept}
            onChange={(e) => onDeptChange(e.target.value)}
            className="pl-8 pr-7 py-2 text-[13px] border rounded-lg appearance-none cursor-pointer focus:outline-none transition-all"
            style={{
              background: selectedDept !== "All" ? "var(--accent-light)" : "var(--bg-surface-secondary)",
              borderColor: selectedDept !== "All" ? "var(--accent-muted)" : "var(--border-default)",
              color: "var(--text-primary)",
            }}
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Date */}
        <div className="relative">
          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-8 pr-7 py-2 text-[13px] border rounded-lg appearance-none cursor-pointer focus:outline-none transition-all"
            style={{
              background: "var(--bg-surface-secondary)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
          >
            {[...dates].reverse().slice(0, 30).map((d) => (
              <option key={d} value={d}>
                {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </option>
            ))}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button onClick={clearAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 rounded-lg border border-red-200 dark:border-red-800/40 transition-all">
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* Active Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {selectedDept !== "All" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border"
              style={{ background: "var(--accent-light)", color: "var(--accent)", borderColor: "var(--accent-muted)" }}>
              <Building size={10} />
              {selectedDept}
              <button onClick={() => onDeptChange("All")} className="ml-0.5 opacity-70 hover:opacity-100"><X size={9} /></button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-violet-50 dark:bg-violet-900/15 text-violet-700 dark:text-violet-400 rounded-md border border-violet-200 dark:border-violet-800/40">
              <Search size={10} />
              &quot;{searchQuery}&quot;
              <button onClick={() => onSearchChange("")} className="ml-0.5 opacity-70 hover:opacity-100"><X size={9} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
