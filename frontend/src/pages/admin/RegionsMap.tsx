import { useState } from 'react';
import { useRegions, useCreateRegion } from '../../api/regions';
import { MapView } from '../../components/MapView';
import type { DrawnPolygon } from '../../components/DrawControl';
import { Card, CardHeader } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { REGION_STATUS_COLOR, REGION_STATUS_LABEL } from '../../lib/status';
import type { RegionStatus } from '../../types';

const LEGEND: RegionStatus[] = ['band', 'zaxirada', 'bosh', 'muammoli', 'avtoturargoh'];

export function AdminRegionsMap() {
  const { data: regions, isLoading } = useRegions();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {LEGEND.map((status) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: REGION_STATUS_COLOR[status] }} />
              {REGION_STATUS_LABEL[status]}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light"
        >
          {showForm ? 'Bekor qilish' : '+ Yangi hudud'}
        </button>
      </div>

      {showForm && <NewRegionForm onDone={() => setShowForm(false)} />}

      <Card>
        <CardHeader title={`Hududlar (${regions?.length ?? 0})`} />
        <div className="p-3">
          {isLoading ? <p className="text-slate-400">Yuklanmoqda...</p> : <MapView regions={regions ?? []} height="480px" />}
        </div>
      </Card>

      <Card>
        <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {(regions ?? []).map((region) => (
            <div key={region._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{region.address}</p>
                <p className="text-xs text-slate-500">{region.district} · {region.areaM2} m²</p>
              </div>
              <StatusBadge
                label={REGION_STATUS_LABEL[region.status]}
                className="bg-slate-100"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewRegionForm({ onDone }: { onDone: () => void }) {
  const { data: existingRegions } = useRegions();
  const createRegion = useCreateRegion();
  const [form, setForm] = useState({ address: '', district: 'Termiz shahri' });
  const [polygon, setPolygon] = useState<DrawnPolygon | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!polygon) {
      setError("Avval xaritada hudud chegarasini chizing (o'ng yuqoridagi ko'pburchak yoki to'rtburchak vositasi)");
      return;
    }
    setError(null);
    await createRegion.mutateAsync({
      name: form.address,
      address: form.address,
      district: form.district,
      region: 'Surxondaryo viloyati',
      areaM2: polygon.areaM2,
      geometry: { type: 'Polygon', coordinates: polygon.coordinates },
      status: 'bosh',
    });
    onDone();
  }

  return (
    <Card>
      <CardHeader title="Yangi hudud qo'shish" />
      <div className="border-b border-slate-100 p-3">
        <p className="mb-2 text-xs text-slate-500">
          Xaritaning yuqori o'ng burchagidagi vosita yordamida hudud chegarasini ko'pburchak yoki to'rtburchak shaklida chizing. Maydon (m²) chizilgan shakl asosida avtomatik hisoblanadi.
        </p>
        <MapView
          regions={existingRegions ?? []}
          height="420px"
          drawable
          onPolygonDrawn={(p) => {
            setPolygon(p);
            setError(null);
          }}
          onPolygonCleared={() => setPolygon(null)}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          required
          placeholder="Manzil"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          required
          placeholder="Tuman"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Maydon: <span className="ml-1 font-medium text-slate-800">{polygon ? `${polygon.areaM2} m²` : '— chizilmagan'}</span>
        </div>
        <button
          type="submit"
          disabled={createRegion.isPending}
          className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-60"
        >
          Saqlash
        </button>
        {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      </form>
    </Card>
  );
}
