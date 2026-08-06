import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApplication, useGeometryConsent, useProvideInfo } from '../../api/applications';
import { useContracts } from '../../api/contracts';
import { Card, CardHead, Badge } from '../../components/admin/ui';
import { MapView } from '../../components/MapView';
import { APPLICATION_STATUS_LABEL, STAGE_LABEL } from '../../lib/status';
import { APPLICATION_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, formatSom } from '../../lib/format';
import type { Region } from '../../types';

function fakeRegion(geometry: { type: 'Polygon'; coordinates: number[][][] }, areaM2: number, id: string): Region {
  return { _id: id, name: '', address: '', district: '', region: '', districtId: null, zoneId: null, geometry, areaM2, status: 'bosh', currentContractId: null };
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
    return <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p>;
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

  const tone = APPLICATION_STATUS_TONE[application.status];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHead title={application.applicationNumber} action={<Badge tone={tone}>{APPLICATION_STATUS_LABEL[application.status]}</Badge>} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" style={{ padding: 22 }}>
            <Info label="Manzil / hudud" value={application.address} />
            {application.cadastreNumber && <Info label="Kadastr raqami" value={application.cadastreNumber} />}
            <Info label="Maqsad" value={application.purpose} />
            <Info label="Foydalanish turi" value={application.usageType} />
            <Info label="Maydon" value={application.areaM2 != null ? `${application.areaM2} m²` : 'Hali belgilanmagan'} />
            <Info label="Davr" value={`${formatDate(application.period.from)} — ${formatDate(application.period.to)}`} />
            {application.currentStage && <Info label="Joriy bosqich" value={STAGE_LABEL[application.currentStage]} />}
          </div>
        </Card>

        <Card>
          <CardHead title="Hudud chegarasi" />
          <div className="map-wrap">
            {application.geometry && application.areaM2 != null ? (
              <MapView regions={[fakeRegion(application.geometry, application.areaM2, application._id)]} height="360px" />
            ) : (
              <p style={{ padding: 22, fontSize: 13, color: 'var(--text-2)' }}>
                Hudud chegarasi hali Kadastr xodimi tomonidan belgilanmagan. Belgilangach, rozilik berish uchun sizga xabar keladi.
              </p>
            )}
          </div>
        </Card>

        {application.photos && (
          <Card>
            <CardHead title="Hudud rasmlari (4 tarafdan)" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" style={{ padding: 22 }}>
              <PhotoThumb label="Shimol" src={application.photos.shimol} />
              <PhotoThumb label="Janub" src={application.photos.janub} />
              <PhotoThumb label="Sharq" src={application.photos.sharq} />
              <PhotoThumb label="G'arb" src={application.photos.gharb} />
            </div>
          </Card>
        )}

        {application.priceSnapshot && (
          <Card>
            <CardHead title="Narx dekompozitsiyasi" />
            <div className="kv-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="kv"><span>Yillik ijara</span><b>{formatSom(application.priceSnapshot.annualRent)}</b></div>
              <div className="kv"><span>Muddat</span><b>{application.priceSnapshot.months} oy ({application.priceSnapshot.years} marta)</b></div>
              <div className="kv"><span>Jami</span><b style={{ color: 'var(--primary)' }}>{formatSom(application.priceSnapshot.total)}</b></div>
            </div>
          </Card>
        )}

        <Card>
          <CardHead title="Bosqichlar tarixi" />
          <div style={{ padding: '10px 22px 22px' }}>
            {application.history.map((h, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
                <span style={{ marginTop: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{APPLICATION_STATUS_LABEL[h.status]}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
                    {formatDate(h.date)}
                    {h.comment ? ` — ${h.comment}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {application.status === 'AWAITING_CONSENT' && lastVersion && (
          <Card>
            <CardHead title="Chizmaga kiritilgan o'zgartirish" />
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                Admin hudud chegarasini tahrirladi (yangi maydon: <b style={{ color: 'var(--text)' }}>{lastVersion.areaM2} m²</b>).
              </p>
              {lastVersion.changeNote && <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Izoh: {lastVersion.changeNote}</p>}
              <button type="button" onClick={() => handleConsent(true)} disabled={geometryConsent.isPending} className="btn btn-ok" style={{ justifyContent: 'center' }}>
                Rozilik berish
              </button>
              <textarea value={objectionNote} onChange={(e) => setObjectionNote(e.target.value)} rows={2} placeholder="E'tiroz sababi..." className="as-input" />
              <button type="button" onClick={() => handleConsent(false)} disabled={geometryConsent.isPending} className="btn btn-no" style={{ justifyContent: 'center' }}>
                E'tiroz bildirish
              </button>
              {error && <p style={{ fontSize: 13, color: 'var(--red)' }}>{error}</p>}
            </div>
          </Card>
        )}

        {application.status === 'INFO_REQUESTED' && (
          <Card>
            <CardHead title="Qo'shimcha ma'lumot so'ralgan" />
            <form onSubmit={handleProvideInfo} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={infoComment} onChange={(e) => setInfoComment(e.target.value)} rows={3} placeholder="Javob / qo'shimcha ma'lumot..." className="as-input" />
              <button type="submit" disabled={provideInfo.isPending} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                Yuborish
              </button>
            </form>
          </Card>
        )}

        {relatedContract && (
          <Card>
            <CardHead title="Bog'liq shartnoma" />
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <p style={{ fontWeight: 700 }}>{relatedContract.contractNumber}</p>
              <p style={{ color: 'var(--text-2)' }}>Jami: {formatSom(relatedContract.total)}</p>
              <Link to="/tadbirkor/shartnomalarim" className="link">
                Shartnomalarim bo'limiga o'tish →
              </Link>
            </div>
          </Card>
        )}

        <Link to="/tadbirkor/arizalarim" className="link" style={{ display: 'block', textAlign: 'center' }}>
          ← Ro'yxatga qaytish
        </Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function PhotoThumb({ label, src }: { label: string; src: string }) {
  return (
    <a href={src} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
      <img src={src} alt={label} style={{ height: 96, width: '100%', borderRadius: 12, border: '1px solid var(--border)', objectFit: 'cover' }} />
      <p style={{ marginTop: 4, textAlign: 'center', fontSize: 11, color: 'var(--text-2)' }}>{label}</p>
    </a>
  );
}
