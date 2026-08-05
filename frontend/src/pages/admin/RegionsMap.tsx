import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRegions, useCreateRegion } from '../../api/regions';
import { useDistricts, useZones } from '../../api/references';
import { MapView } from '../../components/MapView';
import type { DrawnPolygon } from '../../components/DrawControl';
import { Card, CardHead, Badge, Btn, Select } from '../../components/admin/ui';
import { REGION_STATUS_LABEL } from '../../lib/status';
import { REGION_STATUS_TONE, TONE_VAR } from '../../lib/adminTone';
import type { RegionStatus } from '../../types';

const LEGEND: RegionStatus[] = ['band', 'zaxirada', 'bosh', 'muammoli', 'avtoturargoh'];

export function AdminRegionsMap() {
  const { data: regions, isLoading } = useRegions();
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="filterbar">
        <div className="legend" style={{ position: 'static' }}>
          {LEGEND.map((status) => (
            <span key={status}>
              <i style={{ background: `var(--${TONE_VAR[REGION_STATUS_TONE[status]]})` }} />
              {REGION_STATUS_LABEL[status]}
            </span>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} />
            {showForm ? 'Bekor qilish' : 'Yangi hudud'}
          </Btn>
        </div>
      </div>

      {showForm && <NewRegionForm onDone={() => setShowForm(false)} />}

      <Card style={{ marginBottom: 16 }}>
        <div className="map-wrap">
          {isLoading ? <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p> : <MapView regions={regions ?? []} height="480px" />}
        </div>
      </Card>

      <Card>
        <CardHead title="Hududlar ro'yxati" subtitle={`${regions?.length ?? 0} ta hudud topildi`} />
        <div className="hud-grid">
          {(regions ?? []).map((region) => (
            <div key={region._id} className={`hud st-${region.status}`}>
              <div className="hud-top">
                <div>
                  <b>{region.address}</b>
                  <p>{region.district}</p>
                </div>
                <Badge tone={REGION_STATUS_TONE[region.status]}>{REGION_STATUS_LABEL[region.status]}</Badge>
              </div>
              <div className="hud-foot">
                <span>{region.areaM2} m²</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewRegionForm({ onDone }: { onDone: () => void }) {
  const { data: existingRegions } = useRegions();
  const { data: districts } = useDistricts();
  const createRegion = useCreateRegion();
  const [form, setForm] = useState({ address: '', districtId: '', zoneId: '' });
  const [polygon, setPolygon] = useState<DrawnPolygon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: zones } = useZones(form.districtId || undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!polygon) {
      setError("Avval xaritada hudud chegarasini chizing (o'ng yuqoridagi ko'pburchak yoki to'rtburchak vositasi)");
      return;
    }
    if (!form.districtId) {
      setError('Tuman/shaharni tanlang');
      return;
    }
    setError(null);
    const districtName = districts?.find((d) => d._id === form.districtId)?.name ?? '';
    await createRegion.mutateAsync({
      name: form.address,
      address: form.address,
      district: districtName,
      region: 'Surxondaryo viloyati',
      districtId: form.districtId,
      zoneId: form.zoneId || null,
      areaM2: polygon.areaM2,
      geometry: { type: 'Polygon', coordinates: polygon.coordinates },
      status: 'bosh',
    });
    onDone();
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <CardHead title="Yangi hudud qo'shish" />
      <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-2)' }}>
          Xaritaning yuqori o'ng burchagidagi vosita yordamida hudud chegarasini ko'pburchak yoki to'rtburchak shaklida
          chizing. Maydon (m²) chizilgan shakl asosida avtomatik hisoblanadi.
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

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, padding: 22 }}>
        <input
          required
          placeholder="Manzil"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="as-input"
          style={{ gridColumn: 'span 2' }}
        />
        <Select required value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value, zoneId: '' })}>
          <option value="">Tuman/shahar</option>
          {(districts ?? []).map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}>
          <option value="">Mahalla (ixtiyoriy)</option>
          {(zones ?? []).map((z) => (
            <option key={z._id} value={z._id}>
              {z.name}
            </option>
          ))}
        </Select>
        <div className="as-input" style={{ display: 'flex', alignItems: 'center' }}>
          Maydon: <b style={{ marginLeft: 4 }}>{polygon ? `${polygon.areaM2} m²` : '— chizilmagan'}</b>
        </div>
        <Btn type="submit" variant="primary" disabled={createRegion.isPending}>
          Saqlash
        </Btn>
        {error && (
          <p style={{ gridColumn: 'span 6', fontSize: 13, color: 'var(--red)' }}>{error}</p>
        )}
      </form>
    </Card>
  );
}
