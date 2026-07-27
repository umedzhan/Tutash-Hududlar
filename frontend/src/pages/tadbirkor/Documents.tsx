import { FileDown } from 'lucide-react';
import { useContracts } from '../../api/contracts';
import { Card } from '../../components/Card';
import { formatDate } from '../../lib/format';
import type { Region } from '../../types';

export function TadbirkorDocuments() {
  const { data: contracts, isLoading } = useContracts();
  const withPdf = (contracts ?? []).filter((c) => c.pdfPath);

  return (
    <Card>
      {isLoading ? (
        <p className="p-4 text-slate-400">Yuklanmoqda...</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {withPdf.map((c) => (
            <li key={c._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Shartnoma {c.contractNumber}</p>
                <p className="text-xs text-slate-500">{(c.hududId as Region)?.address} · {formatDate(c.createdAt)}</p>
              </div>
              <a href={c.pdfPath!} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                <FileDown size={14} /> Yuklab olish
              </a>
            </li>
          ))}
          {withPdf.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-400">Hozircha hujjatlar yo'q</p>}
        </ul>
      )}
    </Card>
  );
}
