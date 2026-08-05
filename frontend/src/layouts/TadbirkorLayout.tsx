import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, FileText, FileSignature, CreditCard, Bell, MessageSquare, Folder, User } from 'lucide-react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import type { AdminNavGroup } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { useNotifications } from '../api/notifications';
import { useThemeStore } from '../store/themeStore';
import { Chatbot } from '../components/chatbot/Chatbot';
import '../styles/admin-theme.css';

const TITLES: Record<string, [string, string]> = {
  '/tadbirkor': ['Bosh sahifa', 'Shaxsiy ish stolingiz'],
  '/tadbirkor/hududlarim': ['Mening hududlarim', 'Sizga biriktirilgan yer uchastkalari'],
  '/tadbirkor/arizalarim': ['Arizalarim', 'Yuborilgan arizalar va ularning holati'],
  '/tadbirkor/shartnomalarim': ['Shartnomalarim', 'Imzolangan ijaraga olish shartnomalari'],
  '/tadbirkor/tolovlarim': ["To'lovlarim", "Ijara to'lovlari tarixi va grafigi"],
  '/tadbirkor/xabarnomalar': ['Xabarnomalar', 'Tizimdan kelgan bildirishnomalar'],
  '/tadbirkor/murojaatlarim': ['Murojaatlarim', 'Ma\'muriyatga yuborilgan so\'rovlar'],
  '/tadbirkor/hujjatlarim': ['Hujjatlarim', "Shartnoma va boshqa hujjatlar arxivi"],
  '/tadbirkor/profil': ['Foydalanuvchi profili', "Korxona va shaxsiy ma'lumotlar"],
};

export function TadbirkorLayout() {
  const location = useLocation();
  const theme = useThemeStore((s) => s.theme);
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  const groups: AdminNavGroup[] = [
    {
      items: [
        { to: '/tadbirkor', label: 'Bosh sahifa', icon: LayoutDashboard },
        { to: '/tadbirkor/hududlarim', label: 'Mening hududlarim', icon: Map },
        { to: '/tadbirkor/arizalarim', label: 'Arizalarim', icon: FileText },
        { to: '/tadbirkor/shartnomalarim', label: 'Shartnomalarim', icon: FileSignature },
        { to: '/tadbirkor/tolovlarim', label: "To'lovlarim", icon: CreditCard },
      ],
    },
    {
      items: [
        { to: '/tadbirkor/xabarnomalar', label: 'Xabarnomalar', icon: Bell, badge: unread || undefined },
        { to: '/tadbirkor/murojaatlarim', label: 'Murojaatlarim', icon: MessageSquare },
        { to: '/tadbirkor/hujjatlarim', label: 'Hujjatlarim', icon: Folder },
        { to: '/tadbirkor/profil', label: 'Profil', icon: User },
      ],
    },
  ];

  const [title, subtitle] = TITLES[location.pathname] ?? ['Bosh sahifa', ''];

  return (
    <div className="admin-shell" data-theme={theme}>
      <div className="as-app">
        <AdminSidebar groups={groups} />
        <div className="as-main">
          <AdminHeader title={title} subtitle={subtitle} />
          <div className="as-content">
            <Outlet />
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
