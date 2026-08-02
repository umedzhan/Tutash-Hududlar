import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Landmark, MapPin, FileText, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { AuthUser } from '../../types';

export function Login() {
  const [phone, setPhone] = useState('+998900000001');
  const [password, setPassword] = useState('parol123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<{ token: string; user: AuthUser }>('/auth/login', { phone, password });
      setAuth(data.token, data.user);
      navigate(data.user.role === 'TADBIRKOR' ? '/tadbirkor' : '/admin');
    } catch {
      setError("Telefon raqam yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#132c60] via-[#0f2657] to-[#0b1d40] p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px, 44px 44px',
          }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
            <Landmark size={22} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">TUTASH HUDUDLAR</p>
            <p className="text-[10px] tracking-wide text-white/45">ELEKTRON PLATFORMASI</p>
          </div>
        </Link>

        <div className="relative space-y-6">
          <h2 className="max-w-sm text-2xl font-semibold leading-snug tracking-tight">
            Surxondaryo viloyatida yer uchastkalarini boshqarish — endi bitta platformada
          </h2>
          <div className="space-y-4 text-sm text-white/70">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <MapPin size={16} />
              </div>
              15 tuman, 700+ mahalla bo'yicha real vaqtda hudud holati
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <FileText size={16} />
              </div>
              4 bosqichli shaffof ariza ko'rib chiqish jarayoni
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck size={16} />
              </div>
              E-IMZO bilan tasdiqlangan elektron shartnomalar
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/35">© {new Date().getFullYear()} Tutash Hududlar</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f2657] text-white">
              <Landmark size={24} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Tutash Hududlar</h1>
            <p className="text-xs text-slate-500">Elektron platformasi</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Tizimga kirish</h2>
            <p className="mt-1 text-sm text-slate-500">Telefon raqam va parolingiz bilan davom eting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Telefon raqam</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
                placeholder="+998 90 000 00 00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-brand-light disabled:opacity-60"
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Hali ro'yxatdan o'tmaganmisiz? <Link to="/royxatdan-otish" className="text-brand-light hover:underline">Ariza yuborish</Link>
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-500">
            <p className="mb-1.5 font-medium text-slate-600">Demo hisoblar:</p>
            <p>Super admin: +998900000001 / parol123</p>
            <p>Kadastr: +998900000002 / parol123</p>
            <p>Tadbirkor: +998900000003 / parol123</p>
            <p>Arxitektura: +998900000004 / parol123</p>
            <p>Soliq: +998900000005 / parol123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
