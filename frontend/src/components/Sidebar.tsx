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
    <aside className="flex h-full w-64 shrink-0 flex-col bg-gradient-to-b from-[#132c60] to-[#0b1d40] text-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
          <Landmark size={19} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">TUTASH HUDUDLAR</p>
          <p className="text-[10px] tracking-wide text-white/45">ELEKTRON PLATFORMASI</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? 'bg-white/10 font-medium text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent-light transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <item.icon size={18} className={isActive ? 'text-accent-light' : 'text-white/50 group-hover:text-white/80'} />
                <span className="flex-1">{item.label}</span>
                {Boolean(item.badge) && (
                  <span className="rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">{item.badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {footer && <div className="border-t border-white/10 p-4">{footer}</div>}
    </aside>
  );
}
