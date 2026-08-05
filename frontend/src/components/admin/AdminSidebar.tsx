import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Landmark } from 'lucide-react';

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface AdminNavGroup {
  label?: string;
  items: AdminNavItem[];
}

export function AdminSidebar({ groups }: { groups: AdminNavGroup[] }) {
  return (
    <aside className="as-sidebar">
      <div className="as-brand">
        <div className="as-brand-logo">
          <Landmark size={20} color="#fff" />
        </div>
        <div>
          <div className="as-brand-name">TUTASH HUDUDLAR</div>
          <div className="as-brand-sub">Elektron platformasi</div>
        </div>
      </div>

      <nav className="as-nav">
        {groups.map((group, i) => (
          <div key={group.label ?? i}>
            {group.label && <div className="as-nav-label">{group.label}</div>}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => `as-nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon />
                <span style={{ flex: 1 }}>{item.label}</span>
                {Boolean(item.badge) && <span className="as-nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="as-sidebar-card">
        <b>Yordam kerakmi?</b>
        <span>Qo'llanma va texnik yordam markaziga murojaat qiling.</span>
      </div>
    </aside>
  );
}
