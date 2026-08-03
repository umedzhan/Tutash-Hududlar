import { useNavigate } from 'react-router-dom';
import { useApplications, downloadApplicationsExcel } from '../../api/applications';
import { Card, CardHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { APPLICATION_STATUS_BADGE, APPLICATION_STATUS_LABEL } from '../../lib/status';
import { formatDate } from '../../lib/format';
import type { Company } from '../../types';

export function AdminApplications() {
  const { data: applications, isLoading } = useApplications();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Arizalar"
        action={
          <button
            onClick={() => downloadApplicationsExcel()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Excelga yuklash
          </button>
        }
      />
      {isLoading ? (
        <p className="p-4 text-slate-400">Yuklanmoqda...</p>
      ) : (
        <DataTable
          onRowClick={(row) => navigate(`/admin/arizalar/${row._id}`)}
          columns={[
            { header: 'Ariza raqami', render: (a) => <span className="font-medium">{a.applicationNumber}</span> },
            { header: 'Kompaniya', render: (a) => (a.companyId as Company)?.name },
            { header: 'Hudud manzili', render: (a) => a.address },
            { header: 'Ariza sanasi', render: (a) => formatDate(a.createdAt) },
            {
              header: 'Holati',
              render: (a) => <StatusBadge label={APPLICATION_STATUS_LABEL[a.status]} className={APPLICATION_STATUS_BADGE[a.status]} />,
            },
          ]}
          rows={applications ?? []}
          rowKey={(a) => a._id}
        />
      )}
    </Card>
  );
}
