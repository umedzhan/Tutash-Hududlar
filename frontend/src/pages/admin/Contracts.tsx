import { useContracts } from '../../api/contracts';
import { Card } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { CONTRACT_STATUS_LABEL } from '../../lib/status';
import { formatDate, formatSom } from '../../lib/format';
import type { Company, Region } from '../../types';

export function AdminContracts() {
  const { data: contracts, isLoading } = useContracts();

  return (
    <Card>
      {isLoading ? (
        <p className="p-4 text-slate-400">Yuklanmoqda...</p>
      ) : (
        <DataTable
          columns={[
            { header: 'Shartnoma №', render: (c) => <span className="font-medium">{c.contractNumber}</span> },
            { header: 'Kompaniya', render: (c) => (c.companyId as Company)?.name },
            { header: 'Hudud', render: (c) => (c.hududId as Region)?.address },
            { header: 'Jami', render: (c) => formatSom(c.total) },
            { header: 'Davr', render: (c) => `${formatDate(c.period.from)} — ${formatDate(c.period.to)}` },
            { header: 'E-IMZO', render: (c) => (c.eSign.signed ? <span className="text-emerald-600">Imzolangan</span> : <span className="text-amber-600">Kutilmoqda</span>) },
            { header: 'Holati', render: (c) => <StatusBadge label={CONTRACT_STATUS_LABEL[c.status]} className="bg-slate-100 text-slate-700" /> },
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
