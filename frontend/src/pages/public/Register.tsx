import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, CheckCircle2 } from 'lucide-react';
import { useDistricts, useZones } from '../../api/references';
import { useSubmitRegistrationRequest } from '../../api/registration';

export function Register() {
  const { data: districts } = useDistricts();
  const [companyName, setCompanyName] = useState('');
  const [stir, setStir] = useState('');
  const [director, setDirector] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: zones } = useZones(districtId || undefined);
  const submit = useSubmitRegistrationRequest();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }
    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }
    try {
      await submit.mutateAsync({
        companyName,
        stir,
        director,
        phone,
        email,
        password,
        districtId: districtId || undefined,
        zoneId: zoneId || undefined,
        address,
      });
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Xatolik yuz berdi');
    }
  }

  if (submit.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
          <h1 className="mb-2 text-lg font-semibold text-slate-900">So'rovingiz qabul qilindi</h1>
          <p className="mb-6 text-sm text-slate-500">
            Admin ma'lumotlaringizni ko'rib chiqadi va tasdiqlagach, <span className="font-medium text-slate-700">{email}</span>{' '}
            elektron pochtangizga xabar yuboriladi. Shundan so'ng {phone} raqami va o'rnatgan parolingiz orqali tizimga
            kirishingiz mumkin bo'ladi.
          </p>
          <Link to="/" className="text-sm text-brand-light hover:underline">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f2657] text-white">
            <Landmark size={24} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Ro'yxatdan o'tish so'rovi</h1>
          <p className="text-xs text-slate-500">Tadbirkorlik subyekti sifatida ariza yuborish uchun</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Korxona nomi">
            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="STIR raqami">
              <input required value={stir} onChange={(e) => setStir(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Rahbar F.I.Sh">
              <input required value={director} onChange={(e) => setDirector(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefon raqam">
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 000 00 00" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Elektron pochta">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hudud">
              <select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setZoneId(''); }} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Tanlang</option>
                {(districts ?? []).map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Mahalla">
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Tanlang</option>
                {(zones ?? []).map((z) => (
                  <option key={z._id} value={z._id}>{z.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Manzil">
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ko'cha, uy raqami..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Parol">
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Parolni tasdiqlash">
              <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </Field>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submit.isPending}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-60"
          >
            {submit.isPending ? 'Yuborilmoqda...' : "So'rov yuborish"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Allaqachon ro'yxatdan o'tganmisiz? <Link to="/login" className="text-brand-light hover:underline">Kirish</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      {children}
    </div>
  );
}
