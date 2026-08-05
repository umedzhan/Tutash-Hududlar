import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Moon, Sun, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNotifications } from '../../api/notifications';
import { ROLE_LABEL } from '../../lib/status';
import { initials } from '../../lib/format';

export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="as-header">
      <div className="as-page-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="as-header-right">
        <label className="as-search">
          <Search size={15} />
          <input placeholder="Qidirish... (hudud, ariza, shartnoma)" />
        </label>
        <div className="as-chip-loc">
          <MapPin size={14} />
          Termiz shahri
        </div>
        <button type="button" className="as-icon-btn" title="Rejimni almashtirish" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button type="button" className="as-icon-btn">
          <Bell size={17} />
          {unread > 0 && <span className="as-dot" />}
        </button>
        <div style={{ position: 'relative' }}>
          <button type="button" className="as-avatar" onClick={() => setMenuOpen((v) => !v)}>
            <div className="as-avatar-img">{user ? initials(user.name) : ''}</div>
            <div>
              <b>{user?.name}</b>
              <span>{user ? (ROLE_LABEL[user.role] ?? user.role) : ''}</span>
            </div>
          </button>
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 69 }}
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  zIndex: 70,
                  minWidth: 160,
                  padding: 6,
                }}
              >
                <button
                  type="button"
                  className="link"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 10px', color: 'var(--red)' }}
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  <LogOut size={14} />
                  Chiqish
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
