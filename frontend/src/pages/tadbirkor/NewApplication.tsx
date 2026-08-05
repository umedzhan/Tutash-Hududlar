import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateApplication, usePreviewApplication, type PreviewApplicationResult } from '../../api/applications';
import { useDistricts, usePurposes, useTariff, useZones } from '../../api/references';
import { Card, CardHead, Select, Btn } from '../../components/admin/ui';
import { MapView } from '../../components/MapView';
import type { DrawnPolygon } from '../../components/DrawControl';
import { formatSom } from '../../lib/format';

// Backenddagi pricing.js formulasi bilan bir xil: yillik_ijara = Sbaza x M x Ktuman x Kzona x Kmaqsad x Kmavsum
// Ijara yiliga bir marta to'lanadi.
function monthsBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months + (end.getDate() > start.getDate() ? 1 : 0));
}

function yearsBetween(months: number) {
  return Math.max(1, Math.ceil(months / 12));
}

export function TadbirkorNewApplication() {
  const { data: districts } = useDistricts();
  const { data: purposes } = usePurposes();
  const { data: tariff } = useTariff();
  const createApplication = useCreateApplication();
  const preview = usePreviewApplication();
  const navigate = useNavigate();

  const [polygon, setPolygon] = useState<DrawnPolygon | null>(null);
  const [districtId, setDistrictId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [purposeId, setPurposeId] = useState('');
  const [usageType, setUsageType] = useState('Doimiy');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [comment, setComment] = useState('');
  const [cadastreNumber, setCadastreNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [priceResult, setPriceResult] = useState<PreviewApplicationResult | null>(null);
  const [calcAreaM2, setCalcAreaM2] = useState('');
  const [photos, setPhotos] = useState<{ shimol: File | null; janub: File | null; sharq: File | null; gharb: File | null }>({
    shimol: null,
    janub: null,
    sharq: null,
    gharb: null,
  });

  const { data: zones } = useZones(districtId);

  const calcResult = (() => {
    const area = Number(calcAreaM2);
    const district = districts?.find((d) => d._id === districtId);
    const zone = zones?.find((z) => z._id === zoneId);
    const purpose = purposes?.find((p) => p._id === purposeId);
    if (!area || area <= 0 || !tariff || !district || !zone || !purpose || !from || !to) return null;
    const months = monthsBetween(from, to);
    const isSeasonal = usageType.toLowerCase().includes('mavsum');
    const kMavsum = isSeasonal ? tariff.seasonalCoefficient : 1;
    const annualRent = Math.round(tariff.baseRate * area * district.coefficient * zone.coefficient * purpose.coefficient * kMavsum);
    const years = yearsBetween(months);
    const total = annualRent * years;
    return { annualRent, months, years, total };
  })();

  useEffect(() => {
    if (districts && districts.length > 0 && !districtId) {
      setDistrictId(districts[0]._id);
    }
  }, [districts, districtId]);

  useEffect(() => {
    if (purposes && purposes.length > 0 && !purposeId) {
      setPurposeId(purposes[0]._id);
    }
  }, [purposes, purposeId]);

  useEffect(() => {
    if (!zones || zones.length === 0) return;
    if (!zoneId || !zones.some((z) => z._id === zoneId)) {
      setZoneId(zones[0]._id);
    }
  }, [zones, zoneId]);

  useEffect(() => {
    if (!polygon || !districtId || !purposeId || !zoneId || !from || !to) {
      setPriceResult(null);
      return;
    }
    const timer = setTimeout(() => {
      setError(null);
      preview.mutate(
        {
          geometry: { type: 'Polygon', coordinates: polygon.coordinates },
          districtId,
          purposeId,
          zoneId,
          usageType,
          period: { from, to },
        },
        {
          onSuccess: (data) => setPriceResult(data),
          onError: (err) => {
            setPriceResult(null);
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(message ?? 'Chizmani tekshirishda xatolik yuz berdi');
          },
        },
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygon, districtId, purposeId, zoneId, usageType, from, to]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!polygon) {
      setError('Avval xaritada hudud chegarasini chizing');
      return;
    }
    if (!districtId || !purposeId || !zoneId) {
      setError('Tuman, mahalla yoki maqsad tanlanmagan');
      return;
    }
    if (!priceResult) {
      setError('Chizma hali tekshirilmadi — biroz kuting yoki chizmani qayta chizing');
      return;
    }
    if (!photos.shimol || !photos.janub || !photos.sharq || !photos.gharb) {
      setError("Hududni 4 tarafdan (shimol, janub, sharq, g'arb) rasmga olib yuklang");
      return;
    }
    setError(null);
    const purposeName = purposes?.find((p) => p._id === purposeId)?.name ?? '';
    try {
      await createApplication.mutateAsync({
        geometry: { type: 'Polygon', coordinates: polygon.coordinates },
        districtId,
        purposeId,
        zoneId,
        purpose: purposeName,
        usageType,
        period: { from, to },
        comment,
        cadastreNumber,
        photos: { shimol: photos.shimol, janub: photos.janub, sharq: photos.sharq, gharb: photos.gharb },
      });
      navigate('/tadbirkor/arizalarim');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Xatolik yuz berdi');
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHead title="1. Hudud chegarasini chizing" />
        <div className="map-wrap">
          <p style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-2)' }}>
            Xaritaning yuqori o'ng burchagidagi vosita yordamida ijaraga olmoqchi bo'lgan hudud chegarasini ko'pburchak
            yoki to'rtburchak shaklida chizing. Maydon avtomatik hisoblanadi va band/taqiqlangan hududlar bilan
            tekshiriladi.
          </p>
          <MapView
            regions={[]}
            height="420px"
            drawable
            onPolygonDrawn={setPolygon}
            onPolygonCleared={() => {
              setPolygon(null);
              setPriceResult(null);
            }}
          />
        </div>
        {polygon && (
          <p style={{ padding: '0 22px 22px', fontSize: 13, color: 'var(--text-2)' }}>
            Chizilgan maydon: <b style={{ color: 'var(--text)' }}>{polygon.areaM2} m²</b>
          </p>
        )}
      </Card>

      <Card>
        <CardHead title="2. Ariza ma'lumotlari" />
        <form onSubmit={handleSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>Tuman/shahar</label>
            <Select value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
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
              {(zones ?? []).map((z) => (
                <option key={z._id} value={z._id}>
                  {z.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="field">
            <label>Kadastr raqami (mavjud bo'lsa)</label>
            <input
              value={cadastreNumber}
              onChange={(e) => setCadastreNumber(e.target.value)}
              placeholder="Tutash hudud tegishli bo'lgan yer uchastkasi kadastr raqami"
              className="as-input"
            />
          </div>
          <div className="field">
            <label>Maqsad</label>
            <Select value={purposeId} onChange={(e) => setPurposeId(e.target.value)}>
              {(purposes ?? []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="field">
            <label>Foydalanish turi</label>
            <Select value={usageType} onChange={(e) => setUsageType(e.target.value)}>
              <option>Doimiy</option>
              <option>Mavsumiy (terrasa)</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="field">
              <label>Boshlanish</label>
              <input required type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="as-input" />
            </div>
            <div className="field">
              <label>Tugash</label>
              <input required type="date" value={to} onChange={(e) => setTo(e.target.value)} className="as-input" />
            </div>
          </div>

          <div style={{ borderRadius: 12, border: '1px dashed var(--border-2)', padding: 14 }}>
            <label style={{ marginBottom: 6, display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)' }}>
              Narx kalkulyatori (taxminiy maydon bo'yicha)
            </label>
            <input
              type="number"
              min="1"
              value={calcAreaM2}
              onChange={(e) => setCalcAreaM2(e.target.value)}
              placeholder="Taxminiy maydon, m²"
              className="as-input"
            />
            {calcAreaM2 && !calcResult && (
              <p style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-3)' }}>
                Mahalla, maqsad va davrni tanlang — narx avtomatik hisoblanadi.
              </p>
            )}
            {calcResult && (
              <div className="kv" style={{ marginTop: 10 }}>
                <Row label="Yillik ijara" value={formatSom(calcResult.annualRent)} />
                <Row label="Muddat" value={`${calcResult.months} oy (${calcResult.years} marta to'lanadi)`} />
                <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                <Row label="Taxminiy jami" value={formatSom(calcResult.total)} bold />
              </div>
            )}
          </div>

          <div className="field">
            <label>Qo'shimcha ma'lumot</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="as-input" rows={3} placeholder="Izoh kiriting..." />
          </div>

          <div style={{ borderRadius: 12, border: '1px dashed var(--border-2)', padding: 14 }}>
            <label style={{ marginBottom: 8, display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)' }}>
              Ijaraga olmoqchi bo'lgan hududni 4 tarafdan rasmga olib yuboring
            </label>
            <div className="grid grid-cols-2 gap-2">
              <PhotoInput label="Shimol" file={photos.shimol} onChange={(f) => setPhotos((p) => ({ ...p, shimol: f }))} />
              <PhotoInput label="Janub" file={photos.janub} onChange={(f) => setPhotos((p) => ({ ...p, janub: f }))} />
              <PhotoInput label="Sharq" file={photos.sharq} onChange={(f) => setPhotos((p) => ({ ...p, sharq: f }))} />
              <PhotoInput label="G'arb" file={photos.gharb} onChange={(f) => setPhotos((p) => ({ ...p, gharb: f }))} />
            </div>
          </div>

          {preview.isPending && <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Narx hisoblanmoqda...</p>}

          {priceResult && (
            <div className="kv">
              <p style={{ marginBottom: 6, fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>3. Aniq narx (chizilgan maydon bo'yicha)</p>
              <Row label="Yillik ijara" value={formatSom(priceResult.price.annualRent)} />
              <Row label="Muddat" value={`${priceResult.price.months} oy (${priceResult.price.years} marta to'lanadi)`} />
              <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
              <Row label="Jami" value={formatSom(priceResult.price.total)} bold />
            </div>
          )}

          {error && <p style={{ fontSize: 13, color: 'var(--red)' }}>{error}</p>}

          <Btn
            type="submit"
            variant="primary"
            disabled={createApplication.isPending || !priceResult || !photos.shimol || !photos.janub || !photos.sharq || !photos.gharb}
            style={{ justifyContent: 'center' }}
          >
            4. Ariza yuborish
          </Btn>
        </form>
      </Card>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: bold ? 800 : 600, color: bold ? 'var(--text)' : 'var(--text-2)' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PhotoInput({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <label
      style={{
        display: 'flex',
        cursor: 'pointer',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 12,
        border: '1px solid var(--border)',
        padding: 10,
        textAlign: 'center',
        fontSize: 11.5,
      }}
    >
      <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      <span style={{ fontWeight: 700, color: 'var(--text-2)' }}>{label}</span>
      <span style={{ color: file ? 'var(--green)' : 'var(--text-3)' }}>{file ? file.name : 'Rasm tanlang'}</span>
    </label>
  );
}
