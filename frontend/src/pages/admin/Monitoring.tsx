import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMonitoring, useCreateMonitoring } from '../../api/monitoring';
import { useContracts } from '../../api/contracts';
import { Card, CardHead, TableWrap, Badge, Btn, Select } from '../../components/admin/ui';
import { formatDate } from '../../lib/format';
import type { Region } from '../../types';

export function AdminMonitoring() {
  const { data: records, isLoading } = useMonitoring();
  const { data: contracts } = useContracts();
  const createMonitoring = useCreateMonitoring();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contractId: '', status: 'qoidaga_muvofiq', notes: '' });

  const faolContracts = (contracts ?? []).filter((c) => c.status === 'faol');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const contract = faolContracts.find((c) => c._id === form.contractId);
    if (!contract) return;
    const hudud = contract.hududId as Region;
    await createMonitoring.mutateAsync({
      hududId: hudud._id,
      contractId: contract._id,
      inspectionDate: new Date().toISOString(),
      status: form.status,
      notes: form.notes,
    });
    setForm({ contractId: '', status: 'qoidaga_muvofiq', notes: '' });
    setShowForm(false);
  }

  return (
    <div>
      <div className="filterbar">
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Faol shartnomali hududlarni davriy tekshiruv natijalari</span>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} />
            {showForm ? 'Bekor qilish' : "Xatlov natijasi qo'shish"}
          </Btn>
        </div>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Yangi xatlov natijasi" />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 22 }}>
            <Select required value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} style={{ gridColumn: 'span 2' }}>
              <option value="">Shartnomani tanlang...</option>
              {faolContracts.map((c) => {
                const hudud = c.hududId as Region;
                return (
                  <option key={c._id} value={c._id}>
                    {c.contractNumber} — {hudud?.address}
                  </option>
                );
              })}
            </Select>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="qoidaga_muvofiq">Qoidaga muvofiq</option>
              <option value="buzilgan">Buzilgan</option>
            </Select>
            <input
              placeholder="Izoh"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="as-input"
            />
            <Btn type="submit" variant="primary">
              Saqlash
            </Btn>
          </form>
        </Card>
      )}

      <Card>
        <CardHead title="Xatlov natijalari" subtitle={`Jami ${records?.length ?? 0} ta yozuv`} />
        {isLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Hudud</th>
                <th>Tekshiruv sanasi</th>
                <th>Holati</th>
                <th>Tekshiruvchi</th>
                <th>Izoh</th>
              </tr>
            </thead>
            <tbody>
              {(records ?? []).map((r) => (
                <tr key={r._id}>
                  <td>{(r.hududId as Region)?.address}</td>
                  <td><span className="mono">{formatDate(r.inspectionDate)}</span></td>
                  <td>
                    <Badge tone={r.status === 'qoidaga_muvofiq' ? 'green' : 'red'}>
                      {r.status === 'qoidaga_muvofiq' ? 'Qoidaga muvofiq' : 'Buzilgan'}
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{(r.inspectorId as { name: string })?.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
