import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f2657] text-white">
            <Landmark size={24} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Tutash Hududlar</h1>
          <p className="text-xs text-slate-500">Elektron platformasi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Telefon raqam</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              placeholder="+998 90 000 00 00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white transition hover:bg-brand-light disabled:opacity-60"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-1 font-medium text-slate-600">Demo hisoblar:</p>
          <p>Super admin: +998900000001 / parol123</p>
          <p>Kadastr: +998900000002 / parol123</p>
          <p>Tadbirkor: +998900000003 / parol123</p>
          <p>Arxitektura: +998900000004 / parol123</p>
          <p>Soliq: +998900000005 / parol123</p>
        </div>
      </div>
    </div>
  );
}
