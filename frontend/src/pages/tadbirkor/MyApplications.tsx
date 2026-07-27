import { Link, useNavigate } from 'react-router-dom';
import { useApplications } from '../../api/applications';
import { Card } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { APPLICATION_STATUS_BADGE, APPLICATION_STATUS_LABEL } from '../../lib/status';
import { formatDate } from '../../lib/format';

export function TadbirkorMyApplications() {
  const { data: applications, isLoading } = useApplications();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/tadbirkor/arizalarim/yangi" className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light">
          + Yangi ariza
        </Link>
      </div>

      <Card>
        {isLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <DataTable
            columns={[
              { header: 'Ariza raqami', render: (a) => <span className="font-medium">{a.applicationNumber}</span> },
              { header: 'Hudud manzili', render: (a) => a.address },
              { header: 'Ariza sanasi', render: (a) => formatDate(a.createdAt) },
              { header: 'Holati', render: (a) => <StatusBadge label={APPLICATION_STATUS_LABEL[a.status]} className={APPLICATION_STATUS_BADGE[a.status]} /> },
            ]}
            rows={applications ?? []}
            rowKey={(a) => a._id}
            onRowClick={(a) => navigate(`/tadbirkor/arizalarim/${a._id}`)}
          />
        )}
      </Card>
    </div>
  );
}
