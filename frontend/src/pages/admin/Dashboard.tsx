import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, CheckCircle2, CircleDashed, AlertTriangle, FileText, CalendarClock, TrendingUp, Home } from 'lucide-react';
import { useDashboardSummary, useDistrictRanking } from '../../api/reports';
import { useRegions } from '../../api/regions';
import { StatCard } from '../../components/StatCard';
import { Card, CardHeader } from '../../components/Card';
import { MapView } from '../../components/MapView';
import { StatusBadge } from '../../components/StatusBadge';
import { DistrictZoneFilter, type DistrictZoneFilterValue } from '../../components/DistrictZoneFilter';
import { APPLICATION_STATUS_BADGE, APPLICATION_STATUS_LABEL } from '../../lib/status';
import { formatDate, formatSom } from '../../lib/format';
import type { Application, Company } from '../../types';

export function AdminDashboard() {
  const [filter, setFilter] = useState<DistrictZoneFilterValue>({ districtId: '', zoneId: '' });
  const { data: summary, isLoading } = useDashboardSummary(filter);
  const { data: regions } = useRegions();
  const { data: ranking } = useDistrictRanking();

  const filteredRegions = useMemo(() => {
    if (!regions) return [];
    return regions.filter((r) => {
      if (filter.zoneId) return r.zoneId === filter.zoneId;
      if (filter.districtId) return r.districtId === filter.districtId;
      return true;
    });
  }, [regions, filter]);

  return (
    <div className="space-y-6">
      <DistrictZoneFilter districtId={filter.districtId} zoneId={filter.zoneId} onChange={setFilter} />

      {isLoading || !summary ? (
        <p className="text-slate-400">Yuklanmoqda...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Map size={20} className="text-blue-600" />} iconBg="bg-blue-50" label="Jami hududlar" value={`${summary.regionStats.jami} ta`} sub="Barchasi" />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-emerald-600" />}
              iconBg="bg-emerald-50"
              label="Band hududlar"
              value={`${summary.regionStats.band} ta`}
              sub={`${summary.regionStats.bandPercent}%`}
              subColor="text-emerald-600"
            />
            <StatCard
              icon={<CircleDashed size={20} className="text-amber-600" />}
              iconBg="bg-amber-50"
              label="Bo'sh hududlar"
              value={`${summary.regionStats.bosh} ta`}
              sub={`${summary.regionStats.boshPercent}%`}
              subColor="text-amber-600"
            />
            <StatCard
              icon={<AlertTriangle size={20} className="text-red-600" />}
              iconBg="bg-red-50"
              label="Muammoli hududlar"
              value={`${summary.regionStats.muammoli} ta`}
              sub={`${summary.regionStats.muammoliPercent}%`}
              subColor="text-red-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<FileText size={20} className="text-purple-600" />} iconBg="bg-purple-50" label="Jami arizalar" value={`${summary.applicationStats.total} ta`} sub={`Ko'rib chiqilmoqda: ${summary.applicationStats.inReview}`} />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-emerald-600" />}
              iconBg="bg-emerald-50"
              label="Tasdiqlangan"
              value={`${summary.applicationStats.approved} ta`}
              sub={summary.applicationStats.total ? `${Math.round((summary.applicationStats.approved / summary.applicationStats.total) * 100)}%` : '0%'}
              subColor="text-emerald-600"
            />
            <StatCard
              icon={<AlertTriangle size={20} className="text-red-600" />}
              iconBg="bg-red-50"
              label="Rad etilgan"
              value={`${summary.applicationStats.rejected} ta`}
              sub={summary.applicationStats.total ? `${Math.round((summary.applicationStats.rejected / summary.applicationStats.total) * 100)}%` : '0%'}
              subColor="text-red-600"
            />
            <StatCard
              icon={<CalendarClock size={20} className="text-orange-600" />}
              iconBg="bg-orange-50"
              label="30 kunda tugaydi"
              value={`${summary.expiringSoon30} ta shartnoma`}
              sub="Batafsil →"
              subColor="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Hududlar xaritasi" action={<Link to="/admin/hududlar" className="text-sm text-brand-light">Barchasi &rarr;</Link>} />
              <div className="p-3">
                <MapView regions={filteredRegions} height="360px" />
              </div>
            </Card>

            <Card>
              <CardHeader title="So'nggi arizalar" action={<Link to="/admin/arizalar" className="text-sm text-brand-light">Barchasi &rarr;</Link>} />
              <ul className="divide-y divide-slate-100">
                {summary.recentApplications.map((app: Application) => {
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
                {summary.recentApplications.length === 0 && <p className="p-4 text-center text-sm text-slate-400">Ariza yo'q</p>}
              </ul>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Muddati tugayotgan shartnomalar (30 kun ichida)"
              action={<Link to="/admin/muddati-tugayotgan-shartnomalar" className="text-sm text-brand-light">Batafsil &rarr;</Link>}
            />
            <div className="p-4 text-sm text-slate-600">
              {summary.expiringSoon30 > 0 ? (
                <p>
                  <span className="font-semibold text-orange-600">{summary.expiringSoon30} ta</span> faol shartnoma yaqin 30 kun ichida
                  muddati tugaydi — tadbirkorlar bilan bog'lanish yoki uzaytirish jarayonini boshlash tavsiya etiladi.
                </p>
              ) : (
                <p className="text-slate-400">Yaqin 30 kun ichida muddati tugaydigan faol shartnoma yo'q.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="To'lovlar statistikasi" />
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Kutilayotgan</p>
                <p className="text-lg font-semibold text-slate-900">{formatSom(summary.paymentStats.kutilayotgan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Undirilgan</p>
                <p className="text-lg font-semibold text-emerald-600">{formatSom(summary.paymentStats.undirilgan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Qarzdorlik</p>
                <p className="text-lg font-semibold text-red-600">{formatSom(summary.paymentStats.qarzdorlik)}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Eng faol tumanlar" action={<TrendingUp size={16} className="text-slate-400" />} />
              <ul className="divide-y divide-slate-100">
                {(ranking?.districts ?? []).slice(0, 5).map((row, idx) => (
                  <li key={row.districtId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-slate-700">{idx + 1}. {row.districtName}</span>
                    <span className="text-slate-500">{row.applicationCount} ariza</span>
                  </li>
                ))}
                {(!ranking || ranking.districts.length === 0) && <p className="p-4 text-center text-sm text-slate-400">Ma'lumot yo'q</p>}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Eng band mahallalar" action={<Home size={16} className="text-slate-400" />} />
              <ul className="divide-y divide-slate-100">
                {(ranking?.zones ?? []).slice(0, 5).map((row, idx) => (
                  <li key={row.zoneId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-slate-700">{idx + 1}. {row.zoneName} <span className="text-xs text-slate-400">({row.districtName})</span></span>
                    <span className="text-slate-500">{row.bandPercent}%</span>
                  </li>
                ))}
                {(!ranking || ranking.zones.length === 0) && <p className="p-4 text-center text-sm text-slate-400">Ma'lumot yo'q</p>}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
