import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader } from '../../components/Card';

const INTEGRATIONS = [
  { name: 'OneID', desc: 'Foydalanuvchi autentifikatsiyasi' },
  { name: 'E-IMZO', desc: 'Shartnomalarni elektron imzolash' },
  { name: 'Soliq (e-ijara)', desc: "Shartnomalarni soliq tizimiga sinxronlash" },
  { name: 'Click / Payme', desc: "To'lovlarni qabul qilish" },
];

export function AdminSettings() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Profil" />
        <div className="space-y-2 p-4 text-sm">
          <p><span className="text-slate-400">F.I.Sh.:</span> {user?.name}</p>
          <p><span className="text-slate-400">Telefon:</span> {user?.phone}</p>
          <p><span className="text-slate-400">Rol:</span> {user?.role}</p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Tashqi integratsiyalar holati" />
        <ul className="divide-y divide-slate-100">
          {INTEGRATIONS.map((i) => (
            <li key={i.name} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{i.name}</p>
                <p className="text-xs text-slate-500">{i.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <CheckCircle2 size={14} /> Mock rejim
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
