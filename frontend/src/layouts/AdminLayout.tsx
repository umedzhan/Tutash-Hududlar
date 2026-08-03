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
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import type { NavItem } from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';

const fullItems: NavItem[] = [
  { to: '/admin', label: 'Bosh sahifa', icon: LayoutDashboard },
  { to: '/admin/hududlar', label: 'Hududlar xaritasi', icon: Map },
  { to: '/admin/monitoring', label: 'Shartnoma monitoringi', icon: ScanLine },
  { to: '/admin/nazorat', label: 'Yer nazorati', icon: AlertTriangle },
  { to: '/admin/muhofaza-zonalari', label: 'Muhofaza zonalari', icon: Shield },
  { to: '/admin/arizalar', label: 'Arizalar', icon: FileText },
  { to: '/admin/shartnomalar', label: 'Shartnomalar', icon: FileSignature },
  { to: '/admin/muddati-tugayotgan-shartnomalar', label: 'Muddati tugayotganlar', icon: CalendarClock },
  { to: '/admin/tolovlar', label: "To'lovlar", icon: CreditCard },
  { to: '/admin/hisobotlar', label: 'Hisobotlar', icon: BarChart3 },
  { to: '/admin/foydalanuvchilar', label: 'Foydalanuvchilar', icon: Users },
  { to: '/admin/royxatdan-otish-sorovlari', label: "Ro'yxatdan o'tish so'rovlari", icon: UserPlus },
  { to: '/admin/malumotnomalar', label: "Ma'lumotnomalar", icon: BookOpen },
  { to: '/admin/sozlamalar', label: 'Sozlamalar', icon: Settings },
];

// Qisman adminlar (kadastr/arxitektura/soliq) faqat o'z ish stoli va tegishli modullarni ko'radi
const staffItemsByRole: Record<string, NavItem[]> = {
  KADASTR: [
    { to: '/admin/arizalar', label: 'Ish stolim (arizalar)', icon: FileText },
    { to: '/admin/nazorat', label: 'Yer nazorati', icon: AlertTriangle },
  ],
  SOLIQ: [
    { to: '/admin/arizalar', label: 'Ish stolim (arizalar)', icon: FileText },
    { to: '/admin/nazorat', label: 'Yer nazorati', icon: AlertTriangle },
  ],
  ARXITEKTURA: [
    { to: '/admin/arizalar', label: 'Ish stolim (arizalar)', icon: FileText },
    { to: '/admin/muhofaza-zonalari', label: 'Muhofaza zonalari', icon: Shield },
  ],
};

const TITLES: Record<string, string> = {
  '/admin': 'Bosh sahifa',
  '/admin/hududlar': 'Hududlar xaritasi',
  '/admin/monitoring': 'Shartnoma monitoringi',
  '/admin/nazorat': 'Yer nazorati',
  '/admin/muhofaza-zonalari': 'Muhofaza zonalari',
  '/admin/arizalar': 'Arizalar',
  '/admin/shartnomalar': 'Shartnomalar',
  '/admin/muddati-tugayotgan-shartnomalar': 'Muddati tugayotgan shartnomalar',
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
  const items = isStaff && role ? staffItemsByRole[role] : fullItems;
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
