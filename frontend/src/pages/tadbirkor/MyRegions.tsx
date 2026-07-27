import { useMyRegions } from '../../api/regions';
import { Card, CardHeader } from '../../components/Card';
import { MapView } from '../../components/MapView';

export function TadbirkorMyRegions() {
  const { data: regions, isLoading } = useMyRegions();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Mening hududlarim" />
        <div className="p-3">
          {isLoading ? <p className="text-slate-400">Yuklanmoqda...</p> : <MapView regions={regions ?? []} height="420px" />}
        </div>
      </Card>

      <Card>
        <div className="divide-y divide-slate-100">
          {(regions ?? []).map((r) => (
            <div key={r._id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{r.address}</p>
                <p className="text-xs text-slate-500">{r.district}</p>
              </div>
              <span className="text-slate-600">{r.areaM2} m²</span>
            </div>
          ))}
          {regions && regions.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-400">Hozircha faol hududingiz yo'q</p>}
        </div>
      </Card>
    </div>
  );
}
