import { useMyRegions } from '../../api/regions';
import { Card, CardHead } from '../../components/admin/ui';
import { MapView } from '../../components/MapView';

export function TadbirkorMyRegions() {
  const { data: regions, isLoading } = useMyRegions();

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Mening hududlarim" />
        <div className="map-wrap">
          {isLoading ? <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p> : <MapView regions={regions ?? []} height="420px" />}
        </div>
      </Card>

      <Card>
        <div className="hud-grid">
          {(regions ?? []).map((r) => (
            <div key={r._id} className="hud st-band">
              <div className="hud-top">
                <div>
                  <b>{r.address}</b>
                  <p>{r.district}</p>
                </div>
              </div>
              <div className="hud-foot">
                <span>{r.areaM2} m²</span>
              </div>
            </div>
          ))}
        </div>
        {regions && regions.length === 0 && (
          <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Hozircha faol hududingiz yo'q</p>
        )}
      </Card>
    </div>
  );
}
