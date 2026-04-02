"use client";

const STATUS_BG_CLASSES: Record<string, string> = {
  "Office": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  "Home": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
  "Client Location": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
  "Split Day": "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-400",
  "Travel": "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-400",
  "Leave": "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400",
  "Pending": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
};

export default function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_BG_CLASSES[status] || "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
