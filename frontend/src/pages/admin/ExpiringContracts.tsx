import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExpiringContracts } from '../../api/reports';
import { Card, TableWrap, Badge, Seg, SegButton, Empty } from '../../components/admin/ui';
import { DistrictZoneFilter, type DistrictZoneFilterValue } from '../../components/DistrictZoneFilter';
import { formatDate, formatSom } from '../../lib/format';
import { CheckCircle2 } from 'lucide-react';
import type { Tone } from '../../lib/adminTone';

const RANGE_TABS: { value: 30 | 60 | 90; label: string }[] = [
  { value: 30, label: '30 kun ichida' },
  { value: 60, label: '60 kun ichida' },
  { value: 90, label: '90 kun ichida' },
];

const GROUP_TONE: Record<string, Tone> = {
  '30': 'red',
  '60': 'amber',
  '90': 'blue',
};

export function AdminExpiringContracts() {
  const [filter, setFilter] = useState<DistrictZoneFilterValue>({ districtId: '', zoneId: '' });
  const [range, setRange] = useState<30 | 60 | 90>(90);
  const { data: contracts, isLoading } = useExpiringContracts(filter, range);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <DistrictZoneFilter districtId={filter.districtId} zoneId={filter.zoneId} onChange={setFilter} />
      </div>

      <div className="filterbar">
        <Seg>
          {RANGE_TABS.map((tab) => (
            <SegButton key={tab.value} active={range === tab.value} onClick={() => setRange(tab.value)}>
              {tab.label}
            </SegButton>
          ))}
        </Seg>
      </div>

      <Card>
        {isLoading ? (
          <p style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (contracts ?? []).length === 0 ? (
          <Empty icon={CheckCircle2} title="Hammasi joyida!" text="Tanlangan davrda muddati tugaydigan faol shartnoma yo'q." />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Subyekt</th>
                <th>Hudud</th>
                <th>Tuman / Mahalla</th>
                <th>Tugash sanasi</th>
                <th>Qolgan kun</th>
                <th>To'lov holati</th>
              </tr>
            </thead>
            <tbody>
              {(contracts ?? []).map((c) => (
                <tr key={c._id}>
                  <td>
                    <Link to="/admin/shartnomalar" style={{ fontWeight: 700, color: 'var(--text)' }}>
                      {c.company.name}
                    </Link>
                    <div className="td-sub">
                      STIR: {c.company.stir} · {c.company.director} · {c.company.phones?.join(', ')}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{c.region?.address ?? '-'}</td>
                  <td style={{ color: 'var(--text-2)' }}>
                    {c.district?.name ?? '-'} {c.zone ? `/ ${c.zone.name}` : ''}
                  </td>
                  <td><span className="mono">{formatDate(c.periodTo)}</span></td>
                  <td>
                    <Badge tone={GROUP_TONE[c.group]}>{c.daysLeft} kun</Badge>
                  </td>
                  <td>
                    {c.debt > 0 ? (
                      <span style={{ fontWeight: 700, color: 'var(--red)' }}>Qarzi bor: {formatSom(c.debt)}</span>
                    ) : (
                      <span style={{ color: 'var(--green)' }}>Qarzi yo'q</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
