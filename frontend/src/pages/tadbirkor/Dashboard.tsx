import { Link } from 'react-router-dom';
import { FileSignature, CreditCard, AlertCircle, FileText, MapPin, ClipboardCheck, PenLine } from 'lucide-react';
import { useMyDashboardSummary } from '../../api/reports';
import { useMyRegions } from '../../api/regions';
import { useAuthStore } from '../../store/authStore';
import { StatCard } from '../../components/StatCard';
import { Card, CardHeader } from '../../components/Card';
import { MapView } from '../../components/MapView';
import { StatusBadge } from '../../components/StatusBadge';
import { PAYMENT_STATUS_BADGE, PAYMENT_STATUS_LABEL } from '../../lib/status';
import { formatDate, formatSom, daysUntil } from '../../lib/format';
import type { Region } from '../../types';

export function TadbirkorDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: summary, isLoading } = useMyDashboardSummary();
  const { data: regions } = useMyRegions();

  if (isLoading || !summary) {
    return <p className="text-slate-400">Yuklanmoqda...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Xush kelibsiz!</p>
        <h2 className="text-xl font-semibold text-slate-900">{user?.name}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FileSignature size={20} className="text-blue-600" />} iconBg="bg-blue-50" label="Jami shartnomalar" value={`${summary.jamiShartnomalar} ta`} sub={`Faol: ${summary.faolShartnomalar}`} />
        <StatCard icon={<CreditCard size={20} className="text-emerald-600" />} iconBg="bg-emerald-50" label="Jami to'lovlar" value={formatSom(summary.jamiTolovlar)} sub="To'langan" subColor="text-emerald-600" />
        <StatCard icon={<AlertCircle size={20} className="text-amber-600" />} iconBg="bg-amber-50" label="Qarzdorlik" value={formatSom(summary.qarzdorlik)} sub={summary.qarzdorlik > 0 ? 'Muddati o\'tgan' : "Qarzdorlik yo'q"} subColor={summary.qarzdorlik > 0 ? 'text-red-600' : 'text-emerald-600'} />
        <StatCard icon={<FileText size={20} className="text-purple-600" />} iconBg="bg-purple-50" label="Aktiv arizalar" value={`${summary.aktivArizalar} ta`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Mening hududlarim" action={<Link to="/tadbirkor/hududlarim" className="text-sm text-brand-light">Xaritada ko'rish &rarr;</Link>} />
          <div className="p-3">
            <MapView regions={regions ?? []} height="320px" />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="To'lovlarim" action={<Link to="/tadbirkor/tolovlarim" className="text-sm text-brand-light">Barchasi &rarr;</Link>} />
            <div className="p-4">
              {summary.nextPayment ? (
                <>
                  <p className="text-xs text-slate-500">Keyingi to'lov</p>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-lg font-semibold text-slate-900">{formatSom(summary.nextPayment.amount)}</p>
                    <StatusBadge label={`${daysUntil(summary.nextPayment.dueDate)} kun qoldi`} className="bg-amber-100 text-amber-700" />
                  </div>
                  <p className="mb-3 text-xs text-slate-400">To'lov sanasi: {formatDate(summary.nextPayment.dueDate)}</p>
                  <Link to="/tadbirkor/tolovlarim" className="block w-full rounded-lg bg-brand py-2 text-center text-sm text-white hover:bg-brand-light">
                    To'lov qilish
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-400">Kutilayotgan to'lov yo'q</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Shartnomalarim" />
            <ul className="divide-y divide-slate-100">
              {summary.contracts.slice(0, 3).map((c) => {
                const region = c.hududId as Region;
                return (
                  <li key={c._id} className="px-4 py-3 text-sm">
                    <p className="font-medium text-slate-800">{c.contractNumber}</p>
                    <p className="text-xs text-slate-500">{region?.address}</p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="So'nggi to'lovlar" />
        <ul className="divide-y divide-slate-100">
          {summary.recentPayments.map((p) => (
            <li key={p._id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{formatDate(p.dueDate)}</span>
              <span>{formatSom(p.amount)}</span>
              <StatusBadge label={PAYMENT_STATUS_LABEL[p.status]} className={PAYMENT_STATUS_BADGE[p.status]} />
            </li>
          ))}
        </ul>
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-600">Xizmatlardan foydalanish bo'yicha qo'llanma</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <GuideStep icon={<MapPin size={18} />} step="1" title="Hudud tanlash" desc="Xaritadan mos hududni tanlang" />
          <GuideStep icon={<FileText size={18} />} step="2" title="Ariza yuborish" desc="Kerakli ma'lumotlarni to'ldirib ariza yuboring" />
          <GuideStep icon={<ClipboardCheck size={18} />} step="3" title="Ko'rib chiqish" desc="Arizangiz ko'rib chiqiladi va natija bildiriladi" />
          <GuideStep icon={<PenLine size={18} />} step="4" title="Shartnoma tuzish" desc="Tasdiqlangandan so'ng elektron shartnoma tuziladi" />
          <GuideStep icon={<CreditCard size={18} />} step="5" title="To'lov qilish" desc="To'lovlarni amalga oshirib faoliyatingizni boshlang" />
        </div>
      </div>
    </div>
  );
}

function GuideStep({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">{icon}</div>
      <p className="text-sm font-medium text-slate-800">{step}. {title}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </Card>
  );
}
