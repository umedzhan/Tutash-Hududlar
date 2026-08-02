import { useState } from 'react';
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApplicationFunnel, useDashboardSummary, useDistrictRanking, usePaymentTrend } from '../../api/reports';
import { Card, CardHeader } from '../../components/Card';
import { DistrictZoneFilter, type DistrictZoneFilterValue } from '../../components/DistrictZoneFilter';
import { APPLICATION_STATUS_LABEL, STAGE_LABEL } from '../../lib/status';
import { formatSom } from '../../lib/format';
import type { ApplicationStatus, Stage } from '../../types';

const FUNNEL_STAGES: { status: ApplicationStatus; color: string }[] = [
  { status: 'IN_REVIEW_CADASTRE', color: '#93c5fd' },
  { status: 'IN_REVIEW_ARCHITECTURE', color: '#60a5fa' },
  { status: 'IN_REVIEW_TAX', color: '#3b82f6' },
  { status: 'FINAL_APPROVAL', color: '#f59e0b' },
  { status: 'CONTRACT_GENERATED', color: '#a855f7' },
  { status: 'SIGNED', color: '#22c55e' },
  { status: 'ACTIVE', color: '#16a34a' },
];

const BRANCH_STATUSES: ApplicationStatus[] = ['AWAITING_CONSENT', 'INFO_REQUESTED', 'REJECTED'];
const STAGES: Stage[] = ['cadastre', 'architecture', 'tax', 'final'];

export function AdminReports() {
  const [filter, setFilter] = useState<DistrictZoneFilterValue>({ districtId: '', zoneId: '' });
  const { data: summary } = useDashboardSummary(filter);
  const { data: funnelData } = useApplicationFunnel(filter);
  const { data: trend } = usePaymentTrend(filter);
  const { data: ranking } = useDistrictRanking();

  const funnelChartData = funnelData
    ? FUNNEL_STAGES.map(({ status, color }) => ({
        name: APPLICATION_STATUS_LABEL[status],
        value: funnelData.statusCounts[status] ?? 0,
        fill: color,
      })).filter((d) => d.value > 0 || true)
    : [];

  return (
    <div className="space-y-4">
      <DistrictZoneFilter districtId={filter.districtId} zoneId={filter.zoneId} onChange={setFilter} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Arizalar jarayoni (voronka)" />
          <div className="p-4">
            {funnelData && funnelData.total > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <FunnelChart>
                  <Tooltip formatter={(value) => `${value} ta`} />
                  <Funnel dataKey="value" data={funnelChartData} isAnimationActive>
                    <LabelList position="right" dataKey="name" fill="#334155" stroke="none" fontSize={12} />
                    <LabelList position="left" dataKey="value" fill="#0f2657" stroke="none" fontSize={12} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">Ma'lumot yo'q</p>
            )}
            {funnelData && (
              <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                {BRANCH_STATUSES.map((status) => (
                  <span key={status}>
                    {APPLICATION_STATUS_LABEL[status]}: <span className="font-medium text-slate-700">{funnelData.statusCounts[status] ?? 0} ta</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Bosqichlar bo'yicha o'rtacha ko'rib chiqish muddati" />
          <div className="space-y-2 p-4">
            {STAGES.map((stage) => {
              const days = funnelData?.avgStageDurationDays[stage];
              return (
                <div key={stage} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{STAGE_LABEL[stage]}</span>
                  <span className="font-medium text-slate-800">{days != null ? `${days} kun` : "ma'lumot yo'q"}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {summary && (
        <Card>
          <CardHeader title="Hududlar va to'lovlar bo'yicha umumiy holat" />
          <div className="space-y-4 p-4 text-sm">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <ReportRow label="Jami hududlar" value={`${summary.regionStats.jami} ta`} />
              <ReportRow label="Band" value={`${summary.regionStats.band} ta (${summary.regionStats.bandPercent}%)`} />
              <ReportRow label="Bo'sh" value={`${summary.regionStats.bosh} ta (${summary.regionStats.boshPercent}%)`} />
              <ReportRow label="Muammoli" value={`${summary.regionStats.muammoli} ta (${summary.regionStats.muammoliPercent}%)`} />
            </div>
            <hr className="border-slate-100" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ReportRow label="Kutilayotgan to'lovlar" value={formatSom(summary.paymentStats.kutilayotgan)} />
              <ReportRow label="Undirilgan to'lovlar" value={formatSom(summary.paymentStats.undirilgan)} />
              <ReportRow label="Qarzdorlik" value={formatSom(summary.paymentStats.qarzdorlik)} />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="To'lovlar dinamikasi (so'nggi 6 oy)" />
        <div className="p-4">
          {trend && trend.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round(v / 1e6)}mln`} />
                <Tooltip formatter={(value) => (typeof value === 'number' ? formatSom(value) : String(value))} />
                <Legend />
                <Line type="monotone" dataKey="kutilmoqda" name="Kutilayotgan" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="to_langan" name="To'langan" stroke="#16a34a" strokeWidth={2} />
                <Line type="monotone" dataKey="qarzdor" name="Qarzdorlik" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">Ma'lumot yo'q</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="TOP-10 qarzdorlar" />
        {trend && trend.topDebtors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-4 py-2 font-normal">Kompaniya</th>
                  <th className="px-4 py-2 font-normal">Shartnoma</th>
                  <th className="px-4 py-2 font-normal">Hudud</th>
                  <th className="px-4 py-2 font-normal">Qarz</th>
                  <th className="px-4 py-2 font-normal">Kechikish</th>
                </tr>
              </thead>
              <tbody>
                {trend.topDebtors.map((d) => (
                  <tr key={d.contractId} className="border-b border-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{d.companyName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{d.contractNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">{d.regionAddress}</td>
                    <td className="px-4 py-2.5 font-medium text-red-600">{formatSom(d.debt)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{d.daysOverdue} kun</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-slate-400">Qarzdorlar yo'q</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Eng faol tumanlar" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-4 py-2 font-normal">Tuman/shahar</th>
                  <th className="px-4 py-2 font-normal">Arizalar</th>
                  <th className="px-4 py-2 font-normal">O'rtacha muddat</th>
                </tr>
              </thead>
              <tbody>
                {(ranking?.districts ?? []).map((row) => (
                  <tr key={row.districtId} className="border-b border-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{row.districtName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.applicationCount} ta</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.avgDurationDays != null ? `${row.avgDurationDays} kun` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!ranking || ranking.districts.length === 0) && <p className="p-8 text-center text-sm text-slate-400">Ma'lumot yo'q</p>}
          </div>
        </Card>

        <Card>
          <CardHeader title="Eng band mahallalar" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-4 py-2 font-normal">Mahalla</th>
                  <th className="px-4 py-2 font-normal">Tuman</th>
                  <th className="px-4 py-2 font-normal">Band foizi</th>
                </tr>
              </thead>
              <tbody>
                {(ranking?.zones ?? []).map((row) => (
                  <tr key={row.zoneId} className="border-b border-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{row.zoneName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.districtName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.band}/{row.total} ({row.bandPercent}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!ranking || ranking.zones.length === 0) && <p className="p-8 text-center text-sm text-slate-400">Ma'lumot yo'q</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
