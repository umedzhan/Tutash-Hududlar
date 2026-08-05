import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useApplication,
  useDecideStage,
  useUploadLocationScheme,
  useUploadDesignCode,
  downloadApplicationWord,
} from '../../api/applications';
import { useContracts } from '../../api/contracts';
import { Card, CardHead, Badge } from '../../components/admin/ui';
import { MapView } from '../../components/MapView';
import type { DrawnPolygon } from '../../components/DrawControl';
import { APPLICATION_STATUS_LABEL, STAGE_LABEL } from '../../lib/status';
import { APPLICATION_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, formatSom } from '../../lib/format';
import { useAuthStore } from '../../store/authStore';
import type { Company, Region, Role, Stage } from '../../types';

const STAGE_ROLE_MAP: Record<Stage, Role> = {
  cadastre: 'KADASTR',
  architecture: 'ARXITEKTURA',
  tax: 'SOLIQ',
  final: 'SUPER_ADMIN',
};

const STAGE_STATUS_MAP: Record<Stage, string> = {
  cadastre: 'IN_REVIEW_CADASTRE',
  architecture: 'IN_REVIEW_ARCHITECTURE',
  tax: 'IN_REVIEW_TAX',
  final: 'FINAL_APPROVAL',
};

type Decision = 'approve' | 'approve_with_changes' | 'reject' | 'request_info';

function fakeRegion(geometry: { type: 'Polygon'; coordinates: number[][][] }, areaM2: number, id: string): Region {
  return {
    _id: id,
    name: '',
    address: '',
    district: '',
    region: '',
    districtId: null,
    zoneId: null,
    geometry,
    areaM2,
    status: 'bosh',
    currentContractId: null,
  };
}

export function AdminApplicationDetail() {
  const { id } = useParams();
  const { data: application, isLoading } = useApplication(id);
  const { data: contracts } = useContracts();
  const decideStage = useDecideStage();
  const uploadLocationScheme = useUploadLocationScheme();
  const uploadDesignCode = useUploadDesignCode();
  const role = useAuthStore((s) => s.user?.role);

  const [editMode, setEditMode] = useState(false);
  const [editedGeometry, setEditedGeometry] = useState<DrawnPolygon | null>(null);
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading || !application) {
    return <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p>;
  }

  const company = application.companyId as Company;
  const relatedContract = contracts?.find((c) => c.applicationId === application._id);
  const canDecide =
    Boolean(application.currentStage) &&
    role === STAGE_ROLE_MAP[application.currentStage as Stage] &&
    application.status === STAGE_STATUS_MAP[application.currentStage as Stage];
  const noteRequired = pendingDecision === 'reject' || pendingDecision === 'request_info';

  function openDecision(decision: Decision) {
    setPendingDecision(decision);
    setNote('');
    setActionError(null);
    setEditMode(decision === 'approve_with_changes');
    if (decision !== 'approve_with_changes') {
      setEditedGeometry(null);
    }
  }

  async function confirmDecision() {
    if (!id || !application || !application.currentStage || !pendingDecision) return;
    if (noteRequired && !note.trim()) {
      setActionError('Izoh (sabab) majburiy');
      return;
    }
    if (pendingDecision === 'approve_with_changes' && !editedGeometry) {
      setActionError('Avval xaritada yangi chegarani chizing');
      return;
    }
    setActionError(null);
    try {
      await decideStage.mutateAsync({
        id,
        stage: application.currentStage,
        decision: pendingDecision,
        note,
        geometry: editedGeometry ? { type: 'Polygon', coordinates: editedGeometry.coordinates } : undefined,
      });
      setPendingDecision(null);
      setEditMode(false);
      setEditedGeometry(null);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setActionError(message ?? 'Xatolik yuz berdi');
    }
  }

  const tone = APPLICATION_STATUS_TONE[application.status];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHead
            title={application.applicationNumber}
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" className="link" onClick={() => downloadApplicationWord(application._id, application.applicationNumber)}>
                  Wordga yuklash
                </button>
                <Badge tone={tone}>{APPLICATION_STATUS_LABEL[application.status]}</Badge>
              </div>
            }
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" style={{ padding: '18px 22px 22px' }}>
            <Info label="Kompaniya" value={company?.name} />
            <Info label="Manzil / hudud" value={application.address} />
            <Info label="Maqsad" value={application.purpose} />
            <Info label="Foydalanish turi" value={application.usageType} />
            <Info label="Maydon" value={`${application.areaM2} m²`} />
            <Info label="Davr" value={`${formatDate(application.period.from)} — ${formatDate(application.period.to)}`} />
            <Info label="Izoh" value={application.comment || '—'} />
            {application.currentStage && <Info label="Joriy bosqich" value={STAGE_LABEL[application.currentStage]} />}
          </div>
        </Card>

        <Card>
          <CardHead
            title={editMode ? 'Chizmani tahrirlash — yangi chegarani chizing' : 'Hudud chegarasi'}
            action={
              !editMode && canDecide && !pendingDecision ? (
                <button type="button" className="link" onClick={() => openDecision('approve_with_changes')}>
                  Chizmani tahrirlash
                </button>
              ) : undefined
            }
          />
          <div className="map-wrap">
            {editMode ? (
              <MapView regions={[]} height="380px" drawable onPolygonDrawn={setEditedGeometry} onPolygonCleared={() => setEditedGeometry(null)} />
            ) : (
              <MapView regions={[fakeRegion(application.geometry, application.areaM2, application._id)]} height="380px" />
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

        {(role === 'KADASTR' || role === 'ARXITEKTURA' || role === 'SUPER_ADMIN') && (
          <Card>
            <CardHead title="Qo'shimcha hujjatlar" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ padding: 22 }}>
              {(role === 'KADASTR' || role === 'SUPER_ADMIN') && (
                <FileAttachSection
                  label="Joylashuv sxemasi"
                  fileUrl={application.locationSchemeFile}
                  accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                  isPending={uploadLocationScheme.isPending}
                  onUpload={(file) => uploadLocationScheme.mutate({ id: application._id, file })}
                />
              )}
              {(role === 'ARXITEKTURA' || role === 'SUPER_ADMIN') && (
                <FileAttachSection
                  label="Dizayn-kod fayli"
                  fileUrl={application.designCodeFile}
                  accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                  isPending={uploadDesignCode.isPending}
                  onUpload={(file) => uploadDesignCode.mutate({ id: application._id, file })}
                />
              )}
            </div>
          </Card>
        )}

        {application.geometryVersions.length > 1 && (
          <Card>
            <CardHead title="Chizma versiyalari" />
            <div style={{ padding: '6px 22px 14px' }}>
              {application.geometryVersions.map((v) => (
                <div key={v.version} style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      v{v.version} — {v.authorType === 'business' ? 'Tadbirkor' : 'Admin'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatDate(v.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {v.areaM2} m² {v.changeNote ? `— ${v.changeNote}` : ''}
                  </p>
                  {v.acceptedByBusiness !== null && (
                    <p style={{ fontSize: 12, color: v.acceptedByBusiness ? 'var(--green)' : 'var(--red)' }}>
                      {v.acceptedByBusiness ? "Tadbirkor rozi bo'ldi" : "Tadbirkor e'tiroz bildirdi"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {application.priceSnapshot && (
          <Card>
            <CardHead title="Narx dekompozitsiyasi" />
            <div className="kv-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="kv"><span>Sbaza</span><b>{formatSom(application.priceSnapshot.breakdown.sbaza)}</b></div>
              <div className="kv"><span>Maydon</span><b>{application.priceSnapshot.breakdown.m} m²</b></div>
              <div className="kv"><span>Ktuman</span><b>{application.priceSnapshot.breakdown.ktuman}</b></div>
              <div className="kv"><span>Kzona</span><b>{application.priceSnapshot.breakdown.kzona}</b></div>
              <div className="kv"><span>Kmaqsad</span><b>{application.priceSnapshot.breakdown.kmaqsad}</b></div>
              <div className="kv"><span>Kmavsum</span><b>{application.priceSnapshot.breakdown.kmavsum}</b></div>
              <div className="kv"><span>Yillik ijara</span><b>{formatSom(application.priceSnapshot.annualRent)}</b></div>
              <div className="kv"><span>Muddat</span><b>{application.priceSnapshot.months} oy ({application.priceSnapshot.years} marta)</b></div>
              <div className="kv"><span>Jami</span><b style={{ color: 'var(--primary)' }}>{formatSom(application.priceSnapshot.total)}</b></div>
            </div>
          </Card>
        )}

        <Card>
          <CardHead title="Jarayon tarixi" />
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
        <Card>
          <CardHead title="Amallar" />
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canDecide && !pendingDecision && (
              <div style={{ display: 'grid', gap: 8 }}>
                <button type="button" className="btn btn-ok" onClick={() => openDecision('approve')}>
                  Tasdiqlash
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}
                  onClick={() => openDecision('approve_with_changes')}
                >
                  Tuzatish bilan tasdiqlash
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => openDecision('request_info')}>
                  Ma'lumot so'rash
                </button>
                <button type="button" className="btn btn-no" onClick={() => openDecision('reject')}>
                  Rad etish
                </button>
              </div>
            )}

            {canDecide && pendingDecision && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 700 }}>
                  {noteRequired ? 'Sabab (majburiy)' : 'Izoh (ixtiyoriy)'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="as-input"
                  placeholder="Izoh kiriting..."
                />
                {pendingDecision === 'approve_with_changes' && (
                  <p style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
                    {editedGeometry ? `Yangi maydon: ${editedGeometry.areaM2} m²` : 'Chapdagi xaritada yangi chegarani chizing'}
                  </p>
                )}
                {actionError && <p style={{ fontSize: 13, color: 'var(--red)' }}>{actionError}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={confirmDecision} disabled={decideStage.isPending} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Tasdiqlash
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDecision(null);
                      setEditMode(false);
                      setEditedGeometry(null);
                    }}
                    className="btn btn-ghost"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {!canDecide && application.currentStage && (
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                Ariza hozir "{STAGE_LABEL[application.currentStage]}" bosqichida — sizning navbatingiz emas.
              </p>
            )}
            {application.status === 'AWAITING_CONSENT' && (
              <p style={{ fontSize: 13, color: 'var(--amber)' }}>Tadbirkordan chizma bo'yicha rozilik kutilmoqda.</p>
            )}
            {application.status === 'INFO_REQUESTED' && (
              <p style={{ fontSize: 13, color: 'var(--amber)' }}>Tadbirkordan qo'shimcha ma'lumot kutilmoqda.</p>
            )}
            {application.status === 'CONTRACT_GENERATED' && (
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Shartnoma yaratildi. Tadbirkor tomonidan E-IMZO bilan imzolanishi kutilmoqda.</p>
            )}
            {(application.status === 'SIGNED' || application.status === 'ACTIVE') && (
              <p style={{ fontSize: 13, color: 'var(--green)' }}>Shartnoma imzolangan va faollashtirilgan.</p>
            )}
            {application.status === 'REJECTED' && <p style={{ fontSize: 13, color: 'var(--red)' }}>Ariza rad etilgan.</p>}
          </div>
        </Card>

        {relatedContract && (
          <Card>
            <CardHead title="Bog'liq shartnoma" />
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
              <p style={{ fontWeight: 700 }}>{relatedContract.contractNumber}</p>
              <p style={{ color: 'var(--text-2)' }}>Jami: {formatSom(relatedContract.total)}</p>
              {relatedContract.pdfPath && (
                <a href={relatedContract.pdfPath} target="_blank" rel="noreferrer" className="link">
                  PDF yuklab olish
                </a>
              )}
            </div>
          </Card>
        )}

        <Link to="/admin/arizalar" className="link" style={{ display: 'block', textAlign: 'center' }}>
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

function FileAttachSection({
  label,
  fileUrl,
  accept,
  isPending,
  onUpload,
}: {
  label: string;
  fileUrl: string | null;
  accept: string;
  isPending: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <p style={{ marginBottom: 6, fontSize: 11, color: 'var(--text-3)' }}>{label}</p>
      {fileUrl && (
        <a href={fileUrl} target="_blank" rel="noreferrer" className="link" style={{ display: 'block', marginBottom: 8 }}>
          Yuklangan faylni ko'rish
        </a>
      )}
      <input
        type="file"
        accept={accept}
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
        className="as-input"
        style={{ fontSize: 12 }}
      />
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
