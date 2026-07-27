import { NavLink } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function Sidebar({ items, footer }: { items: NavItem[]; footer?: React.ReactNode }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-[#0f2657] text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Landmark size={20} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">TUTASH HUDUDLAR</p>
          <p className="text-[10px] text-white/50">ELEKTRON PLATFORMASI</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? 'bg-white/15 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {Boolean(item.badge) && (
              <span className="rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {footer && <div className="border-t border-white/10 p-4">{footer}</div>}
    </aside>
  );
}
