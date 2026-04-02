"use client";

import { Employee } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  employees: Employee[];
  dates: string[];
  selectedDept: string;
  selectedDate: string;
}

export default function TeamBreakdown({ employees, dates, selectedDept, selectedDate }: Props) {
  const filtered = selectedDept === "All"
    ? employees
    : employees.filter((e) => e.department === selectedDept);

  const pastDates = dates.filter((d) => d <= selectedDate).slice(-5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Department Status View</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-slate-800 min-w-[180px]">Name</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300 min-w-[120px]">Department</th>
              {pastDates.map((d) => (
                <th key={d} className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-300 min-w-[120px]">
                  {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.email} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3 font-medium sticky left-0 bg-white dark:bg-slate-900">
                  <div className="text-gray-900 dark:text-gray-100">{emp.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{emp.email}</div>
                </td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{emp.department}</td>
                {pastDates.map((d) => (
                  <td key={d} className="py-2 px-3 text-center">
                    <StatusBadge status={emp.statuses[d] || "—"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
