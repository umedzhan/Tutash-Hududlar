import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useMyCompany, useUpdateMyCompany } from '../../api/users';
import { useDistricts, useZones } from '../../api/references';
import { Card, CardHeader } from '../../components/Card';
import type { District, Zone } from '../../types';

export function TadbirkorProfile() {
  const { data: company, isLoading } = useMyCompany();
  const { data: districts } = useDistricts();
  const updateCompany = useUpdateMyCompany();

  const [name, setName] = useState('');
  const [stir, setStir] = useState('');
  const [director, setDirector] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [registrationDocument, setRegistrationDocument] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: zones } = useZones(districtId || undefined);

  useEffect(() => {
    if (!company) return;
    setName(company.name);
    setStir(company.stir);
    setDirector(company.director);
    setEmail(company.email ?? '');
    setAddress(company.address ?? '');
    const district = company.districtId;
    const zone = company.zoneId;
    setDistrictId(district && typeof district === 'object' ? (district as District)._id : (district as string) ?? '');
    setZoneId(zone && typeof zone === 'object' ? (zone as Zone)._id : (zone as string) ?? '');
    setPhones(company.phones && company.phones.length > 0 ? company.phones : ['']);
  }, [company]);

  function updatePhone(index: number, value: string) {
    setPhones((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function addPhone() {
    setPhones((prev) => (prev.length < 3 ? [...prev, ''] : prev));
  }

  function removePhone(index: number) {
    setPhones((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const cleanedPhones = phones.map((p) => p.trim()).filter(Boolean);
    if (cleanedPhones.length === 0) {
      setError('Kamida 1 ta telefon raqam kiritilishi kerak');
      return;
    }
    try {
      await updateCompany.mutateAsync({
        name,
        stir,
        director,
        email,
        address,
        districtId,
        zoneId,
        phones: cleanedPhones,
        registrationDocument,
      });
      setRegistrationDocument(null);
      setSuccess(true);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Xatolik yuz berdi');
    }
  }

  if (isLoading) {
    return <p className="text-slate-400">Yuklanmoqda...</p>;
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader title="Foydalanuvchi profili" />
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Korxona nomi">
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </Field>
          <Field label="STIR raqami">
            <input required value={stir} onChange={(e) => setStir(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </Field>
          <Field label="Hudud">
            <select
              value={districtId}
              onChange={(e) => {
                setDistrictId(e.target.value);
                setZoneId('');
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tanlang</option>
              {(districts ?? []).map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mahalla">
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Tanlang</option>
              {(zones ?? []).map((z) => (
                <option key={z._id} value={z._id}>
                  {z.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tadbirkorlik xududi manzili">
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ko'cha, uy raqami..." />
        </Field>

        <Field label="Davlat tomonidan ro'yxatga olinganligini tasdiqlovchi hujjat (PDF yoki rasm)">
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => setRegistrationDocument(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {company?.registrationDocument && !registrationDocument && (
            <a href={company.registrationDocument} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1.5 text-xs text-brand-light hover:underline">
              <FileText size={14} /> Yuklangan hujjatni ko'rish
            </a>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Rahbar ism familiyasi">
            <input required value={director} onChange={(e) => setDirector(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </Field>
          <Field label="Elektron pochtasi">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </Field>
        </div>

        <Field label="Telefon raqami (3 tagacha)">
          <div className="space-y-2">
            {phones.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => updatePhone(index, e.target.value)}
                  placeholder="+998 XX XXX XX XX"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                {phones.length > 1 && (
                  <button type="button" onClick={() => removePhone(index)} className="rounded-lg border border-slate-300 px-3 text-sm text-slate-500 hover:bg-slate-50">
                    &times;
                  </button>
                )}
              </div>
            ))}
            {phones.length < 3 && (
              <button type="button" onClick={addPhone} className="text-xs text-brand-light hover:underline">
                + Yana bir raqam qo'shish
              </button>
            )}
          </div>
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Profil saqlandi</p>}

        <button
          type="submit"
          disabled={updateCompany.isPending}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-60"
        >
          Saqlash
        </button>
      </form>
    </Card>
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
