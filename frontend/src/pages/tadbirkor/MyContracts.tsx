import { useContracts, useSignContract } from '../../api/contracts';
import { Card, CardHead, TableWrap, Badge } from '../../components/admin/ui';
import { formatDate, formatSom } from '../../lib/format';
import type { Region } from '../../types';

export function TadbirkorMyContracts() {
  const { data: contracts, isLoading } = useContracts();
  const signContract = useSignContract();

  return (
    <Card>
      <CardHead title="Shartnomalarim" subtitle={`Jami ${contracts?.length ?? 0} ta shartnoma`} />
      {isLoading ? (
        <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th>Shartnoma №</th>
              <th>Hudud</th>
              <th style={{ textAlign: 'right' }}>Jami</th>
              <th>Amal qilish muddati</th>
              <th>E-IMZO</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {(contracts ?? []).map((c) => (
              <tr key={c._id}>
                <td><span className="mono">{c.contractNumber}</span></td>
                <td style={{ color: 'var(--text-2)' }}>{(c.hududId as Region)?.address}</td>
                <td style={{ textAlign: 'right' }}><span className="mono">{formatSom(c.total)}</span></td>
                <td style={{ color: 'var(--text-2)' }}>
                  {formatDate(c.period.from)} — {formatDate(c.period.to)}
                </td>
                <td>
                  {c.eSign.signed ? (
                    <Badge tone="green">Imzolangan</Badge>
                  ) : (
                    <button type="button" onClick={() => signContract.mutate(c._id)} disabled={signContract.isPending} className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 11.5 }}>
                      E-IMZO bilan imzolash
                    </button>
                  )}
                </td>
                <td>
                  {c.pdfPath ? (
                    <a href={c.pdfPath} target="_blank" rel="noreferrer" className="link">
                      Yuklab olish
                    </a>
                  ) : (
                    '—'
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
