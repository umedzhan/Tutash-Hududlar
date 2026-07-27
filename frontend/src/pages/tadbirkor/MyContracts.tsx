import { useContracts, useSignContract } from '../../api/contracts';
import { Card } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate, formatSom } from '../../lib/format';
import type { Region } from '../../types';

export function TadbirkorMyContracts() {
  const { data: contracts, isLoading } = useContracts();
  const signContract = useSignContract();

  return (
    <Card>
      {isLoading ? (
        <p className="p-4 text-slate-400">Yuklanmoqda...</p>
      ) : (
        <DataTable
          columns={[
            { header: 'Shartnoma №', render: (c) => <span className="font-medium">{c.contractNumber}</span> },
            { header: 'Hudud', render: (c) => (c.hududId as Region)?.address },
            { header: 'Jami', render: (c) => formatSom(c.total) },
            { header: 'Amal qilish muddati', render: (c) => `${formatDate(c.period.from)} — ${formatDate(c.period.to)}` },
            {
              header: 'E-IMZO',
              render: (c) =>
                c.eSign.signed ? (
                  <StatusBadge label="Imzolangan" className="bg-emerald-100 text-emerald-700" />
                ) : (
                  <button
                    onClick={() => signContract.mutate(c._id)}
                    disabled={signContract.isPending}
                    className="rounded-lg bg-brand px-3 py-1 text-xs text-white hover:bg-brand-light disabled:opacity-60"
                  >
                    E-IMZO bilan imzolash
                  </button>
                ),
            },
            {
              header: 'PDF',
              render: (c) =>
                c.pdfPath ? (
                  <a href={c.pdfPath} target="_blank" rel="noreferrer" className="text-brand-light">
                    Yuklab olish
                  </a>
                ) : (
                  '—'
                ),
            },
          ]}
          rows={contracts ?? []}
          rowKey={(c) => c._id}
        />
      )}
    </Card>
  );
}
