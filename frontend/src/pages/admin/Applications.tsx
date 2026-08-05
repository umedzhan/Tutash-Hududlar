import { useNavigate } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import { useApplications, downloadApplicationsExcel } from '../../api/applications';
import { Card, CardHead, TableWrap, Badge, Btn, CompAvatar } from '../../components/admin/ui';
import { APPLICATION_STATUS_LABEL } from '../../lib/status';
import { APPLICATION_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, initials } from '../../lib/format';
import type { Company } from '../../types';

export function AdminApplications() {
  const { data: applications, isLoading } = useApplications();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHead
        title="Arizalar ro'yxati"
        subtitle={`Jami ${applications?.length ?? 0} ta ariza`}
        action={
          <Btn variant="ghost" onClick={() => downloadApplicationsExcel()}>
            <FileDown size={14} />
            Excelga yuklash
          </Btn>
        }
      />
      {isLoading ? (
        <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th>Ariza raqami</th>
              <th>Kompaniya</th>
              <th>Hudud manzili</th>
              <th>Ariza sanasi</th>
              <th>Holati</th>
            </tr>
          </thead>
          <tbody>
            {(applications ?? []).map((a) => {
              const company = a.companyId as Company;
              const tone = APPLICATION_STATUS_TONE[a.status];
              return (
                <tr key={a._id} className="clickable" onClick={() => navigate(`/admin/arizalar/${a._id}`)}>
                  <td><span className="mono">{a.applicationNumber}</span></td>
                  <td>
                    <div className="td-comp">
                      <CompAvatar initials={initials(company?.name ?? '?')} tone={tone} />
                      <b>{company?.name}</b>
                    </div>
                  </td>
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
