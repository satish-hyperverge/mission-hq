"use client";

import { Employee, STATUS_COLORS } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, parseISO } from "date-fns";

const darkTooltipStyle = { backgroundColor: "#1e293b", border: "1px solid #334155", color: "#e2e8f0" };
const lightTooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0" };

interface TrendProps {
  employees: Employee[];
  dates: string[];
}

export function DailyTrendChart({ employees, dates }: TrendProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const recentDates = dates.slice(-20);

  const data = recentDates.map((d) => {
    const counts: Record<string, number> = { date: 0, Office: 0, Home: 0, "Client Location": 0, "Split Day": 0, Travel: 0, Leave: 0, Pending: 0 };
    employees.forEach((emp) => {
      const status = emp.statuses[d];
      if (status && status in counts) {
        counts[status]++;
      }
    });
    return {
      date: format(parseISO(d), "MMM d"),
      Office: counts.Office,
      Home: counts.Home,
      "Client Location": counts["Client Location"],
      "Split Day": counts["Split Day"],
      Travel: counts.Travel,
      Leave: counts.Leave,
      Pending: counts.Pending,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Daily Attendance Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={16}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f0f0f0"} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
          <Tooltip contentStyle={isDark ? darkTooltipStyle : lightTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Office" stackId="a" fill={STATUS_COLORS.Office} />
          <Bar dataKey="Home" stackId="a" fill={STATUS_COLORS.Home} />
          <Bar dataKey="Client Location" stackId="a" fill={STATUS_COLORS["Client Location"]} />
          <Bar dataKey="Split Day" stackId="a" fill={STATUS_COLORS["Split Day"]} />
          <Bar dataKey="Travel" stackId="a" fill={STATUS_COLORS.Travel} />
          <Bar dataKey="Leave" stackId="a" fill={STATUS_COLORS.Leave} />
          <Bar dataKey="Pending" stackId="a" fill={STATUS_COLORS.Pending} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieProps {
  employees: Employee[];
  date: string;
}

export function StatusPieChart({ employees, date }: PieProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const counts: Record<string, number> = {};
  employees.forEach((emp) => {
    const status = emp.statuses[date] || "No Data";
    counts[status] = (counts[status] || 0) + 1;
  });

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Today&apos;s Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#9ca3af"} />
            ))}
          </Pie>
          <Tooltip contentStyle={isDark ? darkTooltipStyle : lightTooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TeamComplianceProps {
  employees: Employee[];
  dates: string[];
}

export function TeamComplianceChart({ employees, dates }: TeamComplianceProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const teams: Record<string, { total: number; officeDays: number }> = {};

  employees.forEach((emp) => {
    if (!teams[emp.team]) teams[emp.team] = { total: 0, officeDays: 0 };

    const lastWeekDates = dates.slice(-5);
    lastWeekDates.forEach((d) => {
      const status = emp.statuses[d];
      teams[emp.team].total++;
      if (status === "Office" || status === "Client Location" || status === "Split Day") {
        teams[emp.team].officeDays++;
      }
    });
  });

  const data = Object.entries(teams).map(([team, val]) => ({
    team,
    "Office %": Math.round((val.officeDays / val.total) * 100),
    "Target": 80,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Team-wise Office % (This Week)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f0f0f0"} />
          <XAxis dataKey="team" tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
          <Tooltip contentStyle={isDark ? darkTooltipStyle : lightTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Office %" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Target" fill={isDark ? "#334155" : "#e5e7eb"} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface WeeklyTrendProps {
  employees: Employee[];
  dates: string[];
}

export function WeeklyOfficeTrend({ employees, dates }: WeeklyTrendProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const weekMap: Record<string, { total: number; office: number }> = {};

  dates.forEach((d) => {
    const date = parseISO(d);
    const weekLabel = format(date, "'W'w MMM");

    if (!weekMap[weekLabel]) weekMap[weekLabel] = { total: 0, office: 0 };

    employees.forEach((emp) => {
      const status = emp.statuses[d];
      if (status) {
        weekMap[weekLabel].total++;
        if (status === "Office" || status === "Client Location" || status === "Split Day") {
          weekMap[weekLabel].office++;
        }
      }
    });
  });

  const data = Object.entries(weekMap).map(([week, val]) => ({
    week,
    "Office %": Math.round((val.office / val.total) * 100),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Weekly Office Attendance Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f0f0f0"} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
          <Tooltip contentStyle={isDark ? darkTooltipStyle : lightTooltipStyle} />
          <Line type="monotone" dataKey="Office %" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
