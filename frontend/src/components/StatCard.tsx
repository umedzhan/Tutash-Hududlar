import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}

export function StatCard({ icon, iconBg, label, value, sub, subColor = 'text-slate-500' }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
        {sub && <p className={`text-xs ${subColor}`}>{sub}</p>}
      </div>
    </div>
  );
}
