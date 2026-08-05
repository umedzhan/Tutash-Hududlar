import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHead } from '../../components/admin/ui';
import { ROLE_LABEL } from '../../lib/status';

const INTEGRATIONS = [
  { name: 'OneID', desc: 'Foydalanuvchi autentifikatsiyasi' },
  { name: 'E-IMZO', desc: 'Shartnomalarni elektron imzolash' },
  { name: 'Soliq (e-ijara)', desc: 'Shartnomalarni soliq tizimiga sinxronlash' },
  { name: 'Click / Payme', desc: "To'lovlarni qabul qilish" },
];

export function AdminSettings() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <Card>
        <CardHead title="Profil" subtitle="Shaxsiy hisob ma'lumotlari" />
        <div style={{ padding: 22 }}>
          <div className="set-row" style={{ borderTop: 'none' }}>
            <b>F.I.Sh.</b>
            <span className="mono">{user?.name}</span>
          </div>
          <div className="set-row">
            <b>Telefon</b>
            <span className="mono">{user?.phone}</span>
          </div>
          <div className="set-row">
            <b>Rol</b>
            <span>{user ? (ROLE_LABEL[user.role] ?? user.role) : ''}</span>
          </div>
        </div>
      </Card>

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
    </div>
  );
}
