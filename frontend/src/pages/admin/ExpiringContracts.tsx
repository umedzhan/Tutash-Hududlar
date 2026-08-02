import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExpiringContracts } from '../../api/reports';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { DistrictZoneFilter, type DistrictZoneFilterValue } from '../../components/DistrictZoneFilter';
import { formatDate, formatSom } from '../../lib/format';

const RANGE_TABS: { value: 30 | 60 | 90; label: string; badge: string }[] = [
  { value: 30, label: '30 kun ichida', badge: 'bg-red-100 text-red-700' },
  { value: 60, label: '60 kun ichida', badge: 'bg-amber-100 text-amber-700' },
  { value: 90, label: '90 kun ichida', badge: 'bg-blue-100 text-blue-700' },
];

const GROUP_BADGE: Record<string, string> = {
  '30': 'bg-red-100 text-red-700',
  '60': 'bg-amber-100 text-amber-700',
  '90': 'bg-blue-100 text-blue-700',
};

export function AdminExpiringContracts() {
  const [filter, setFilter] = useState<DistrictZoneFilterValue>({ districtId: '', zoneId: '' });
  const [range, setRange] = useState<30 | 60 | 90>(90);
  const { data: contracts, isLoading } = useExpiringContracts(filter, range);

  return (
    <div className="space-y-4">
      <DistrictZoneFilter districtId={filter.districtId} zoneId={filter.zoneId} onChange={setFilter} />

      <div className="flex gap-2">
        {RANGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRange(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              range === tab.value ? 'bg-brand text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-400">Yuklanmoqda...</p>
        ) : (contracts ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">Tanlangan davrda muddati tugaydigan faol shartnoma yo'q</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-4 py-2 font-normal">Subyekt</th>
                  <th className="px-4 py-2 font-normal">Hudud</th>
                  <th className="px-4 py-2 font-normal">Tuman / Mahalla</th>
                  <th className="px-4 py-2 font-normal">Tugash sanasi</th>
                  <th className="px-4 py-2 font-normal">Qolgan kun</th>
                  <th className="px-4 py-2 font-normal">To'lov holati</th>
                </tr>
              </thead>
              <tbody>
                {(contracts ?? []).map((c) => (
                  <tr key={c._id} className="border-b border-slate-50">
                    <td className="px-4 py-2.5">
                      <Link to={`/admin/shartnomalar`} className="font-medium text-slate-800 hover:text-brand">
                        {c.company.name}
                      </Link>
                      <p className="text-xs text-slate-400">
                        STIR: {c.company.stir} · {c.company.director} · {c.company.phones?.join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{c.region?.address ?? '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {c.district?.name ?? '-'} {c.zone ? `/ ${c.zone.name}` : ''}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{formatDate(c.periodTo)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge label={`${c.daysLeft} kun`} className={GROUP_BADGE[c.group]} />
                    </td>
                    <td className="px-4 py-2.5">
                      {c.debt > 0 ? (
                        <span className="font-medium text-red-600">Qarzi bor: {formatSom(c.debt)}</span>
                      ) : (
                        <span className="text-emerald-600">Qarzi yo'q</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
