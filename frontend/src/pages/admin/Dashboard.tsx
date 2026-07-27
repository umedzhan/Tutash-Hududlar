import { Link } from 'react-router-dom';
import { Map, CheckCircle2, CircleDashed, AlertTriangle, MapPin, FileText, FileSignature, ScanLine } from 'lucide-react';
import { useDashboardSummary } from '../../api/reports';
import { useRegions } from '../../api/regions';
import { StatCard } from '../../components/StatCard';
import { Card, CardHeader } from '../../components/Card';
import { MapView } from '../../components/MapView';
import { StatusBadge } from '../../components/StatusBadge';
import { APPLICATION_STATUS_BADGE, APPLICATION_STATUS_LABEL } from '../../lib/status';
import { formatDate, formatSom } from '../../lib/format';
import type { Application, Company } from '../../types';

export function AdminDashboard() {
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: regions } = useRegions();

  if (isLoading || !summary) {
    return <p className="text-slate-400">Yuklanmoqda...</p>;
  }

  const { regionStats, recentApplications, paymentStats } = summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Map size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
          label="Jami hududlar"
          value={`${regionStats.jami} ta`}
          sub="Barchasi"
        />
        <StatCard
          icon={<CheckCircle2 size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Band hududlar"
          value={`${regionStats.band} ta`}
          sub={`${regionStats.bandPercent}%`}
          subColor="text-emerald-600"
        />
        <StatCard
          icon={<CircleDashed size={20} className="text-amber-600" />}
          iconBg="bg-amber-50"
          label="Bo'sh hududlar"
          value={`${regionStats.bosh} ta`}
          sub={`${regionStats.boshPercent}%`}
          subColor="text-amber-600"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-red-600" />}
          iconBg="bg-red-50"
          label="Muammoli hududlar"
          value={`${regionStats.muammoli} ta`}
          sub={`${regionStats.muammoliPercent}%`}
          subColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Hududlar xaritasi" action={<Link to="/admin/hududlar" className="text-sm text-brand-light">Barchasi &rarr;</Link>} />
          <div className="p-3">
            <MapView regions={regions ?? []} height="360px" />
          </div>
        </Card>

        <Card>
          <CardHeader title="So'nggi arizalar" action={<Link to="/admin/arizalar" className="text-sm text-brand-light">Barchasi &rarr;</Link>} />
          <ul className="divide-y divide-slate-100">
            {recentApplications.map((app: Application) => {
              const company = app.companyId as Company;
              return (
                <li key={app._id} className="px-4 py-3">
                  <Link to={`/admin/arizalar/${app._id}`} className="block">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">{company?.name}</p>
                      <StatusBadge label={APPLICATION_STATUS_LABEL[app.status]} className={APPLICATION_STATUS_BADGE[app.status]} />
                    </div>
                    <p className="text-xs text-slate-500">{app.address}</p>
                    <p className="text-xs text-slate-400">{formatDate(app.createdAt)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="To'lovlar statistikasi (joriy oy)" />
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Kutilayotgan</p>
            <p className="text-lg font-semibold text-slate-900">{formatSom(paymentStats.kutilayotgan)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Undirilgan</p>
            <p className="text-lg font-semibold text-emerald-600">{formatSom(paymentStats.undirilgan)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Qarzdorlik</p>
            <p className="text-lg font-semibold text-red-600">{formatSom(paymentStats.qarzdorlik)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProcessStep icon={<MapPin size={18} />} step="1" title="Hudud tanlash" desc="Tadbirkor xaritadan bo'sh hududni tanlaydi" />
        <ProcessStep icon={<FileText size={18} />} step="2" title="Ariza topshirish" desc="Maqsad va davrni ko'rsatib ariza yuboradi" />
        <ProcessStep icon={<FileSignature size={18} />} step="3" title="Shartnoma" desc="Tasdiqlangach shartnoma generatsiya qilinadi va E-IMZO bilan imzolanadi" />
        <ProcessStep icon={<ScanLine size={18} />} step="4" title="Monitoring" desc="Hudud foydalanishi muntazam nazorat qilinadi" />
      </div>
    </div>
  );
}

function ProcessStep({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <Card>
      <div className="bg-[#0f2657] px-4 py-2 text-sm font-medium text-white">
        {step}. {title}
      </div>
      <div className="flex items-start gap-2 p-4">
        <div className="mt-0.5 text-brand-light">{icon}</div>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </Card>
  );
}
