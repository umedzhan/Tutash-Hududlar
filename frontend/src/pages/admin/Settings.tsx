import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../api/auth';
import { Card, CardHead, Btn } from '../../components/admin/ui';
import { ROLE_LABEL } from '../../lib/status';

const INTEGRATIONS = [
  { name: 'OneID', desc: 'Foydalanuvchi autentifikatsiyasi' },
  { name: 'E-IMZO', desc: 'Shartnomalarni elektron imzolash' },
  { name: 'Soliq (e-ijara)', desc: 'Shartnomalarni soliq tizimiga sinxronlash' },
  { name: 'Click / Payme', desc: "To'lovlarni qabul qilish" },
];

export function AdminSettings() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isStaff = role === 'KADASTR' || role === 'ARXITEKTURA' || role === 'SOLIQ';
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword && !currentPassword) {
      setError('Parolni almashtirish uchun joriy parolni kiriting');
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name,
        phone,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      setCurrentPassword('');
      setNewPassword('');
      setSuccess(true);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Xatolik yuz berdi');
    }
  }

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <Card>
        <CardHead title="Profil" subtitle="Shaxsiy hisob ma'lumotlari" />
        <form onSubmit={handleSubmit} style={{ padding: 22 }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" style={{ marginBottom: 4 }}>
            <div className="field">
              <label>F.I.Sh.</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="as-input" required />
            </div>
            <div className="field">
              <label>Telefon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="as-input" required />
            </div>
          </div>
          <div className="field">
            <label>Rol</label>
            <input disabled value={role ? (ROLE_LABEL[role] ?? role) : ''} className="as-input" style={{ opacity: 0.7 }} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0', paddingTop: 14 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)', marginBottom: 10, letterSpacing: 0.2 }}>
              Parolni almashtirish (ixtiyoriy)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="field">
                <label>Joriy parol</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="as-input"
                  autoComplete="current-password"
                />
              </div>
              <div className="field">
                <label>Yangi parol</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="as-input"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 10 }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: 'var(--green)', marginBottom: 10 }}>Profil saqlandi</p>}

          <Btn type="submit" variant="primary" disabled={updateProfile.isPending}>
            Saqlash
          </Btn>
        </form>
      </Card>

      {!isStaff && (
        <Card>
          <CardHead title="Tashqi integratsiyalar holati" subtitle="Hozircha mock (sinov) rejimida" />
          <div style={{ padding: '4px 22px 8px' }}>
            {INTEGRATIONS.map((i) => (
              <div key={i.name} className="set-row">
                <div>
                  <b>{i.name}</b>
                  <p>{i.desc}</p>
                </div>
                <span className="badge t-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={12} /> Mock rejim
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
