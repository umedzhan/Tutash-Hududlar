import { ChevronRight } from 'lucide-react';
import { useDistricts, useZones } from '../api/references';

export interface DistrictZoneFilterValue {
  districtId: string;
  zoneId: string;
}

export function DistrictZoneFilter({
  districtId,
  zoneId,
  onChange,
}: {
  districtId: string;
  zoneId: string;
  onChange: (next: DistrictZoneFilterValue) => void;
}) {
  const { data: districts } = useDistricts();
  const { data: zones } = useZones(districtId || undefined);

  const districtName = districts?.find((d) => d._id === districtId)?.name;
  const zoneName = zones?.find((z) => z._id === zoneId)?.name;

  return (
    <div className="filterbar">
      <div className="flex flex-wrap items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
        <button
          type="button"
          onClick={() => onChange({ districtId: '', zoneId: '' })}
          className="link"
          style={{ color: !districtId ? 'var(--text)' : 'var(--primary)', fontWeight: !districtId ? 700 : 700 }}
        >
          Barchasi
        </button>
        {districtName && (
          <>
            <ChevronRight size={14} />
            <button
              type="button"
              onClick={() => onChange({ districtId, zoneId: '' })}
              className="link"
              style={{ color: districtId && !zoneId ? 'var(--text)' : 'var(--primary)' }}
            >
              {districtName}
            </button>
          </>
        )}
        {zoneName && (
          <>
            <ChevronRight size={14} />
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{zoneName}</span>
          </>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        <select
          value={districtId}
          onChange={(e) => onChange({ districtId: e.target.value, zoneId: '' })}
          className="select"
        >
          <option value="">Barcha tumanlar</option>
          {(districts ?? []).map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={zoneId}
          onChange={(e) => onChange({ districtId, zoneId: e.target.value })}
          disabled={!districtId}
          className="select"
          style={{ opacity: districtId ? 1 : 0.5 }}
        >
          <option value="">Barcha mahallalar</option>
          {(zones ?? []).map((z) => (
            <option key={z._id} value={z._id}>
              {z.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
