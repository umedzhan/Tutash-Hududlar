import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  ScanLine,
  FileText,
  FileSignature,
  CreditCard,
  BarChart3,
  Users,
  UserPlus,
  BookOpen,
  Settings,
  CalendarClock,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import type { AdminNavGroup } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useDashboardSummary } from '../api/reports';
import { useRegistrationRequests } from '../api/registration';
import '../styles/admin-theme.css';

const TITLES: Record<string, [string, string]> = {
  '/admin': ['Bosh sahifa', "Umumiy ko'rsatkichlar va so'nggi faoliyat"],
  '/admin/hududlar': ['Hududlar xaritasi', 'Barcha hududlar joylashuvi va holati'],
  '/admin/monitoring': ['Shartnoma monitoringi', "Bosqichlar va to'lovlar bo'yicha kuzatuv"],
  '/admin/nazorat': ['Yer nazorati', 'Maqsadli foydalanish tekshiruvlari'],
  '/admin/muhofaza-zonalari': ['Muhofaza zonalari', 'Cheklov zonalari va kesishuvlar'],
  '/admin/arizalar': ['Arizalar', 'Tadbirkorlar arizalarini ko\'rib chiqish'],
  '/admin/shartnomalar': ['Shartnomalar', 'Imzolangan shartnomalar reyestri'],
  '/admin/muddati-tugayotgan-shartnomalar': ['Muddati tugayotganlar', 'Amal qilish muddati yaqinlashgan shartnomalar'],
  '/admin/tolovlar': ["To'lovlar", "Shartnomalar bo'yicha to'lovlar nazorati"],
  '/admin/hisobotlar': ['Hisobotlar', 'Tahliliy ko\'rsatkichlar va statistika'],
  '/admin/foydalanuvchilar': ['Foydalanuvchilar', 'Xodimlar, rollar va kirish huquqlari'],
  '/admin/royxatdan-otish-sorovlari': ["Ro'yxatdan o'tish so'rovlari", "Tadbirkorlarning platformaga kirish so'rovlari"],
  '/admin/malumotnomalar': ["Ma'lumotnomalar", "Tizim lug'atlari va yo'riqnomalar"],
  '/admin/sozlamalar': ['Sozlamalar', 'Profil, xavfsizlik va tizim parametrlari'],
};

export function AdminLayout() {
  const location = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  const theme = useThemeStore((s) => s.theme);
  const isStaff = role === 'KADASTR' || role === 'ARXITEKTURA' || role === 'SOLIQ';

  const { data: summary } = useDashboardSummary(undefined);
  const { data: pendingRequests } = useRegistrationRequests('kutilmoqda');

  const groups: AdminNavGroup[] = isStaff
    ? [
        {
          items: [
            ...(role === 'ARXITEKTURA'
              ? [
                  { to: '/admin/arizalar', label: 'Ish stolim (arizalar)', icon: FileText },
                  { to: '/admin/muhofaza-zonalari', label: 'Muhofaza zonalari', icon: Shield },
                ]
              : [
                  { to: '/admin/arizalar', label: 'Ish stolim (arizalar)', icon: FileText },
                  { to: '/admin/nazorat', label: 'Yer nazorati', icon: AlertTriangle },
                ]),
            { to: '/admin/sozlamalar', label: 'Profil', icon: Settings },
          ],
        },
      ]
    : [
        {
          label: 'Asosiy',
          items: [
            { to: '/admin', label: 'Bosh sahifa', icon: LayoutDashboard },
            { to: '/admin/hududlar', label: 'Hududlar xaritasi', icon: Map },
            { to: '/admin/monitoring', label: 'Shartnoma monitoringi', icon: ScanLine },
            { to: '/admin/nazorat', label: 'Yer nazorati', icon: AlertTriangle },
            { to: '/admin/muhofaza-zonalari', label: 'Muhofaza zonalari', icon: Shield },
          ],
        },
        {
          label: 'Hujjatlar',
          items: [
            { to: '/admin/arizalar', label: 'Arizalar', icon: FileText, badge: summary?.applicationStats.inReview },
            { to: '/admin/shartnomalar', label: 'Shartnomalar', icon: FileSignature },
            { to: '/admin/muddati-tugayotgan-shartnomalar', label: 'Muddati tugayotganlar', icon: CalendarClock },
            { to: '/admin/tolovlar', label: "To'lovlar", icon: CreditCard },
            { to: '/admin/hisobotlar', label: 'Hisobotlar', icon: BarChart3 },
          ],
        },
        {
          label: 'Boshqaruv',
          items: [
            { to: '/admin/foydalanuvchilar', label: 'Foydalanuvchilar', icon: Users },
            {
              to: '/admin/royxatdan-otish-sorovlari',
              label: "Ro'yxatdan o'tish so'rovlari",
              icon: UserPlus,
              badge: pendingRequests?.length,
            },
            { to: '/admin/malumotnomalar', label: "Ma'lumotnomalar", icon: BookOpen },
            { to: '/admin/sozlamalar', label: 'Sozlamalar', icon: Settings },
          ],
        },
      ];

  const [title, subtitle] = TITLES[location.pathname] ?? [isStaff ? 'Ish stolim' : 'Bosh sahifa', ''];

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
    </div>
  );
}
