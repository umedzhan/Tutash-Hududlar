import { FileDown } from 'lucide-react';
import { useContracts, downloadContractsExcel, downloadContractWord } from '../../api/contracts';
import { Card, CardHead, TableWrap, Badge, Btn } from '../../components/admin/ui';
import { CONTRACT_STATUS_LABEL } from '../../lib/status';
import { CONTRACT_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, formatSom } from '../../lib/format';
import type { Company, Region } from '../../types';

export function AdminContracts() {
  const { data: contracts, isLoading } = useContracts();

  return (
    <Card>
      <CardHead
        title="Shartnomalar ro'yxati"
        subtitle={`Jami ${contracts?.length ?? 0} ta shartnoma`}
        action={
          <Btn variant="ghost" onClick={() => downloadContractsExcel()}>
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
              <th>Shartnoma №</th>
              <th>Kompaniya</th>
              <th>Hudud</th>
              <th style={{ textAlign: 'right' }}>Jami</th>
              <th>Davr</th>
              <th>E-IMZO</th>
              <th>Holati</th>
              <th>Hujjatlar</th>
            </tr>
          </thead>
          <tbody>
            {(contracts ?? []).map((c) => (
              <tr key={c._id}>
                <td><span className="mono">{c.contractNumber}</span></td>
                <td>{(c.companyId as Company)?.name}</td>
                <td style={{ color: 'var(--text-2)' }}>{(c.hududId as Region)?.address}</td>
                <td style={{ textAlign: 'right' }}><span className="mono">{formatSom(c.total)}</span></td>
                <td style={{ color: 'var(--text-2)' }}>
                  {formatDate(c.period.from)} — {formatDate(c.period.to)}
                </td>
                <td>
                  {c.eSign.signed ? <Badge tone="green">Imzolangan</Badge> : <Badge tone="amber">Kutilmoqda</Badge>}
                </td>
                <td>
                  <Badge tone={CONTRACT_STATUS_TONE[c.status]}>{CONTRACT_STATUS_LABEL[c.status]}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {c.pdfPath && (
                      <a href={c.pdfPath} target="_blank" rel="noreferrer" className="link">
                        PDF
                      </a>
                    )}
                    <button type="button" className="link" onClick={() => downloadContractWord(c._id, c.contractNumber)}>
                      Word
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </Card>
  );
}
