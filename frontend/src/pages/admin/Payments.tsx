import { useState } from 'react';
import { usePayments, usePaymentStats, useCreatePayment } from '../../api/payments';
import { useContracts } from '../../api/contracts';
import { Card, CardHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/StatCard';
import { PAYMENT_STATUS_BADGE, PAYMENT_STATUS_LABEL } from '../../lib/status';
import { formatDate, formatSom } from '../../lib/format';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={<Clock size={20} className="text-amber-600" />} iconBg="bg-amber-50" label="Kutilayotgan" value={formatSom(stats.kutilayotgan)} />
          <StatCard icon={<CheckCircle2 size={20} className="text-emerald-600" />} iconBg="bg-emerald-50" label="Undirilgan" value={formatSom(stats.undirilgan)} />
          <StatCard icon={<AlertCircle size={20} className="text-red-600" />} iconBg="bg-red-50" label="Qarzdorlik" value={formatSom(stats.qarzdorlik)} />
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light">
          {showForm ? 'Bekor qilish' : "+ Yangi to'lov"}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Yangi to'lov hisobi yaratish" />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
            <select
              required
              value={form.contractId}
              onChange={(e) => setForm({ ...form, contractId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            >
              <option value="">Shartnomani tanlang...</option>
              {(contracts ?? []).map((c: Contract) => (
                <option key={c._id} value={c._id}>
                  {c.contractNumber} — {(c.companyId as Company)?.name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              placeholder="Summa (so'm)"
              value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-light">
              Yaratish
            </button>
          </form>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <DataTable
            columns={[
              { header: 'Shartnoma', render: (p) => (p.contractId as Contract)?.contractNumber },
              { header: 'Kompaniya', render: (p) => ((p.contractId as Contract)?.companyId as Company)?.name },
              { header: 'Hudud', render: (p) => ((p.contractId as Contract)?.hududId as Region)?.address },
              { header: 'Summa', render: (p) => formatSom(p.amount) },
              { header: 'Muddat', render: (p) => formatDate(p.dueDate) },
              { header: 'Holati', render: (p) => <StatusBadge label={PAYMENT_STATUS_LABEL[p.status]} className={PAYMENT_STATUS_BADGE[p.status]} /> },
            ]}
            rows={payments ?? []}
            rowKey={(p) => p._id}
          />
        )}
      </Card>
    </div>
  );
}
