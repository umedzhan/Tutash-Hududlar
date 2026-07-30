import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, FileText, FileSignature, CreditCard, Bell, MessageSquare, Folder, User } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import type { NavItem } from '../components/Sidebar';
import { useNotifications } from '../api/notifications';

const TITLES: Record<string, string> = {
  '/tadbirkor': 'Bosh sahifa',
  '/tadbirkor/hududlarim': 'Mening hududlarim',
  '/tadbirkor/arizalarim': 'Arizalarim',
  '/tadbirkor/shartnomalarim': 'Shartnomalarim',
  '/tadbirkor/tolovlarim': "To'lovlarim",
  '/tadbirkor/xabarnomalar': 'Xabarnomalar',
  '/tadbirkor/murojaatlarim': 'Murojaatlarim',
  '/tadbirkor/hujjatlarim': 'Hujjatlarim',
  '/tadbirkor/profil': 'Foydalanuvchi profili',
};

export function TadbirkorLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] ?? 'Bosh sahifa';
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  const items: NavItem[] = [
    { to: '/tadbirkor', label: 'Bosh sahifa', icon: LayoutDashboard },
    { to: '/tadbirkor/hududlarim', label: 'Mening hududlarim', icon: Map },
    { to: '/tadbirkor/arizalarim', label: 'Arizalarim', icon: FileText },
    { to: '/tadbirkor/shartnomalarim', label: 'Shartnomalarim', icon: FileSignature },
    { to: '/tadbirkor/tolovlarim', label: "To'lovlarim", icon: CreditCard },
    { to: '/tadbirkor/xabarnomalar', label: 'Xabarnomalar', icon: Bell, badge: unread || undefined },
    { to: '/tadbirkor/murojaatlarim', label: 'Murojaatlarim', icon: MessageSquare },
    { to: '/tadbirkor/hujjatlarim', label: 'Hujjatlarim', icon: Folder },
    { to: '/tadbirkor/profil', label: 'Foydalanuvchi profili', icon: User },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar items={items} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
