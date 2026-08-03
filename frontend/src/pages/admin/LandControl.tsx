import { useState } from 'react';
import { useInspections, useCreateInspection } from '../../api/inspections';
import { useViolations, useCreateViolation, useUpdateViolationStatus, downloadViolationAct } from '../../api/violations';
import { useDistricts } from '../../api/references';
import { Card, CardHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../lib/format';
import { VIOLATION_STATUS_LABEL, VIOLATION_STATUS_BADGE, INSPECTION_MODULE_LABEL } from '../../lib/status';
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
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200">
        <TabButton active={tab === 'inspections'} onClick={() => setTab('inspections')} label="Xatlov natijalari" />
        <TabButton
          active={tab === 'violations'}
          onClick={() => setTab('violations')}
          label="Noqonuniy foydalanish reestri"
        />
      </div>
      {tab === 'inspections' ? <InspectionsPanel /> : <ViolationsPanel />}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
        active ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function ModuleSelect({ value, onChange }: { value: string; onChange: (v: InspectionModule) => void }) {
  return (
    <select
      required
      value={value}
      onChange={(e) => onChange(e.target.value as InspectionModule)}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
    >
      <option value="">Modulni tanlang</option>
      <option value="kadastr">Kadastr</option>
      <option value="soliq">Soliq</option>
    </select>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Dala tekshiruvi (xatlov) natijalarini ro'yxatga olish — Kadastr va Soliq</p>
        <button onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light">
          {showForm ? 'Bekor qilish' : '+ Xatlov natijasi qo\'shish'}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Yangi xatlov natijasi" />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {moduleForRole === 'all' ? (
              <ModuleSelect value={form.module} onChange={(v) => setForm({ ...form, module: v })} />
            ) : (
              <input disabled value={INSPECTION_MODULE_LABEL[moduleForRole]} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
            )}
            <input
              required
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Manzil"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <select
              value={form.districtId}
              onChange={(e) => setForm({ ...form, districtId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tuman/shahar (ixtiyoriy)</option>
              {(districts ?? []).map((d: District) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <input
              placeholder="Maydon (m²)"
              type="number"
              value={form.areaM2}
              onChange={(e) => setForm({ ...form, areaM2: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Kenglik (lat)"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Uzunlik (lng)"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Tavsif"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <button
              type="submit"
              disabled={createInspection.isPending}
              className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-60"
            >
              Saqlash
            </button>
          </form>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <DataTable
            columns={[
              { header: 'Sana', render: (r) => formatDate(r.inspectionDate) },
              { header: 'Modul', render: (r) => INSPECTION_MODULE_LABEL[r.module] },
              { header: 'Manzil', render: (r) => r.address },
              { header: 'Maydon', render: (r) => (r.areaM2 ? `${r.areaM2} m²` : '-') },
              { header: 'Tekshiruvchi', render: (r) => (typeof r.inspectorId === 'object' ? r.inspectorId.name : '-') },
              { header: 'Tavsif', render: (r) => r.description || '—' },
            ]}
            rows={inspections ?? []}
            rowKey={(r) => r._id}
          />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                statusFilter === s ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s ? VIOLATION_STATUS_LABEL[s] : 'Barchasi'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light">
          {showForm ? 'Bekor qilish' : '+ Yangi holat qo\'shish'}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Noqonuniy yer foydalanish holatini ro'yxatga olish" />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {moduleForRole === 'all' ? (
              <ModuleSelect value={form.module} onChange={(v) => setForm({ ...form, module: v })} />
            ) : (
              <input disabled value={INSPECTION_MODULE_LABEL[moduleForRole]} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
            )}
            <input
              required
              type="date"
              value={form.detectedDate}
              onChange={(e) => setForm({ ...form, detectedDate: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Manzil"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <select
              value={form.districtId}
              onChange={(e) => setForm({ ...form, districtId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tuman/shahar (ixtiyoriy)</option>
              {(districts ?? []).map((d: District) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <input
              placeholder="Maydon (m²)"
              type="number"
              value={form.areaM2}
              onChange={(e) => setForm({ ...form, areaM2: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Kenglik (lat)"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Uzunlik (lng)"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Tavsif"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <button
              type="submit"
              disabled={createViolation.isPending}
              className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-60"
            >
              Saqlash
            </button>
          </form>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <DataTable
            columns={[
              { header: 'Aniqlangan sana', render: (v) => formatDate(v.detectedDate) },
              { header: 'Modul', render: (v) => INSPECTION_MODULE_LABEL[v.module] },
              { header: 'Manzil', render: (v) => v.address },
              { header: 'Maydon', render: (v) => (v.areaM2 ? `${v.areaM2} m²` : '-') },
              {
                header: 'Holati',
                render: (v) => <StatusBadge label={VIOLATION_STATUS_LABEL[v.status]} className={VIOLATION_STATUS_BADGE[v.status]} />,
              },
              {
                header: 'Amallar',
                render: (v) => (
                  <div className="flex items-center gap-2">
                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(v, e.target.value as ViolationStatus)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="aniqlangan">Aniqlangan</option>
                      <option value="tekshirilmoqda">Tekshirilmoqda</option>
                      <option value="bartaraf_etilgan">Bartaraf etilgan</option>
                    </select>
                    <button
                      onClick={() => downloadViolationAct(v._id)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Dalolatnoma
                    </button>
                  </div>
                ),
              },
            ]}
            rows={violations ?? []}
            rowKey={(v) => v._id}
          />
        )}
      </Card>
    </div>
  );
}
