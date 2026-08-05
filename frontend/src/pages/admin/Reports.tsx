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
import { Card, CardHead, TableWrap } from '../../components/admin/ui';
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
    <div>
      <div style={{ marginBottom: 16 }}>
        <DistrictZoneFilter districtId={filter.districtId} zoneId={filter.zoneId} onChange={setFilter} />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <Card>
          <CardHead title="Arizalar jarayoni (voronka)" />
          <div style={{ padding: '10px 22px 22px' }}>
            {funnelData && funnelData.total > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <FunnelChart>
                  <Tooltip formatter={(value) => `${value} ta`} />
                  <Funnel dataKey="value" data={funnelChartData} isAnimationActive>
                    <LabelList position="right" dataKey="name" fill="var(--text-2)" stroke="none" fontSize={12} />
                    <LabelList position="left" dataKey="value" fill="var(--text)" stroke="none" fontSize={12} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Ma'lumot yo'q</p>
            )}
            {funnelData && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {BRANCH_STATUSES.map((status) => (
                  <span key={status} className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    {APPLICATION_STATUS_LABEL[status]}: {funnelData.statusCounts[status] ?? 0} ta
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="O'rtacha ko'rib chiqish muddati" subtitle="Bosqichlar kesimida" />
          <div style={{ padding: '18px 22px 22px' }}>
            {STAGES.map((stage) => {
              const days = funnelData?.avgStageDurationDays[stage];
              return (
                <div key={stage} className="stage">
                  <b>{STAGE_LABEL[stage]}</b>
                  <span>{days != null ? `${days} kun` : "ma'lumot yo'q"}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {summary && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Hududlar va to'lovlar bo'yicha umumiy holat" subtitle="Joriy davr kesimida" />
          <div className="kv-grid">
            <div className="kv"><span>Jami hududlar</span><b>{summary.regionStats.jami} ta</b></div>
            <div className="kv"><span>Band</span><b>{summary.regionStats.band} ta</b><small style={{ color: 'var(--green)' }}>{summary.regionStats.bandPercent}%</small></div>
            <div className="kv"><span>Bo'sh</span><b>{summary.regionStats.bosh} ta</b><small style={{ color: 'var(--amber)' }}>{summary.regionStats.boshPercent}%</small></div>
            <div className="kv"><span>Muammoli</span><b>{summary.regionStats.muammoli} ta</b><small style={{ color: 'var(--red)' }}>{summary.regionStats.muammoliPercent}%</small></div>
            <div className="kv"><span>Kutilayotgan to'lovlar</span><b>{formatSom(summary.paymentStats.kutilayotgan)}</b></div>
            <div className="kv"><span>Undirilgan to'lovlar</span><b style={{ color: 'var(--green)' }}>{formatSom(summary.paymentStats.undirilgan)}</b></div>
            <div className="kv"><span>Qarzdorlik</span><b>{formatSom(summary.paymentStats.qarzdorlik)}</b></div>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <CardHead title="To'lovlar dinamikasi" subtitle="So'nggi 6 oy" />
        <div style={{ padding: '16px 22px 22px', height: 300 }}>
          {trend && trend.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-2)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-3)' }} tickFormatter={(v) => `${Math.round(v / 1e6)}mln`} />
                <Tooltip formatter={(value) => (typeof value === 'number' ? formatSom(value) : String(value))} />
                <Legend />
                <Line type="monotone" dataKey="kutilmoqda" name="Kutilayotgan" stroke="#F59E0B" strokeWidth={2} />
                <Line type="monotone" dataKey="to_langan" name="To'langan" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="qarzdor" name="Qarzdorlik" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Ma'lumot yo'q</p>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHead title="TOP-10 qarzdorlar" />
        {trend && trend.topDebtors.length > 0 ? (
          <TableWrap>
            <thead>
              <tr>
                <th>Kompaniya</th>
                <th>Shartnoma</th>
                <th>Hudud</th>
                <th>Qarz</th>
                <th>Kechikish</th>
              </tr>
            </thead>
            <tbody>
              {trend.topDebtors.map((d) => (
                <tr key={d.contractId}>
                  <td>{d.companyName}</td>
                  <td style={{ color: 'var(--text-2)' }}>{d.contractNumber}</td>
                  <td style={{ color: 'var(--text-2)' }}>{d.regionAddress}</td>
                  <td style={{ fontWeight: 700, color: 'var(--red)' }}>{formatSom(d.debt)}</td>
                  <td style={{ color: 'var(--text-2)' }}>{d.daysOverdue} kun</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        ) : (
          <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Qarzdorlar yo'q</p>
        )}
      </Card>

      <div className="grid-2" style={{ marginBottom: 0 }}>
        <Card>
          <CardHead title="Eng faol tumanlar" />
          <TableWrap>
            <thead>
              <tr>
                <th>Tuman/shahar</th>
                <th>Arizalar</th>
                <th>O'rtacha muddat</th>
              </tr>
            </thead>
            <tbody>
              {(ranking?.districts ?? []).map((row) => (
                <tr key={row.districtId}>
                  <td>{row.districtName}</td>
                  <td style={{ color: 'var(--text-2)' }}>{row.applicationCount} ta</td>
                  <td style={{ color: 'var(--text-2)' }}>{row.avgDurationDays != null ? `${row.avgDurationDays} kun` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          {(!ranking || ranking.districts.length === 0) && (
            <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Ma'lumot yo'q</p>
          )}
        </Card>

        <Card>
          <CardHead title="Eng band mahallalar" />
          <TableWrap>
            <thead>
              <tr>
                <th>Mahalla</th>
                <th>Tuman</th>
                <th>Band foizi</th>
              </tr>
            </thead>
            <tbody>
              {(ranking?.zones ?? []).map((row) => (
                <tr key={row.zoneId}>
                  <td>{row.zoneName}</td>
                  <td style={{ color: 'var(--text-2)' }}>{row.districtName}</td>
                  <td style={{ color: 'var(--text-2)' }}>
                    {row.band}/{row.total} ({row.bandPercent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          {(!ranking || ranking.zones.length === 0) && (
            <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Ma'lumot yo'q</p>
          )}
        </Card>
      </div>
    </div>
  );
}
