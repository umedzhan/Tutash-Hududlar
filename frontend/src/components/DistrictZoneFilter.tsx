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
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <button
          onClick={() => onChange({ districtId: '', zoneId: '' })}
          className={`hover:text-brand ${!districtId ? 'font-medium text-slate-800' : ''}`}
        >
          Barchasi
        </button>
        {districtName && (
          <>
            <ChevronRight size={14} />
            <button
              onClick={() => onChange({ districtId, zoneId: '' })}
              className={`hover:text-brand ${districtId && !zoneId ? 'font-medium text-slate-800' : ''}`}
            >
              {districtName}
            </button>
          </>
        )}
        {zoneName && (
          <>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-800">{zoneName}</span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <select
          value={districtId}
          onChange={(e) => onChange({ districtId: e.target.value, zoneId: '' })}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
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
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
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
