import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useRestrictedAreas, useCreateRestrictedArea, useDeleteRestrictedArea, downloadRestrictedAreasExcel } from '../../api/restrictedAreas';
import { DrawControl, type DrawnPolygon } from '../../components/DrawControl';
import { Card, CardHeader } from '../../components/Card';
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
      setError("Avval xaritada zona chegarasini chizing");
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
    <div className="space-y-4">
      <Card>
        <CardHeader title="Muhofaza zonasi chizish" />
        <div className="border-b border-slate-100 p-3">
          <p className="mb-2 text-xs text-slate-500">
            Xaritaning yuqori o'ng burchagidagi vosita yordamida muhofaza zonasi chegarasini chizing.
          </p>
          <div style={{ height: '420px' }} className="overflow-hidden rounded-lg">
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as RestrictedAreaType })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(RESTRICTED_AREA_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            placeholder="Nomi (ixtiyoriy)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <button
            type="submit"
            disabled={createArea.isPending}
            className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-60"
          >
            Saqlash
          </button>
          {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
        </form>
      </Card>

      <Card>
        <CardHeader
          title={`Muhofaza zonalari (${areas?.length ?? 0})`}
          action={
            <button
              onClick={() => downloadRestrictedAreasExcel()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              Excelga yuklash
            </button>
          }
        />
        {isLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {(areas ?? []).map((area) => (
              <div key={area._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_COLOR[area.type] }} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{area.name || RESTRICTED_AREA_TYPE_LABEL[area.type]}</p>
                    <p className="text-xs text-slate-500">{RESTRICTED_AREA_TYPE_LABEL[area.type]}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteArea.mutate(area._id)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  O'chirish
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
