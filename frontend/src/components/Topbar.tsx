import { Bell, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../api/notifications';

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-3.5 backdrop-blur">
      <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 sm:flex">
          <MapPin size={16} />
          Termiz shahri
        </div>

        <button className="relative rounded-lg p-2 hover:bg-slate-100">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unread}
            </span>
          )}
        </button>

        <div className="group relative">
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200">
              <User size={16} />
            </div>
            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
          </button>
          <div className="invisible absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Chiqish
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
