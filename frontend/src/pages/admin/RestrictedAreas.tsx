import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { FileDown } from 'lucide-react';
import { useRestrictedAreas, useCreateRestrictedArea, useDeleteRestrictedArea, downloadRestrictedAreasExcel } from '../../api/restrictedAreas';
import { DrawControl, type DrawnPolygon } from '../../components/DrawControl';
import { Card, CardHead, Btn, Select } from '../../components/admin/ui';
import { RESTRICTED_AREA_TYPE_LABEL } from '../../lib/status';
import type { RestrictedAreaType } from '../../types';

const TERMIZ_CENTER: LatLngExpression = [37.224, 67.278];

const TYPE_COLOR: Record<RestrictedAreaType, string> = {
  red_line: '#dc2626',
  road: '#f97316',
  utility: '#7c3aed',
  sanitation: '#0891b2',
  ecological: '#16a34a',
  historical: '#a16207',
};

const TYPE_ICON: Record<RestrictedAreaType, string> = {
  red_line: '🚧',
  road: '🛤',
  utility: '⚡',
  sanitation: '🚱',
  ecological: '🌳',
  historical: '🏛',
};

function toLatLngs(coordinates: number[][][]): LatLngExpression[] {
  return coordinates[0].map(([lng, lat]) => [lat, lng]);
}

export function AdminRestrictedAreas() {
  const { data: areas, isLoading } = useRestrictedAreas();
  const createArea = useCreateRestrictedArea();
  const deleteArea = useDeleteRestrictedArea();
  const [polygon, setPolygon] = useState<DrawnPolygon | null>(null);
  const [form, setForm] = useState({ type: 'sanitation' as RestrictedAreaType, name: '' });
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!polygon) {
      setError('Avval xaritada zona chegarasini chizing');
      return;
    }
    setError(null);
    await createArea.mutateAsync({
      type: form.type,
      name: form.name,
      geometry: { type: 'Polygon', coordinates: polygon.coordinates },
    });
    setForm({ type: 'sanitation', name: '' });
    setPolygon(null);
  }

  return (
    <div className="grid-2">
      <Card>
        <CardHead title="Muhofaza zonasi chizish" subtitle="Yangi cheklov zonasini xaritada belgilang" />
        <div className="map-wrap">
          <p style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-2)' }}>
            Xaritaning yuqori o'ng burchagidagi vosita yordamida muhofaza zonasi chegarasini chizing.
          </p>
          <div style={{ height: 420, borderRadius: 14, overflow: 'hidden' }}>
            <MapContainer center={TERMIZ_CENTER} zoom={16} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <DrawControl onCreated={setPolygon} onCleared={() => setPolygon(null)} />
              {(areas ?? []).map((area) => (
                <Polygon
                  key={area._id}
                  positions={toLatLngs(area.geometry.coordinates)}
                  pathOptions={{ color: TYPE_COLOR[area.type], fillColor: TYPE_COLOR[area.type], fillOpacity: 0.35, weight: 1.5 }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{area.name || RESTRICTED_AREA_TYPE_LABEL[area.type]}</p>
                      <p>{RESTRICTED_AREA_TYPE_LABEL[area.type]}</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '0 22px 22px' }}>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RestrictedAreaType })}>
            {Object.entries(RESTRICTED_AREA_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <input
            placeholder="Nomi (ixtiyoriy)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="as-input"
            style={{ gridColumn: 'span 2' }}
          />
          <Btn type="submit" variant="primary" disabled={createArea.isPending}>
            Saqlash
          </Btn>
          {error && <p style={{ gridColumn: 'span 4', fontSize: 13, color: 'var(--red)' }}>{error}</p>}
        </form>
      </Card>

      <Card>
        <CardHead
          title="Zonalar ro'yxati"
          subtitle={`${areas?.length ?? 0} ta zona`}
          action={
            <Btn variant="ghost" onClick={() => downloadRestrictedAreasExcel()}>
              <FileDown size={14} />
              Excel
            </Btn>
          }
        />
        {isLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <div style={{ padding: '16px 18px 18px', maxHeight: 460, overflowY: 'auto' }}>
            {(areas ?? []).map((area) => (
              <div key={area._id} className="zone">
                <div className="zone-ic" style={{ background: `${TYPE_COLOR[area.type]}22`, color: TYPE_COLOR[area.type] }}>
                  {TYPE_ICON[area.type]}
                </div>
                <div className="zone-body">
                  <b>{area.name || RESTRICTED_AREA_TYPE_LABEL[area.type]}</b>
                  <p>{RESTRICTED_AREA_TYPE_LABEL[area.type]}</p>
                </div>
                <button
                  type="button"
                  className="link"
                  style={{ color: 'var(--red)' }}
                  onClick={() => deleteArea.mutate(area._id)}
                >
                  O'chirish
                </button>
              </div>
            ))}
            {(areas ?? []).length === 0 && <p style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Zona yo'q</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
