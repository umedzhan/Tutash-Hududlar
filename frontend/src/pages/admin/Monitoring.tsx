import { useState } from 'react';
import { useMonitoring, useCreateMonitoring } from '../../api/monitoring';
import { useContracts } from '../../api/contracts';
import { Card, CardHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Faol shartnomali hududlarni davriy tekshiruv natijalari</p>
        <button onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light">
          {showForm ? 'Bekor qilish' : '+ Xatlov natijasi qo\'shish'}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Yangi xatlov natijasi" />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
            <select
              required
              value={form.contractId}
              onChange={(e) => setForm({ ...form, contractId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            >
              <option value="">Shartnomani tanlang...</option>
              {faolContracts.map((c) => {
                const hudud = c.hududId as Region;
                return (
                  <option key={c._id} value={c._id}>
                    {c.contractNumber} — {hudud?.address}
                  </option>
                );
              })}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="qoidaga_muvofiq">Qoidaga muvofiq</option>
              <option value="buzilgan">Buzilgan</option>
            </select>
            <input
              placeholder="Izoh"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-light">
              Saqlash
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
              { header: 'Hudud', render: (r) => (r.hududId as Region)?.address },
              { header: 'Tekshiruv sanasi', render: (r) => formatDate(r.inspectionDate) },
              {
                header: 'Holati',
                render: (r) => (
                  <StatusBadge
                    label={r.status === 'qoidaga_muvofiq' ? 'Qoidaga muvofiq' : 'Buzilgan'}
                    className={r.status === 'qoidaga_muvofiq' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                  />
                ),
              },
              { header: 'Tekshiruvchi', render: (r) => (r.inspectorId as { name: string })?.name },
              { header: 'Izoh', render: (r) => r.notes || '—' },
            ]}
            rows={records ?? []}
            rowKey={(r) => r._id}
          />
        )}
      </Card>
    </div>
  );
}
