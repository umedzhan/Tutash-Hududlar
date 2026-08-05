import { FileDown } from 'lucide-react';
import { useContracts } from '../../api/contracts';
import { Card, CardHead } from '../../components/admin/ui';
import { formatDate } from '../../lib/format';
import type { Region } from '../../types';

export function TadbirkorDocuments() {
  const { data: contracts, isLoading } = useContracts();
  const withPdf = (contracts ?? []).filter((c) => c.pdfPath);

  return (
    <Card>
      <CardHead title="Hujjatlarim" subtitle={`Jami ${withPdf.length} ta hujjat`} />
      {isLoading ? (
        <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (
        <div className="ariza-list">
          {withPdf.map((c) => (
            <div key={c._id} className="ariza" style={{ cursor: 'default' }}>
              <div className="ariza-body">
                <b>Shartnoma {c.contractNumber}</b>
                <p>
                  {(c.hududId as Region)?.address} · {formatDate(c.createdAt)}
                </p>
              </div>
              <a href={c.pdfPath!} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding: '7px 13px', fontSize: 11.5, textDecoration: 'none' }}>
                <FileDown size={14} /> Yuklab olish
              </a>
            </div>
          ))}
          {withPdf.length === 0 && <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Hozircha hujjatlar yo'q</p>}
        </div>
      )}
    </Card>
  );
}
