"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { generateDummyData, getTeams } from "@/lib/dummy-data";
import { computeEmployeeAnalytics } from "@/lib/utils";
import { Employee } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import StatsCards from "@/components/StatsCards";
import Filters from "@/components/Filters";
import ComplianceTracker from "@/components/ComplianceTracker";
import TeamBreakdown from "@/components/TeamBreakdown";
import EmployeeDetail from "@/components/EmployeeDetail";
import { DailyTrendChart, StatusPieChart, TeamComplianceChart, WeeklyOfficeTrend } from "@/components/Charts";
import { MapPin, BarChart3, Users, ShieldCheck, Download, Sun, Moon, TrendingUp, Loader2 } from "lucide-react";

type Tab = "overview" | "compliance" | "team" | "trends";

export default function Dashboard() {
  // Generate data only on client to avoid hydration mismatch (Math.random differs server vs client)
  const dataRef = useRef<{ employees: Employee[]; dates: string[] } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dataRef.current = generateDummyData();
    setReady(true);
  }, []);

  const employees = dataRef.current?.employees ?? [];
  const dates = dataRef.current?.dates ?? [];
  const teams = getTeams();
  const { theme, toggleTheme } = useTheme();

  const [selectedTeam, setSelectedTeam] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Set initial date once data is ready
  useEffect(() => {
    if (ready && dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[dates.length - 1]);
    }
  }, [ready, dates, selectedDate]);

  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (selectedTeam !== "All") {
      result = result.filter((e) => e.team === selectedTeam);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [employees, selectedTeam, searchQuery]);

  const analytics = useMemo(
    () => filteredEmployees.map((e) => computeEmployeeAnalytics(e, dates)),
    [filteredEmployees, dates]
  );

  const handleExport = () => {
    const headers = ["Name", "Email", "Team", "Office", "Home", "Client Location", "Split Day", "Travel", "Leave", "Pending", "Compliance %"];
    const rows = analytics.map((a) => [
      a.name, a.email, a.team, a.office, a.home, a.clientLocation, a.splitDay, a.travel, a.leave, a.pending, Math.round(a.complianceRate),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `missionhq-report-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "compliance", label: "Compliance", icon: <ShieldCheck size={16} /> },
    { id: "team", label: "Team View", icon: <Users size={16} /> },
    { id: "trends", label: "Trends", icon: <TrendingUp size={16} /> },
  ];

  // Quick summary for the header
  const todayCounts = useMemo(() => {
    let office = 0, pending = 0;
    filteredEmployees.forEach((e) => {
      const s = e.statuses[selectedDate];
      if (s === "Office" || s === "Client Location" || s === "Split Day") office++;
      if (s === "Pending" || !s) pending++;
    });
    return { office, pending, total: filteredEmployees.length };
  }, [filteredEmployees, selectedDate]);

  if (!ready || !selectedDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">MissionHQ</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {todayCounts.office}/{todayCounts.total} in office today
                {todayCounts.pending > 0 && <span className="text-amber-500"> &middot; {todayCounts.pending} pending</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-gray-600 dark:text-gray-300 active:scale-95"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2.5 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all text-gray-700 dark:text-gray-300 active:scale-95"
            >
              <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-indicator flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <div className="animate-fade-in mb-5">
          <Filters
            teams={teams}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            dates={dates}
          />
        </div>

        {/* No results message */}
        {filteredEmployees.length === 0 ? (
          <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
            <Users size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No employees found</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or team filter</p>
          </div>
        ) : (
          <div key={activeTab} className="animate-fade-in space-y-5">
            {activeTab === "overview" && (
              <>
                <StatsCards employees={filteredEmployees} date={selectedDate} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">
                    <DailyTrendChart employees={filteredEmployees} dates={dates} />
                  </div>
                  <StatusPieChart employees={filteredEmployees} date={selectedDate} />
                </div>
                <TeamComplianceChart employees={filteredEmployees} dates={dates} />
              </>
            )}

            {activeTab === "compliance" && (
              <>
                <ComplianceTracker analytics={analytics} selectedTeam={selectedTeam} />
                <WeeklyOfficeTrend employees={filteredEmployees} dates={dates} />
              </>
            )}

            {activeTab === "team" && (
              <>
                <TeamBreakdown
                  employees={filteredEmployees}
                  dates={dates}
                  selectedTeam={selectedTeam}
                  selectedDate={selectedDate}
                />
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Employee Details
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">click to expand</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredEmployees.map((emp) => {
                      const empAnalytics = computeEmployeeAnalytics(emp, dates);
                      const todayStatus = emp.statuses[selectedDate] || "No Data";
                      return (
                        <button
                          key={emp.email}
                          onClick={() => setSelectedEmployee(emp)}
                          className="card-hover text-left p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 bg-gray-50 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <div>
                              <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{emp.name}</div>
                              <div className="text-[11px] text-gray-400 dark:text-gray-500">{emp.team}</div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              todayStatus === "Office" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                              todayStatus === "Home" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" :
                              todayStatus === "Pending" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                              "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400"
                            }`}>
                              {todayStatus}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-gray-400 dark:text-gray-500">Compliance</span>
                              <span className={`font-semibold ${
                                empAnalytics.complianceRate >= 80 ? "text-green-600 dark:text-green-400" :
                                empAnalytics.complianceRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                              }`}>
                                {Math.round(empAnalytics.complianceRate)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  empAnalytics.complianceRate >= 80 ? "bg-green-500" :
                                  empAnalytics.complianceRate >= 50 ? "bg-amber-500" : "bg-red-500"
                                }`}
                                style={{ width: `${Math.min(empAnalytics.complianceRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === "trends" && (
              <>
                <DailyTrendChart employees={filteredEmployees} dates={dates} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <WeeklyOfficeTrend employees={filteredEmployees} dates={dates} />
                  <TeamComplianceChart employees={filteredEmployees} dates={dates} />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetail
          employee={selectedEmployee}
          dates={dates}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}
