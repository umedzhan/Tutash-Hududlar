import { useState } from 'react';
import { useUsers, useCreateUser, useCompanies } from '../../api/users';
import { Card, CardHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  KADASTR: 'Kadastr xodimi',
  ARXITEKTURA: 'Arxitektura xodimi',
  SOLIQ: 'Soliq xodimi',
  TADBIRKOR: 'Tadbirkor',
};

export function AdminUsers() {
  const { data: users, isLoading } = useUsers();
  const { data: companies } = useCompanies();
  const createUser = useCreateUser();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'TADBIRKOR', companyId: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createUser.mutateAsync({ ...form, companyId: form.role === 'TADBIRKOR' ? form.companyId : undefined });
    setForm({ name: '', phone: '', password: '', role: 'TADBIRKOR', companyId: '' });
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light">
          {showForm ? 'Bekor qilish' : '+ Yangi foydalanuvchi'}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Yangi foydalanuvchi qo'shish" />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
            <input required placeholder="F.I.Sh." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required type="password" placeholder="Parol" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="TADBIRKOR">Tadbirkor</option>
              <option value="KADASTR">Kadastr xodimi</option>
              <option value="ARXITEKTURA">Arxitektura xodimi</option>
              <option value="SOLIQ">Soliq xodimi</option>
              <option value="SUPER_ADMIN">Super admin</option>
            </select>
            {form.role === 'TADBIRKOR' && (
              <select required value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Kompaniya...</option>
                {(companies ?? []).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}
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
              { header: 'F.I.Sh.', render: (u) => u.name },
              { header: 'Telefon', render: (u) => u.phone },
              { header: 'Rol', render: (u) => ROLE_LABEL[u.role] },
              { header: 'Kompaniya', render: (u) => u.companyId?.name ?? '—' },
              { header: 'Holati', render: (u) => <StatusBadge label={u.status} className="bg-slate-100 text-slate-600" /> },
            ]}
            rows={users ?? []}
            rowKey={(u) => u._id}
          />
        )}
      </Card>
    </div>
  );
}
