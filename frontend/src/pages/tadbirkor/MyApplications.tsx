import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApplications } from '../../api/applications';
import { Card, CardHead, TableWrap, Badge } from '../../components/admin/ui';
import { APPLICATION_STATUS_LABEL } from '../../lib/status';
import { APPLICATION_STATUS_TONE } from '../../lib/adminTone';
import { formatDate } from '../../lib/format';

export function TadbirkorMyApplications() {
  const { data: applications, isLoading } = useApplications();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHead
        title="Arizalarim"
        subtitle={`Jami ${applications?.length ?? 0} ta ariza`}
        action={
          <Link to="/tadbirkor/arizalarim/yangi" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={14} />
            Yangi ariza
          </Link>
        }
      />
      {isLoading ? (
        <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th>Ariza raqami</th>
              <th>Hudud manzili</th>
              <th>Ariza sanasi</th>
              <th>Holati</th>
            </tr>
          </thead>
          <tbody>
            {(applications ?? []).map((a) => {
              const tone = APPLICATION_STATUS_TONE[a.status];
              return (
                <tr key={a._id} className="clickable" onClick={() => navigate(`/tadbirkor/arizalarim/${a._id}`)}>
                  <td><span className="mono">{a.applicationNumber}</span></td>
                  <td style={{ color: 'var(--text-2)' }}>{a.address}</td>
                  <td><span className="mono">{formatDate(a.createdAt)}</span></td>
                  <td>
                    <Badge tone={tone}>{APPLICATION_STATUS_LABEL[a.status]}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </Card>
  );
}
