import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUsers, useCreateUser, useCompanies } from '../../api/users';
import { Card, CardHead, TableWrap, Badge, Btn, Select, CompAvatar } from '../../components/admin/ui';
import { ROLE_LABEL } from '../../lib/status';
import { initials } from '../../lib/format';
import { TONE_VAR, type Tone } from '../../lib/adminTone';

const ROLE_TONE: Record<string, Tone> = {
  SUPER_ADMIN: 'blue',
  KADASTR: 'green',
  ARXITEKTURA: 'violet',
  SOLIQ: 'amber',
  TADBIRKOR: 'cyan',
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
    <div>
      <div className="filterbar">
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} />
            {showForm ? 'Bekor qilish' : 'Yangi foydalanuvchi'}
          </Btn>
        </div>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Yangi foydalanuvchi qo'shish" />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: 22 }}>
            <input required placeholder="F.I.Sh." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="as-input" />
            <input required placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="as-input" />
            <input
              required
              type="password"
              placeholder="Parol"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="as-input"
            />
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="TADBIRKOR">Tadbirkor</option>
              <option value="KADASTR">Kadastr xodimi</option>
              <option value="ARXITEKTURA">Arxitektura xodimi</option>
              <option value="SOLIQ">Soliq xodimi</option>
              <option value="SUPER_ADMIN">Super admin</option>
            </Select>
            {form.role === 'TADBIRKOR' && (
              <Select required value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                <option value="">Kompaniya...</option>
                {(companies ?? []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
            <Btn type="submit" variant="primary">
              Saqlash
            </Btn>
          </form>
        </Card>
      )}

      <Card>
        <CardHead title="Xodimlar ro'yxati" subtitle="Rollar va kirish huquqlari" />
        {isLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Xodim</th>
                <th>Rol</th>
                <th>Kompaniya</th>
                <th>Holati</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="td-comp">
                      <CompAvatar initials={initials(u.name)} tone={ROLE_TONE[u.role] ?? 'blue'} />
                      <div>
                        <b>{u.name}</b>
                        <div className="td-sub">{u.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="role"
                      style={{
                        background: `var(--${TONE_VAR[ROLE_TONE[u.role] ?? 'blue']}-soft)`,
                        color: `var(--${TONE_VAR[ROLE_TONE[u.role] ?? 'blue']})`,
                      }}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{u.companyId?.name ?? '—'}</td>
                  <td>
                    <Badge tone={u.status === 'faol' ? 'green' : 'red'}>{u.status}</Badge>
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
