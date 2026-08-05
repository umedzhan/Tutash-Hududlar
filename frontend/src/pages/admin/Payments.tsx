import { useState } from 'react';
import { Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePayments, usePaymentStats, useCreatePayment } from '../../api/payments';
import { useContracts } from '../../api/contracts';
import { Card, CardHead, TableWrap, Badge, Btn, Select, Stats, Stat } from '../../components/admin/ui';
import { PAYMENT_STATUS_LABEL } from '../../lib/status';
import { PAYMENT_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, formatSom } from '../../lib/format';
import type { Company, Contract, Region } from '../../types';

export function AdminPayments() {
  const { data: payments, isLoading } = usePayments();
  const { data: stats } = usePaymentStats();
  const { data: contracts } = useContracts();
  const createPayment = useCreatePayment();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contractId: '', amount: 0, dueDate: '', method: 'click' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createPayment.mutateAsync(form);
    setForm({ contractId: '', amount: 0, dueDate: '', method: 'click' });
    setShowForm(false);
  }

  return (
    <div>
      {stats && (
        <Stats>
          <Stat icon={Clock} tone="amber" value={formatSom(stats.kutilayotgan)} label="Kutilayotgan" />
          <Stat icon={CheckCircle2} tone="green" value={formatSom(stats.undirilgan)} label="Undirilgan" />
          <Stat icon={AlertCircle} tone="red" value={formatSom(stats.qarzdorlik)} label="Qarzdorlik" />
        </Stats>
      )}

      <div className="filterbar">
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} />
            {showForm ? 'Bekor qilish' : "Yangi to'lov"}
          </Btn>
        </div>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Yangi to'lov hisobi yaratish" />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 22 }}>
            <Select required value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} style={{ gridColumn: 'span 2' }}>
              <option value="">Shartnomani tanlang...</option>
              {(contracts ?? []).map((c: Contract) => (
                <option key={c._id} value={c._id}>
                  {c.contractNumber} — {(c.companyId as Company)?.name}
                </option>
              ))}
            </Select>
            <input
              required
              type="number"
              placeholder="Summa (so'm)"
              value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="as-input"
            />
            <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="as-input" />
            <Btn type="submit" variant="primary">
              Yaratish
            </Btn>
          </form>
        </Card>
      )}

      <Card>
        <CardHead title="To'lovlar ro'yxati" subtitle={`Jami ${payments?.length ?? 0} ta yozuv`} />
        {isLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Shartnoma</th>
                <th>Kompaniya</th>
                <th>Hudud</th>
                <th style={{ textAlign: 'right' }}>Summa</th>
                <th>Muddat</th>
                <th>Holati</th>
              </tr>
            </thead>
            <tbody>
              {(payments ?? []).map((p) => (
                <tr key={p._id}>
                  <td><span className="mono">{(p.contractId as Contract)?.contractNumber}</span></td>
                  <td>{((p.contractId as Contract)?.companyId as Company)?.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{((p.contractId as Contract)?.hududId as Region)?.address}</td>
                  <td style={{ textAlign: 'right' }}><span className="mono">{formatSom(p.amount)}</span></td>
                  <td><span className="mono">{formatDate(p.dueDate)}</span></td>
                  <td>
                    <Badge tone={PAYMENT_STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
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
