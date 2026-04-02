export type LocationStatus = "Office" | "Home" | "Client Location" | "Split Day" | "Travel" | "Leave" | "Pending";

export interface Employee {
  name: string;
  email: string;
  team: string;
  statuses: Record<string, LocationStatus | string>;
}

export interface ApiResponse {
  success: boolean;
  dates: string[];
  employees: Employee[];
  fetchedAt: string;
}

export interface WeekCompliance {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  totalWorkDays: number;
  officeDays: number;  // Office + Split Day + Client Location count as "in-office"
  isCompliant: boolean;
  requiredDays: number;
}

export interface EmployeeAnalytics {
  name: string;
  email: string;
  team: string;
  office: number;
  home: number;
  clientLocation: number;
  splitDay: number;
  travel: number;
  leave: number;
  pending: number;
  totalDays: number;
  complianceRate: number; // percentage of weeks meeting 4-day requirement
  weeklyCompliance: WeekCompliance[];
}

export const STATUS_COLORS: Record<string, string> = {
  "Office": "#22c55e",
  "Home": "#3b82f6",
  "Client Location": "#f59e0b",
  "Split Day": "#8b5cf6",
  "Travel": "#ec4899",
  "Leave": "#6b7280",
  "Pending": "#ef4444",
};

export const STATUS_BG_COLORS: Record<string, string> = {
  "Office": "bg-green-100 text-green-800",
  "Home": "bg-blue-100 text-blue-800",
  "Client Location": "bg-amber-100 text-amber-800",
  "Split Day": "bg-violet-100 text-violet-800",
  "Travel": "bg-pink-100 text-pink-800",
  "Leave": "bg-gray-100 text-gray-600",
  "Pending": "bg-red-100 text-red-800",
};
