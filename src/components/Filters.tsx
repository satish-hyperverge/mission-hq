"use client";

import { Search, Filter } from "lucide-react";

interface Props {
  teams: string[];
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  dates: string[];
}

export default function Filters({
  teams,
  selectedTeam,
  onTeamChange,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  dates,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Filter size={16} />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <select
        value={selectedTeam}
        onChange={(e) => onTeamChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
      >
        <option value="All">All Teams</option>
        {teams.map((team) => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
      >
        {[...dates].reverse().slice(0, 30).map((d) => (
          <option key={d} value={d}>
            {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </option>
        ))}
      </select>
    </div>
  );
}
