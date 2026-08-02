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
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition hover:shadow-card">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-xl font-semibold tracking-tight text-slate-900">{value}</p>
        {sub && <p className={`text-xs ${subColor}`}>{sub}</p>}
      </div>
    </div>
  );
}
