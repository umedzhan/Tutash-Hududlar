import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useMyCompany, useUpdateMyCompany } from '../../api/users';
import { useDistricts, useZones } from '../../api/references';
import { Card, CardHead, Select, Btn } from '../../components/admin/ui';
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
  const [cadastreNumber, setCadastreNumber] = useState('');
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
    setCadastreNumber(company.cadastreNumber ?? '');
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
        cadastreNumber,
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
    return <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p>;
  }

  return (
    <Card style={{ maxWidth: 760 }}>
      <CardHead title="Foydalanuvchi profili" subtitle="Korxona va aloqa ma'lumotlari" />
      <form onSubmit={handleSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="field">
            <label>Korxona nomi</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="as-input" />
          </div>
          <div className="field">
            <label>STIR raqami</label>
            <input required value={stir} onChange={(e) => setStir(e.target.value)} className="as-input" />
          </div>
          <div className="field">
            <label>Hudud</label>
            <Select
              value={districtId}
              onChange={(e) => {
                setDistrictId(e.target.value);
                setZoneId('');
              }}
            >
              <option value="">Tanlang</option>
              {(districts ?? []).map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="field">
            <label>Mahalla</label>
            <Select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              <option value="">Tanlang</option>
              {(zones ?? []).map((z) => (
                <option key={z._id} value={z._id}>
                  {z.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="field">
          <label>Tadbirkorlik xududi manzili</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="as-input" placeholder="Ko'cha, uy raqami..." />
        </div>

        <div className="field">
          <label>Kadastr raqami (mavjud bo'lsa)</label>
          <input
            value={cadastreNumber}
            onChange={(e) => setCadastreNumber(e.target.value)}
            className="as-input"
            placeholder="Bino/inshoot joylashgan yer uchastkasi kadastr raqami"
          />
        </div>

        <div className="field">
          <label>Davlat tomonidan ro'yxatga olinganligini tasdiqlovchi hujjat (PDF yoki rasm)</label>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => setRegistrationDocument(e.target.files?.[0] ?? null)}
            className="as-input"
          />
          {company?.registrationDocument && !registrationDocument && (
            <a href={company.registrationDocument} target="_blank" rel="noreferrer" className="link" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Yuklangan hujjatni ko'rish
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="field">
            <label>Rahbar ism familiyasi</label>
            <input required value={director} onChange={(e) => setDirector(e.target.value)} className="as-input" />
          </div>
          <div className="field">
            <label>Elektron pochtasi</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="as-input" />
          </div>
        </div>

        <div className="field">
          <label>Telefon raqami (3 tagacha)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {phones.map((phone, index) => (
              <div key={index} style={{ display: 'flex', gap: 8 }}>
                <input value={phone} onChange={(e) => updatePhone(index, e.target.value)} placeholder="+998 XX XXX XX XX" className="as-input" />
                {phones.length > 1 && (
                  <button type="button" onClick={() => removePhone(index)} className="btn btn-ghost" style={{ padding: '0 14px' }}>
                    ×
                  </button>
                )}
              </div>
            ))}
            {phones.length < 3 && (
              <button type="button" onClick={addPhone} className="link" style={{ alignSelf: 'flex-start' }}>
                + Yana bir raqam qo'shish
              </button>
            )}
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: 'var(--red)' }}>{error}</p>}
        {success && <p style={{ fontSize: 13, color: 'var(--green)' }}>Profil saqlandi</p>}

        <Btn type="submit" variant="primary" disabled={updateCompany.isPending} style={{ alignSelf: 'flex-start' }}>
          Saqlash
        </Btn>
      </form>
    </Card>
  );
}
