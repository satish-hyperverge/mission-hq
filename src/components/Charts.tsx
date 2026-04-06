"use client";

import { Employee, STATUS_COLORS } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, ReferenceLine } from "recharts";
import { format, parseISO } from "date-fns";

const CHART_COLORS = {
  light: { grid: "#f1f5f9", tick: "#94a3b8", ref: "#ef4444", bg: "#ffffff", border: "#e2e8f0", text: "#0f172a", sub: "#64748b" },
  dark: { grid: "#1e2737", tick: "#4b5a72", ref: "#f87171", bg: "#111622", border: "#1e2737", text: "#f1f5f9", sub: "#8b97ad" },
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-custom">
      <p className="font-semibold text-[11px] mb-1.5" style={{ color: "var(--text-primary)" }}>{label}</p>
      <div className="space-y-1">
        {payload.filter(p => p.value > 0).map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span style={{ color: "var(--text-muted)" }}>{p.name}</span>
            <span className="font-semibold font-mono ml-auto" style={{ color: "var(--text-primary)" }}>{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrendProps { employees: Employee[]; dates: string[]; }

export function DailyTrendChart({ employees, dates }: TrendProps) {
  const { theme } = useTheme();
  const c = CHART_COLORS[theme === "dark" ? "dark" : "light"];
  const recentDates = dates.slice(-20);

  const data = recentDates.map((d) => {
    const counts: Record<string, number> = { Office: 0, Home: 0, "Client Location": 0, "Split Day": 0, Travel: 0, Leave: 0, Pending: 0 };
    employees.forEach((emp) => {
      const status = emp.statuses[d];
      if (status && status in counts) counts[status]++;
    });
    return { date: format(parseISO(d), "MMM d"), ...counts };
  });

  return (
    <ChartCard title="Daily Attendance Trend" subtitle={`Last ${recentDates.length} working days`}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={10} barGap={1}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: c.tick }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: c.tick }} axisLine={false} tickLine={false} width={30} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 12 }} iconType="circle" iconSize={6} />
          <Bar dataKey="Office" stackId="a" fill={STATUS_COLORS.Office} />
          <Bar dataKey="Home" stackId="a" fill={STATUS_COLORS.Home} />
          <Bar dataKey="Client Location" stackId="a" fill={STATUS_COLORS["Client Location"]} />
          <Bar dataKey="Split Day" stackId="a" fill={STATUS_COLORS["Split Day"]} />
          <Bar dataKey="Travel" stackId="a" fill={STATUS_COLORS.Travel} />
          <Bar dataKey="Leave" stackId="a" fill={STATUS_COLORS.Leave} />
          <Bar dataKey="Pending" stackId="a" fill={STATUS_COLORS.Pending} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface PieProps { employees: Employee[]; date: string; }

export function StatusPieChart({ employees, date }: PieProps) {
  const { theme } = useTheme();
  const c = CHART_COLORS[theme === "dark" ? "dark" : "light"];
  const counts: Record<string, number> = {};
  employees.forEach((emp) => {
    const status = emp.statuses[date] || "No Data";
    counts[status] = (counts[status] || 0) + 1;
  });

  const total = employees.length;
  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <ChartCard title="Status Distribution" subtitle={new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown, name: unknown) => [`${value} (${Math.round((Number(value) / total) * 100)}%)`, String(name)]}
              contentStyle={{
                backgroundColor: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 12, fontSize: 11,
                color: c.text,
                boxShadow: "var(--shadow-lg)",
              }}
              labelStyle={{ color: c.text }}
              itemStyle={{ color: c.sub }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 w-full px-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || "#94a3b8" }} />
              <span className="truncate flex-1" style={{ color: "var(--text-muted)" }}>{entry.name}</span>
              <span className="font-semibold font-mono" style={{ color: "var(--text-primary)" }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

interface TeamComplianceProps { employees: Employee[]; dates: string[]; }

export function TeamComplianceChart({ employees, dates }: TeamComplianceProps) {
  const { theme } = useTheme();
  const c = CHART_COLORS[theme === "dark" ? "dark" : "light"];
  const departments: Record<string, { total: number; officeDays: number }> = {};

  employees.forEach((emp) => {
    if (!departments[emp.department]) departments[emp.department] = { total: 0, officeDays: 0 };
    dates.slice(-5).forEach((d) => {
      const status = emp.statuses[d];
      departments[emp.department].total++;
      if (status === "Office" || status === "Client Location" || status === "Split Day") {
        departments[emp.department].officeDays++;
      }
    });
  });

  const data = Object.entries(departments)
    .map(([department, val]) => ({ department, "Office %": Math.round((val.officeDays / val.total) * 100) }))
    .sort((a, b) => b["Office %"] - a["Office %"]);

  return (
    <ChartCard title="Department Office Attendance" subtitle="Last 5 working days vs 80% target">
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44 + 40)}>
        <BarChart data={data} barSize={22} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: c.tick }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: c.tick }} axisLine={false} tickLine={false} width={100} />
          <Tooltip
            formatter={(value: unknown) => [`${value}%`, "Office Rate"]}
            contentStyle={{
              backgroundColor: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 12, fontSize: 11,
              color: c.text,
              boxShadow: "var(--shadow-lg)",
            }}
            labelStyle={{ color: c.text }}
            itemStyle={{ color: c.sub }}
            cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
          />
          <ReferenceLine x={80} stroke={c.ref} strokeDasharray="4 4" strokeWidth={1.5} />
          <Bar dataKey="Office %" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell key={entry.department} fill={entry["Office %"] >= 80 ? "#22c55e" : entry["Office %"] >= 60 ? "#f59e0b" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface WeeklyTrendProps { employees: Employee[]; dates: string[]; }

export function WeeklyOfficeTrend({ employees, dates }: WeeklyTrendProps) {
  const { theme } = useTheme();
  const c = CHART_COLORS[theme === "dark" ? "dark" : "light"];
  const weekMap: Record<string, { total: number; office: number }> = {};

  dates.forEach((d) => {
    const date = parseISO(d);
    const weekLabel = format(date, "'W'w MMM");
    if (!weekMap[weekLabel]) weekMap[weekLabel] = { total: 0, office: 0 };
    employees.forEach((emp) => {
      const status = emp.statuses[d];
      if (status) {
        weekMap[weekLabel].total++;
        if (status === "Office" || status === "Client Location" || status === "Split Day") weekMap[weekLabel].office++;
      }
    });
  });

  const data = Object.entries(weekMap).map(([week, val]) => ({
    week,
    "Office %": Math.round((val.office / val.total) * 100),
  }));

  const gradientId = theme === "dark" ? "officeGradientDark" : "officeGradientLight";

  return (
    <ChartCard title="Weekly Office Trend" subtitle="In-office attendance by week">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={theme === "dark" ? 0.15 : 0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: c.tick }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: c.tick }} axisLine={false} tickLine={false} width={35} tickFormatter={(v) => `${v}%`} />
          <ReferenceLine y={80} stroke={c.ref} strokeDasharray="4 4" strokeWidth={1.5} />
          <Tooltip
            formatter={(value: unknown) => [`${value}%`, "Office Rate"]}
            contentStyle={{
              backgroundColor: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 12, fontSize: 11,
              color: c.text,
              boxShadow: "var(--shadow-lg)",
            }}
            labelStyle={{ color: c.text }}
            itemStyle={{ color: c.sub }}
            cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
          />
          <Area type="monotone" dataKey="Office %" stroke="#6366f1" strokeWidth={2.5} fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: "#6366f1", stroke: c.bg, strokeWidth: 2 }}
            activeDot={{ r: 5, stroke: "#6366f1", strokeWidth: 2, fill: c.bg }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
