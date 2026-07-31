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
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import type { NavItem } from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';

const fullItems: NavItem[] = [
  { to: '/admin', label: 'Bosh sahifa', icon: LayoutDashboard },
  { to: '/admin/hududlar', label: 'Hududlar xaritasi', icon: Map },
  { to: '/admin/monitoring', label: 'Xatlov natijalari', icon: ScanLine },
  { to: '/admin/arizalar', label: 'Arizalar', icon: FileText },
  { to: '/admin/shartnomalar', label: 'Shartnomalar', icon: FileSignature },
  { to: '/admin/tolovlar', label: "To'lovlar", icon: CreditCard },
  { to: '/admin/hisobotlar', label: 'Hisobotlar', icon: BarChart3 },
  { to: '/admin/foydalanuvchilar', label: 'Foydalanuvchilar', icon: Users },
  { to: '/admin/royxatdan-otish-sorovlari', label: "Ro'yxatdan o'tish so'rovlari", icon: UserPlus },
  { to: '/admin/malumotnomalar', label: "Ma'lumotnomalar", icon: BookOpen },
  { to: '/admin/sozlamalar', label: 'Sozlamalar', icon: Settings },
];

// Qisman adminlar (kadastr/arxitektura/soliq) faqat o'z ish stoli — navbatdagi arizalarni ko'radi
const staffItems: NavItem[] = [{ to: '/admin/arizalar', label: 'Ish stolim (arizalar)', icon: FileText }];

const TITLES: Record<string, string> = {
  '/admin': 'Bosh sahifa',
  '/admin/hududlar': 'Hududlar xaritasi',
  '/admin/monitoring': 'Xatlov natijalari',
  '/admin/arizalar': 'Arizalar',
  '/admin/shartnomalar': 'Shartnomalar',
  '/admin/tolovlar': "To'lovlar",
  '/admin/hisobotlar': 'Hisobotlar',
  '/admin/foydalanuvchilar': 'Foydalanuvchilar',
  '/admin/royxatdan-otish-sorovlari': "Ro'yxatdan o'tish so'rovlari",
  '/admin/malumotnomalar': "Ma'lumotnomalar",
  '/admin/sozlamalar': 'Sozlamalar',
};

export function AdminLayout() {
  const location = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  const isStaff = role === 'KADASTR' || role === 'ARXITEKTURA' || role === 'SOLIQ';
  const items = isStaff ? staffItems : fullItems;
  const title = TITLES[location.pathname] ?? (isStaff ? 'Ish stolim' : 'Bosh sahifa');

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
