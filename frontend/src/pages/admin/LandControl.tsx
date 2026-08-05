import { useState } from 'react';
import { Plus, FileDown, FileText } from 'lucide-react';
import { useInspections, useCreateInspection, downloadInspectionsExcel } from '../../api/inspections';
import {
  useViolations,
  useCreateViolation,
  useUpdateViolationStatus,
  downloadViolationAct,
  downloadViolationWord,
  downloadViolationsExcel,
} from '../../api/violations';
import { useDistricts } from '../../api/references';
import { Card, CardHead, TableWrap, Badge, Btn, Select, Seg, SegButton } from '../../components/admin/ui';
import { formatDate } from '../../lib/format';
import { VIOLATION_STATUS_LABEL, INSPECTION_MODULE_LABEL } from '../../lib/status';
import { VIOLATION_STATUS_TONE } from '../../lib/adminTone';
import { useAuthStore } from '../../store/authStore';
import type { District, InspectionModule, LandViolation, ViolationStatus } from '../../types';

type Tab = 'inspections' | 'violations';

function useModuleForRole(): InspectionModule | 'all' {
  const role = useAuthStore((s) => s.user?.role);
  if (role === 'KADASTR') return 'kadastr';
  if (role === 'SOLIQ') return 'soliq';
  return 'all';
}

export function AdminLandControl() {
  const [tab, setTab] = useState<Tab>('inspections');

  return (
    <div>
      <div className="seg" style={{ display: 'inline-flex', marginBottom: 16 }}>
        <button type="button" className={tab === 'inspections' ? 'on' : ''} onClick={() => setTab('inspections')}>
          Xatlov natijalari
        </button>
        <button type="button" className={tab === 'violations' ? 'on' : ''} onClick={() => setTab('violations')}>
          Noqonuniy foydalanish reestri
        </button>
      </div>
      {tab === 'inspections' ? <InspectionsPanel /> : <ViolationsPanel />}
    </div>
  );
}

function ModuleSelect({ value, onChange }: { value: string; onChange: (v: InspectionModule) => void }) {
  return (
    <Select required value={value} onChange={(e) => onChange(e.target.value as InspectionModule)}>
      <option value="">Modulni tanlang</option>
      <option value="kadastr">Kadastr</option>
      <option value="soliq">Soliq</option>
    </Select>
  );
}

function InspectionsPanel() {
  const moduleForRole = useModuleForRole();
  const { data: inspections, isLoading } = useInspections();
  const { data: districts } = useDistricts();
  const createInspection = useCreateInspection();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    module: moduleForRole === 'all' ? '' : moduleForRole,
    inspectionDate: new Date().toISOString().slice(0, 10),
    address: '',
    districtId: '',
    areaM2: '',
    lat: '',
    lng: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createInspection.mutateAsync({
      module: form.module as InspectionModule,
      inspectionDate: form.inspectionDate,
      address: form.address,
      districtId: form.districtId || undefined,
      areaM2: form.areaM2 ? Number(form.areaM2) : undefined,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      description: form.description,
      files,
    });
    setForm({ ...form, address: '', areaM2: '', lat: '', lng: '', description: '' });
    setFiles([]);
    setShowForm(false);
  }

  return (
    <div>
      <div className="filterbar">
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Dala tekshiruvi (xatlov) natijalarini ro'yxatga olish — Kadastr va Soliq
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <a href="/dalolatnoma" target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            <FileText size={14} />
            Rasmiy dalolatnoma blankasi
          </a>
          <Btn variant="ghost" onClick={() => downloadInspectionsExcel(moduleForRole !== 'all' ? { module: moduleForRole } : undefined)}>
            <FileDown size={14} />
            Excelga yuklash
          </Btn>
          <Btn variant="primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} />
            {showForm ? 'Bekor qilish' : "Xatlov natijasi qo'shish"}
          </Btn>
        </div>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Yangi xatlov natijasi" />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 22 }}>
            {moduleForRole === 'all' ? (
              <ModuleSelect value={form.module} onChange={(v) => setForm({ ...form, module: v })} />
            ) : (
              <input disabled value={INSPECTION_MODULE_LABEL[moduleForRole]} className="as-input" style={{ opacity: 0.7 }} />
            )}
            <input
              required
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
              className="as-input"
            />
            <input
              required
              placeholder="Manzil"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="as-input"
              style={{ gridColumn: 'span 2' }}
            />
            <Select value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })}>
              <option value="">Tuman/shahar (ixtiyoriy)</option>
              {(districts ?? []).map((d: District) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <input
              placeholder="Maydon (m²)"
              type="number"
              value={form.areaM2}
              onChange={(e) => setForm({ ...form, areaM2: e.target.value })}
              className="as-input"
            />
            <input placeholder="Kenglik (lat)" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="as-input" />
            <input placeholder="Uzunlik (lng)" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="as-input" />
            <input
              placeholder="Tavsif"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="as-input"
              style={{ gridColumn: 'span 2' }}
            />
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="as-input"
              style={{ gridColumn: 'span 2' }}
            />
            <Btn type="submit" variant="primary" disabled={createInspection.isPending}>
              Saqlash
            </Btn>
          </form>
        </Card>
      )}

      <Card>
        <CardHead title="Tekshiruvlar jurnali" subtitle={`Jami ${inspections?.length ?? 0} ta yozuv`} />
        {isLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Sana</th>
                <th>Modul</th>
                <th>Manzil</th>
                <th>Maydon</th>
                <th>Tekshiruvchi</th>
                <th>Tavsif</th>
              </tr>
            </thead>
            <tbody>
              {(inspections ?? []).map((r) => (
                <tr key={r._id}>
                  <td><span className="mono">{formatDate(r.inspectionDate)}</span></td>
                  <td>{INSPECTION_MODULE_LABEL[r.module]}</td>
                  <td>{r.address}</td>
                  <td>{r.areaM2 ? `${r.areaM2} m²` : '-'}</td>
                  <td style={{ color: 'var(--text-2)' }}>{typeof r.inspectorId === 'object' ? r.inspectorId.name : '-'}</td>
                  <td style={{ color: 'var(--text-2)' }}>{r.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}

const STATUS_FILTERS: (ViolationStatus | '')[] = ['', 'aniqlangan', 'tekshirilmoqda', 'bartaraf_etilgan'];

function ViolationsPanel() {
  const moduleForRole = useModuleForRole();
  const [statusFilter, setStatusFilter] = useState<ViolationStatus | ''>('');
  const { data: violations, isLoading } = useViolations(statusFilter ? { status: statusFilter } : undefined);
  const { data: districts } = useDistricts();
  const createViolation = useCreateViolation();
  const updateStatus = useUpdateViolationStatus();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    module: moduleForRole === 'all' ? '' : moduleForRole,
    detectedDate: new Date().toISOString().slice(0, 10),
    address: '',
    districtId: '',
    areaM2: '',
    lat: '',
    lng: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createViolation.mutateAsync({
      module: form.module as InspectionModule,
      detectedDate: form.detectedDate,
      address: form.address,
      districtId: form.districtId || undefined,
      areaM2: form.areaM2 ? Number(form.areaM2) : undefined,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      description: form.description,
      files,
    });
    setForm({ ...form, address: '', areaM2: '', lat: '', lng: '', description: '' });
    setFiles([]);
    setShowForm(false);
  }

  async function handleStatusChange(v: LandViolation, status: ViolationStatus) {
    let resolutionNote = v.resolutionNote;
    if (status === 'bartaraf_etilgan') {
      resolutionNote = window.prompt("Bartaraf etilishi bo'yicha izoh:", v.resolutionNote || '') ?? v.resolutionNote;
    }
    await updateStatus.mutateAsync({ id: v._id, status, resolutionNote });
  }

  return (
    <div>
      <div className="filterbar">
        <Seg>
          {STATUS_FILTERS.map((s) => (
            <SegButton key={s || 'all'} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s ? VIOLATION_STATUS_LABEL[s] : 'Barchasi'}
            </SegButton>
          ))}
        </Seg>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Btn
            variant="ghost"
            onClick={() => downloadViolationsExcel({ status: statusFilter || undefined, module: moduleForRole !== 'all' ? moduleForRole : undefined })}
          >
            <FileDown size={14} />
            Excelga yuklash
          </Btn>
          <Btn variant="primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} />
            {showForm ? 'Bekor qilish' : 'Yangi holat qo\'shish'}
          </Btn>
        </div>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Noqonuniy yer foydalanish holatini ro'yxatga olish" />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 22 }}>
            {moduleForRole === 'all' ? (
              <ModuleSelect value={form.module} onChange={(v) => setForm({ ...form, module: v })} />
            ) : (
              <input disabled value={INSPECTION_MODULE_LABEL[moduleForRole]} className="as-input" style={{ opacity: 0.7 }} />
            )}
            <input
              required
              type="date"
              value={form.detectedDate}
              onChange={(e) => setForm({ ...form, detectedDate: e.target.value })}
              className="as-input"
            />
            <input
              required
              placeholder="Manzil"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="as-input"
              style={{ gridColumn: 'span 2' }}
            />
            <Select value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })}>
              <option value="">Tuman/shahar (ixtiyoriy)</option>
              {(districts ?? []).map((d: District) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <input
              placeholder="Maydon (m²)"
              type="number"
              value={form.areaM2}
              onChange={(e) => setForm({ ...form, areaM2: e.target.value })}
              className="as-input"
            />
            <input placeholder="Kenglik (lat)" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="as-input" />
            <input placeholder="Uzunlik (lng)" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="as-input" />
            <input
              placeholder="Tavsif"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="as-input"
              style={{ gridColumn: 'span 2' }}
            />
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="as-input"
              style={{ gridColumn: 'span 2' }}
            />
            <Btn type="submit" variant="primary" disabled={createViolation.isPending}>
              Saqlash
            </Btn>
          </form>
        </Card>
      )}

      <Card>
        <CardHead title="Noqonuniy foydalanish reestri" subtitle={`Jami ${violations?.length ?? 0} ta yozuv`} />
        {isLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Aniqlangan sana</th>
                <th>Modul</th>
                <th>Manzil</th>
                <th>Maydon</th>
                <th>Holati</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {(violations ?? []).map((v) => (
                <tr key={v._id}>
                  <td><span className="mono">{formatDate(v.detectedDate)}</span></td>
                  <td>{INSPECTION_MODULE_LABEL[v.module]}</td>
                  <td>{v.address}</td>
                  <td>{v.areaM2 ? `${v.areaM2} m²` : '-'}</td>
                  <td>
                    <Badge tone={VIOLATION_STATUS_TONE[v.status]}>{VIOLATION_STATUS_LABEL[v.status]}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Select value={v.status} onChange={(e) => handleStatusChange(v, e.target.value as ViolationStatus)} style={{ padding: '6px 28px 6px 10px', fontSize: 11.5 }}>
                        <option value="aniqlangan">Aniqlangan</option>
                        <option value="tekshirilmoqda">Tekshirilmoqda</option>
                        <option value="bartaraf_etilgan">Bartaraf etilgan</option>
                      </Select>
                      <Btn variant="ghost" style={{ padding: '6px 10px', fontSize: 11.5 }} onClick={() => downloadViolationAct(v._id)}>
                        Dalolatnoma (PDF)
                      </Btn>
                      <Btn variant="ghost" style={{ padding: '6px 10px', fontSize: 11.5 }} onClick={() => downloadViolationWord(v._id)}>
                        Word
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
