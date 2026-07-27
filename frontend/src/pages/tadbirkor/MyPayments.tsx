import { usePayments, useMarkPaid } from '../../api/payments';
import { Card } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { PAYMENT_STATUS_BADGE, PAYMENT_STATUS_LABEL } from '../../lib/status';
import { formatDate, formatSom } from '../../lib/format';
import type { Contract, Region } from '../../types';

export function TadbirkorMyPayments() {
  const { data: payments, isLoading } = usePayments();
  const markPaid = useMarkPaid();

  return (
    <Card>
      {isLoading ? (
        <p className="p-4 text-slate-400">Yuklanmoqda...</p>
      ) : (
        <DataTable
          columns={[
            { header: 'Hudud', render: (p) => ((p.contractId as Contract)?.hududId as Region)?.address },
            { header: 'Summa', render: (p) => formatSom(p.amount) },
            { header: 'Muddat', render: (p) => formatDate(p.dueDate) },
            { header: 'Holati', render: (p) => <StatusBadge label={PAYMENT_STATUS_LABEL[p.status]} className={PAYMENT_STATUS_BADGE[p.status]} /> },
            {
              header: 'Amal',
              render: (p) =>
                p.status === 'kutilmoqda' ? (
                  <button
                    onClick={() => markPaid.mutate(p._id)}
                    disabled={markPaid.isPending}
                    className="rounded-lg bg-brand px-3 py-1 text-xs text-white hover:bg-brand-light disabled:opacity-60"
                  >
                    To'lov qilish
                  </button>
                ) : (
                  p.paidDate && formatDate(p.paidDate)
                ),
            },
          ]}
          rows={payments ?? []}
          rowKey={(p) => p._id}
        />
      )}
    </Card>
  );
}
