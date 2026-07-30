import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApplication, useGeometryConsent, useProvideInfo } from '../../api/applications';
import { useContracts } from '../../api/contracts';
import { Card, CardHeader } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { MapView } from '../../components/MapView';
import { APPLICATION_STATUS_BADGE, APPLICATION_STATUS_LABEL, STAGE_LABEL } from '../../lib/status';
import { formatDate, formatSom } from '../../lib/format';
import type { Region } from '../../types';

function fakeRegion(geometry: { type: 'Polygon'; coordinates: number[][][] }, areaM2: number, id: string): Region {
  return { _id: id, name: '', address: '', district: '', region: '', geometry, areaM2, status: 'bosh', currentContractId: null };
}

export function TadbirkorApplicationDetail() {
  const { id } = useParams();
  const { data: application, isLoading } = useApplication(id);
  const { data: contracts } = useContracts();
  const geometryConsent = useGeometryConsent();
  const provideInfo = useProvideInfo();

  const [objectionNote, setObjectionNote] = useState('');
  const [infoComment, setInfoComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !application) {
    return <p className="text-slate-400">Yuklanmoqda...</p>;
  }

  const relatedContract = contracts?.find((c) => c.applicationId === application._id);
  const lastVersion = application.geometryVersions[application.geometryVersions.length - 1];

  async function handleConsent(accept: boolean) {
    if (!id) return;
    if (!accept && !objectionNote.trim()) {
      setError("E'tiroz sababi kiritilishi kerak");
      return;
    }
    setError(null);
    try {
      await geometryConsent.mutateAsync({ id, accept, note: accept ? '' : objectionNote });
      setObjectionNote('');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Xatolik yuz berdi');
    }
  }

  async function handleProvideInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    await provideInfo.mutateAsync({ id, comment: infoComment });
    setInfoComment('');
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader
            title={application.applicationNumber}
            action={<StatusBadge label={APPLICATION_STATUS_LABEL[application.status]} className={APPLICATION_STATUS_BADGE[application.status]} />}
          />
          <div className="grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-2">
            <Info label="Manzil / hudud" value={application.address} />
            <Info label="Maqsad" value={application.purpose} />
            <Info label="Foydalanish turi" value={application.usageType} />
            <Info label="Maydon" value={`${application.areaM2} m²`} />
            <Info label="Davr" value={`${formatDate(application.period.from)} — ${formatDate(application.period.to)}`} />
            {application.currentStage && <Info label="Joriy bosqich" value={STAGE_LABEL[application.currentStage]} />}
          </div>
        </Card>

        <Card>
          <CardHeader title="Hudud chegarasi" />
          <div className="p-3">
            <MapView regions={[fakeRegion(application.geometry, application.areaM2, application._id)]} height="360px" />
          </div>
        </Card>

        {application.photos && (
          <Card>
            <CardHeader title="Hudud rasmlari (4 tarafdan)" />
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
              <PhotoThumb label="Shimol" src={application.photos.shimol} />
              <PhotoThumb label="Janub" src={application.photos.janub} />
              <PhotoThumb label="Sharq" src={application.photos.sharq} />
              <PhotoThumb label="G'arb" src={application.photos.gharb} />
            </div>
          </Card>
        )}

        {application.priceSnapshot && (
          <Card>
            <CardHeader title="Narx dekompozitsiyasi" />
            <div className="grid grid-cols-2 gap-2 p-4 text-sm sm:grid-cols-3">
              <Info label="Oylik ijara" value={formatSom(application.priceSnapshot.monthlyRent)} />
              <Info label="Ekspluatatsiya" value={formatSom(application.priceSnapshot.exploitationFee)} />
              <Info label="Muddat" value={`${application.priceSnapshot.months} oy`} />
              <Info label="Jami" value={formatSom(application.priceSnapshot.total)} />
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Bosqichlar tarixi" />
          <ul className="space-y-3 p-4">
            {application.history.map((h, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <div>
                  <p className="font-medium text-slate-800">{APPLICATION_STATUS_LABEL[h.status]}</p>
                  <p className="text-xs text-slate-500">{formatDate(h.date)}{h.comment ? ` — ${h.comment}` : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-4">
        {application.status === 'AWAITING_CONSENT' && lastVersion && (
          <Card>
            <CardHeader title="Chizmaga kiritilgan o'zgartirish" />
            <div className="space-y-3 p-4 text-sm">
              <p className="text-slate-600">
                Admin hudud chegarasini tahrirladi (yangi maydon: <span className="font-medium">{lastVersion.areaM2} m²</span>).
              </p>
              {lastVersion.changeNote && <p className="text-xs text-slate-500">Izoh: {lastVersion.changeNote}</p>}
              <button
                onClick={() => handleConsent(true)}
                disabled={geometryConsent.isPending}
                className="w-full rounded-lg bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Rozilik berish
              </button>
              <textarea
                value={objectionNote}
                onChange={(e) => setObjectionNote(e.target.value)}
                rows={2}
                placeholder="E'tiroz sababi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                onClick={() => handleConsent(false)}
                disabled={geometryConsent.isPending}
                className="w-full rounded-lg border border-red-300 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                E'tiroz bildirish
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </Card>
        )}

        {application.status === 'INFO_REQUESTED' && (
          <Card>
            <CardHeader title="Qo'shimcha ma'lumot so'ralgan" />
            <form onSubmit={handleProvideInfo} className="space-y-2 p-4 text-sm">
              <textarea
                value={infoComment}
                onChange={(e) => setInfoComment(e.target.value)}
                rows={3}
                placeholder="Javob / qo'shimcha ma'lumot..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={provideInfo.isPending}
                className="w-full rounded-lg bg-brand py-2 text-sm text-white hover:bg-brand-light disabled:opacity-60"
              >
                Yuborish
              </button>
            </form>
          </Card>
        )}

        {relatedContract && (
          <Card>
            <CardHeader title="Bog'liq shartnoma" />
            <div className="space-y-2 p-4 text-sm">
              <p className="font-medium">{relatedContract.contractNumber}</p>
              <p className="text-slate-500">Jami: {formatSom(relatedContract.total)}</p>
              <Link to="/tadbirkor/shartnomalarim" className="text-brand-light hover:underline">
                Shartnomalarim bo'limiga o'tish →
              </Link>
            </div>
          </Card>
        )}

        <Link to="/tadbirkor/arizalarim" className="block text-center text-sm text-slate-500 hover:text-slate-700">
          &larr; Ro'yxatga qaytish
        </Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}

function PhotoThumb({ label, src }: { label: string; src: string }) {
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block">
      <img src={src} alt={label} className="h-24 w-full rounded-lg border border-slate-200 object-cover" />
      <p className="mt-1 text-center text-xs text-slate-500">{label}</p>
    </a>
  );
}
