"use client";

import { EmployeeAnalytics } from "@/lib/types";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface Props {
  analytics: EmployeeAnalytics[];
  selectedTeam: string;
}

export default function ComplianceTracker({ analytics, selectedTeam }: Props) {
  const filtered = selectedTeam === "All"
    ? analytics
    : analytics.filter((a) => a.team === selectedTeam);

  const sorted = [...filtered].sort((a, b) => a.complianceRate - b.complianceRate);

  const compliant = sorted.filter((a) => a.complianceRate >= 80);
  const atRisk = sorted.filter((a) => a.complianceRate >= 50 && a.complianceRate < 80);
  const nonCompliant = sorted.filter((a) => a.complianceRate < 50);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">4-Day Office Compliance</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Weekly compliance to 4 days in-office requirement (Office + Client + Split Day)</p>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{compliant.length}</div>
          <div className="text-xs text-green-600 dark:text-green-500 font-medium">Compliant (&ge;80%)</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{atRisk.length}</div>
          <div className="text-xs text-amber-600 dark:text-amber-500 font-medium">At Risk (50-80%)</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{nonCompliant.length}</div>
          <div className="text-xs text-red-600 dark:text-red-500 font-medium">Non-Compliant (&lt;50%)</div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-slate-800">
            <tr className="border-b dark:border-slate-700">
              <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Team</th>
              <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Office Days</th>
              <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Compliance</th>
              <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((emp) => (
              <tr key={emp.email} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">{emp.name}</td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{emp.team}</td>
                <td className="py-2 px-3 text-center text-gray-900 dark:text-gray-100">{emp.office + emp.clientLocation + emp.splitDay}</td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${emp.complianceRate >= 80 ? "bg-green-500" : emp.complianceRate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(emp.complianceRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-10">{Math.round(emp.complianceRate)}%</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-center">
                  {emp.complianceRate >= 80 ? (
                    <CheckCircle2 size={16} className="text-green-500 inline" />
                  ) : emp.complianceRate >= 50 ? (
                    <AlertTriangle size={16} className="text-amber-500 inline" />
                  ) : (
                    <XCircle size={16} className="text-red-500 inline" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
