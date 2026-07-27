import { useMemo } from 'react';
import { useApplications } from '../../api/applications';
import { useDashboardSummary } from '../../api/reports';
import { Card, CardHeader } from '../../components/Card';
import { APPLICATION_STATUS_LABEL } from '../../lib/status';
import { formatSom } from '../../lib/format';
import type { ApplicationStatus } from '../../types';

export function AdminReports() {
  const { data: applications } = useApplications();
  const { data: summary } = useDashboardSummary();

  const funnel = useMemo(() => {
    const counts: Record<string, number> = {};
    (applications ?? []).forEach((a) => {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    });
    return counts;
  }, [applications]);

  const statuses: ApplicationStatus[] = [
    'IN_REVIEW_CADASTRE',
    'IN_REVIEW_ARCHITECTURE',
    'IN_REVIEW_TAX',
    'FINAL_APPROVAL',
    'CONTRACT_GENERATED',
    'SIGNED',
    'ACTIVE',
    'REJECTED',
  ];

  const maxCount = Math.max(1, ...Object.values(funnel));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Arizalar jarayoni bo'yicha taqsimot" />
        <div className="space-y-3 p-4">
          {statuses.map((status) => (
            <div key={status}>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>{APPLICATION_STATUS_LABEL[status]}</span>
                <span>{funnel[status] ?? 0} ta</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-brand"
                  style={{ width: `${((funnel[status] ?? 0) / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {summary && (
        <Card>
          <CardHeader title="Hududlar va to'lovlar bo'yicha umumiy holat" />
          <div className="space-y-4 p-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <ReportRow label="Jami hududlar" value={`${summary.regionStats.jami} ta`} />
              <ReportRow label="Band" value={`${summary.regionStats.band} ta (${summary.regionStats.bandPercent}%)`} />
              <ReportRow label="Bo'sh" value={`${summary.regionStats.bosh} ta (${summary.regionStats.boshPercent}%)`} />
              <ReportRow label="Muammoli" value={`${summary.regionStats.muammoli} ta (${summary.regionStats.muammoliPercent}%)`} />
            </div>
            <hr className="border-slate-100" />
            <div className="grid grid-cols-1 gap-3">
              <ReportRow label="Kutilayotgan to'lovlar" value={formatSom(summary.paymentStats.kutilayotgan)} />
              <ReportRow label="Undirilgan to'lovlar" value={formatSom(summary.paymentStats.undirilgan)} />
              <ReportRow label="Qarzdorlik" value={formatSom(summary.paymentStats.qarzdorlik)} />
            </div>
          </div>
        </Card>
      )}
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
