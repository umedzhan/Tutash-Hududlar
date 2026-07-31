import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApplication, useDecideStage } from '../../api/applications';
import { useContracts } from '../../api/contracts';
import { Card, CardHeader } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { MapView } from '../../components/MapView';
import type { DrawnPolygon } from '../../components/DrawControl';
import { APPLICATION_STATUS_BADGE, APPLICATION_STATUS_LABEL, STAGE_LABEL } from '../../lib/status';
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
  const role = useAuthStore((s) => s.user?.role);

  const [editMode, setEditMode] = useState(false);
  const [editedGeometry, setEditedGeometry] = useState<DrawnPolygon | null>(null);
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading || !application) {
    return <p className="text-slate-400">Yuklanmoqda...</p>;
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
      setActionError("Avval xaritada yangi chegarani chizing");
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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader
            title={application.applicationNumber}
            action={<StatusBadge label={APPLICATION_STATUS_LABEL[application.status]} className={APPLICATION_STATUS_BADGE[application.status]} />}
          />
          <div className="grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-2">
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
          <CardHeader
            title={editMode ? "Chizmani tahrirlash — yangi chegarani chizing" : 'Hudud chegarasi'}
            action={
              !editMode && canDecide && !pendingDecision && (
                <button
                  onClick={() => openDecision('approve_with_changes')}
                  className="text-xs text-brand-light hover:underline"
                >
                  Chizmani tahrirlash
                </button>
              )
            }
          />
          <div className="p-3">
            {editMode ? (
              <MapView
                regions={[]}
                height="380px"
                drawable
                onPolygonDrawn={setEditedGeometry}
                onPolygonCleared={() => setEditedGeometry(null)}
              />
            ) : (
              <MapView regions={[fakeRegion(application.geometry, application.areaM2, application._id)]} height="380px" />
            )}
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

        {application.geometryVersions.length > 1 && (
          <Card>
            <CardHeader title="Chizma versiyalari" />
            <ul className="divide-y divide-slate-100">
              {application.geometryVersions.map((v) => (
                <li key={v.version} className="p-4 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      v{v.version} — {v.authorType === 'business' ? 'Tadbirkor' : 'Admin'}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(v.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{v.areaM2} m² {v.changeNote ? `— ${v.changeNote}` : ''}</p>
                  {v.acceptedByBusiness !== null && (
                    <p className={`text-xs ${v.acceptedByBusiness ? 'text-emerald-600' : 'text-red-600'}`}>
                      {v.acceptedByBusiness ? "Tadbirkor rozi bo'ldi" : 'Tadbirkor e\'tiroz bildirdi'}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {application.priceSnapshot && (
          <Card>
            <CardHeader title="Narx dekompozitsiyasi" />
            <div className="grid grid-cols-2 gap-2 p-4 text-sm sm:grid-cols-3">
              <Info label="Sbaza" value={formatSom(application.priceSnapshot.breakdown.sbaza)} />
              <Info label="Maydon" value={`${application.priceSnapshot.breakdown.m} m²`} />
              <Info label="Ktuman" value={String(application.priceSnapshot.breakdown.ktuman)} />
              <Info label="Kzona" value={String(application.priceSnapshot.breakdown.kzona)} />
              <Info label="Kmaqsad" value={String(application.priceSnapshot.breakdown.kmaqsad)} />
              <Info label="Kmavsum" value={String(application.priceSnapshot.breakdown.kmavsum)} />
              <Info label="Yillik ijara" value={formatSom(application.priceSnapshot.annualRent)} />
              <Info label="Muddat" value={`${application.priceSnapshot.months} oy (${application.priceSnapshot.years} marta to'lanadi)`} />
              <Info label="Jami" value={formatSom(application.priceSnapshot.total)} />
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Jarayon tarixi" />
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
        <Card>
          <CardHeader title="Amallar" />
          <div className="space-y-3 p-4">
            {canDecide && !pendingDecision && (
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => openDecision('approve')} className="rounded-lg bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700">
                  Tasdiqlash
                </button>
                <button onClick={() => openDecision('approve_with_changes')} className="rounded-lg bg-amber-500 py-2 text-sm text-white hover:bg-amber-600">
                  Tuzatish bilan tasdiqlash
                </button>
                <button onClick={() => openDecision('request_info')} className="rounded-lg border border-slate-300 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Ma'lumot so'rash
                </button>
                <button onClick={() => openDecision('reject')} className="rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-700">
                  Rad etish
                </button>
              </div>
            )}

            {canDecide && pendingDecision && (
              <div className="space-y-2">
                <label className="block text-xs text-slate-500">
                  {noteRequired ? 'Sabab (majburiy)' : 'Izoh (ixtiyoriy)'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Izoh kiriting..."
                />
                {pendingDecision === 'approve_with_changes' && (
                  <p className="text-xs text-slate-500">
                    {editedGeometry ? `Yangi maydon: ${editedGeometry.areaM2} m²` : "Chapdagi xaritada yangi chegarani chizing"}
                  </p>
                )}
                {actionError && <p className="text-sm text-red-600">{actionError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={confirmDecision}
                    disabled={decideStage.isPending}
                    className="flex-1 rounded-lg bg-brand py-2 text-sm text-white hover:bg-brand-light disabled:opacity-60"
                  >
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => {
                      setPendingDecision(null);
                      setEditMode(false);
                      setEditedGeometry(null);
                    }}
                    className="flex-1 rounded-lg border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {!canDecide && application.currentStage && (
              <p className="text-sm text-slate-500">
                Ariza hozir "{STAGE_LABEL[application.currentStage]}" bosqichida — sizning navbatingiz emas.
              </p>
            )}
            {application.status === 'AWAITING_CONSENT' && (
              <p className="text-sm text-amber-600">Tadbirkordan chizma bo'yicha rozilik kutilmoqda.</p>
            )}
            {application.status === 'INFO_REQUESTED' && (
              <p className="text-sm text-orange-600">Tadbirkordan qo'shimcha ma'lumot kutilmoqda.</p>
            )}
            {(application.status === 'CONTRACT_GENERATED') && (
              <p className="text-sm text-slate-500">Shartnoma yaratildi. Tadbirkor tomonidan E-IMZO bilan imzolanishi kutilmoqda.</p>
            )}
            {(application.status === 'SIGNED' || application.status === 'ACTIVE') && (
              <p className="text-sm text-emerald-600">Shartnoma imzolangan va faollashtirilgan.</p>
            )}
            {application.status === 'REJECTED' && <p className="text-sm text-red-600">Ariza rad etilgan.</p>}
          </div>
        </Card>

        {relatedContract && (
          <Card>
            <CardHeader title="Bog'liq shartnoma" />
            <div className="space-y-1 p-4 text-sm">
              <p className="font-medium">{relatedContract.contractNumber}</p>
              <p className="text-slate-500">Jami: {formatSom(relatedContract.total)}</p>
              {relatedContract.pdfPath && (
                <a href={relatedContract.pdfPath} target="_blank" rel="noreferrer" className="text-brand-light">
                  PDF yuklab olish
                </a>
              )}
            </div>
          </Card>
        )}

        <Link to="/admin/arizalar" className="block text-center text-sm text-slate-500 hover:text-slate-700">
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
