import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateApplication, usePreviewApplication, type PreviewApplicationResult } from '../../api/applications';
import { useDistricts, usePurposes } from '../../api/references';
import { Card, CardHeader } from '../../components/Card';
import { MapView } from '../../components/MapView';
import type { DrawnPolygon } from '../../components/DrawControl';
import { formatSom } from '../../lib/format';

export function TadbirkorNewApplication() {
  const { data: districts } = useDistricts();
  const { data: purposes } = usePurposes();
  const createApplication = useCreateApplication();
  const preview = usePreviewApplication();
  const navigate = useNavigate();

  const [polygon, setPolygon] = useState<DrawnPolygon | null>(null);
  const [purposeId, setPurposeId] = useState('');
  const [usageType, setUsageType] = useState('Doimiy');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [priceResult, setPriceResult] = useState<PreviewApplicationResult | null>(null);

  const districtId = districts?.[0]?._id;

  useEffect(() => {
    if (purposes && purposes.length > 0 && !purposeId) {
      setPurposeId(purposes[0]._id);
    }
  }, [purposes, purposeId]);

  useEffect(() => {
    if (!polygon || !districtId || !purposeId || !from || !to) {
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
          usageType,
          period: { from, to },
        },
        {
          onSuccess: (data) => setPriceResult(data),
          onError: (err) => {
            setPriceResult(null);
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(message ?? "Chizmani tekshirishda xatolik yuz berdi");
          },
        },
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygon, districtId, purposeId, usageType, from, to]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!polygon) {
      setError("Avval xaritada hudud chegarasini chizing");
      return;
    }
    if (!districtId || !purposeId) {
      setError("Tuman yoki maqsad tanlanmagan");
      return;
    }
    if (!priceResult) {
      setError("Chizma hali tekshirilmadi — biroz kuting yoki chizmani qayta chizing");
      return;
    }
    setError(null);
    const purposeName = purposes?.find((p) => p._id === purposeId)?.name ?? '';
    try {
      await createApplication.mutateAsync({
        geometry: { type: 'Polygon', coordinates: polygon.coordinates },
        districtId,
        purposeId,
        purpose: purposeName,
        usageType,
        period: { from, to },
        comment,
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
        <CardHeader title="1. Hudud chegarasini chizing" />
        <div className="border-b border-slate-100 p-3">
          <p className="mb-2 text-xs text-slate-500">
            Xaritaning yuqori o'ng burchagidagi vosita yordamida ijaraga olmoqchi bo'lgan hudud chegarasini ko'pburchak yoki
            to'rtburchak shaklida chizing. Maydon avtomatik hisoblanadi va band/taqiqlangan hududlar bilan tekshiriladi.
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
          <div className="p-4 text-sm">
            <p className="text-slate-500">
              Chizilgan maydon: <span className="font-medium text-slate-800">{polygon.areaM2} m²</span>
            </p>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="2. Ariza ma'lumotlari" />
        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Maqsad</label>
            <select
              value={purposeId}
              onChange={(e) => setPurposeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {(purposes ?? []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Foydalanish turi</label>
            <select value={usageType} onChange={(e) => setUsageType(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option>Doimiy</option>
              <option>Mavsumiy (terrasa)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Boshlanish</label>
              <input required type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Tugash</label>
              <input required type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Qo'shimcha ma'lumot</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={3} placeholder="Izoh kiriting..." />
          </div>

          {preview.isPending && <p className="text-xs text-slate-400">Narx hisoblanmoqda...</p>}

          {priceResult && (
            <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="mb-1 font-medium text-slate-700">3. Dastlabki narx</p>
              <Row label="Oylik ijara" value={formatSom(priceResult.price.monthlyRent)} />
              <Row label="Ekspluatatsiya to'lovi" value={formatSom(priceResult.price.exploitationFee)} />
              <Row label="Muddat" value={`${priceResult.price.months} oy`} />
              <hr className="my-1 border-slate-200" />
              <Row label="Jami" value={formatSom(priceResult.price.total)} bold />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={createApplication.isPending || !priceResult}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-60"
          >
            4. Ariza yuborish
          </button>
        </form>
      </Card>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-slate-800' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
