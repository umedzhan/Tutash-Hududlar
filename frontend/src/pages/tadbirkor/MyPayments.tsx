import { usePayments, useMarkPaid } from '../../api/payments';
import { Card, CardHead, TableWrap, Badge } from '../../components/admin/ui';
import { PAYMENT_STATUS_LABEL } from '../../lib/status';
import { PAYMENT_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, formatSom } from '../../lib/format';
import type { Contract, Region } from '../../types';

export function TadbirkorMyPayments() {
  const { data: payments, isLoading } = usePayments();
  const markPaid = useMarkPaid();

  return (
    <Card>
      <CardHead title="To'lovlarim" subtitle={`Jami ${payments?.length ?? 0} ta yozuv`} />
      {isLoading ? (
        <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th>Hudud</th>
              <th style={{ textAlign: 'right' }}>Summa</th>
              <th>Muddat</th>
              <th>Holati</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p) => (
              <tr key={p._id}>
                <td style={{ color: 'var(--text-2)' }}>{((p.contractId as Contract)?.hududId as Region)?.address}</td>
                <td style={{ textAlign: 'right' }}><span className="mono">{formatSom(p.amount)}</span></td>
                <td><span className="mono">{formatDate(p.dueDate)}</span></td>
                <td>
                  <Badge tone={PAYMENT_STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                </td>
                <td>
                  {p.status === 'kutilmoqda' ? (
                    <button type="button" onClick={() => markPaid.mutate(p._id)} disabled={markPaid.isPending} className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 11.5 }}>
                      To'lov qilish
                    </button>
                  ) : (
                    p.paidDate && <span className="mono">{formatDate(p.paidDate)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </Card>
  );
}
