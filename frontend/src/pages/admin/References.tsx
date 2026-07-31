import { useState } from 'react';
import { useCompanies, useCreateCompany } from '../../api/users';
import { useDistricts, usePurposes, useTariff, useZones } from '../../api/references';
import { Card, CardHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { formatSom } from '../../lib/format';

export function AdminReferences() {
  const { data: companies, isLoading } = useCompanies();
  const { data: districts, isLoading: districtsLoading } = useDistricts();
  const [zoneDistrictFilter, setZoneDistrictFilter] = useState('');
  const { data: zones, isLoading: zonesLoading } = useZones(zoneDistrictFilter || undefined);
  const { data: purposes, isLoading: purposesLoading } = usePurposes();
  const { data: tariff, isLoading: tariffLoading } = useTariff();
  const createCompany = useCreateCompany();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', stir: '', director: '', phone: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createCompany.mutateAsync(form);
    setForm({ name: '', stir: '', director: '', phone: '' });
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-600">Kompaniyalar (tadbirkorlik subyektlari) ma'lumotnomasi</h2>
        <button onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-light">
          {showForm ? 'Bekor qilish' : '+ Yangi kompaniya'}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Yangi kompaniya qo'shish" />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <input required placeholder="Nomi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required placeholder="STIR" value={form.stir} onChange={(e) => setForm({ ...form, stir: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required placeholder="Direktor" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-light sm:col-span-2 lg:col-span-1">
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
              { header: 'Nomi', render: (c) => c.name },
              { header: 'STIR', render: (c) => c.stir },
              { header: 'Direktor', render: (c) => c.director },
              { header: 'Telefon', render: (c) => c.phones?.join(', ') ?? '-' },
            ]}
            rows={companies ?? []}
            rowKey={(c) => c._id}
          />
        )}
      </Card>

      <Card>
        <CardHeader title="Tumanlar" />
        {districtsLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <DataTable
            columns={[
              { header: 'Nomi', render: (d) => d.name },
              { header: 'Kod', render: (d) => d.code },
              { header: 'Ktuman', render: (d) => d.coefficient },
            ]}
            rows={districts ?? []}
            rowKey={(d) => d._id}
          />
        )}
      </Card>

      <Card>
        <CardHeader
          title={`Zonalar (mahallalar)${zones ? ` — ${zones.length}` : ''}`}
          action={
            <select
              value={zoneDistrictFilter}
              onChange={(e) => setZoneDistrictFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="">Barcha tumanlar</option>
              {(districts ?? []).map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          }
        />
        {zonesLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <DataTable
              columns={[
                { header: 'Mahalla nomi', render: (z) => z.name },
                { header: 'Tuman/shahar', render: (z) => districts?.find((d) => d._id === z.districtId)?.name ?? '-' },
                { header: 'Kzona', render: (z) => z.coefficient },
              ]}
              rows={zones ?? []}
              rowKey={(z) => z._id}
            />
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Maqsadlar" />
        {purposesLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : (
          <DataTable
            columns={[
              { header: 'Nomi', render: (p) => p.name },
              { header: 'Kmaqsad', render: (p) => p.coefficient },
              { header: 'Mavsumiy ruxsat', render: (p) => (p.seasonalAllowed ? 'Ha' : "Yo'q") },
            ]}
            rows={purposes ?? []}
            rowKey={(p) => p._id}
          />
        )}
      </Card>

      <Card>
        <CardHeader title="Amaldagi tarif" />
        {tariffLoading ? (
          <p className="p-4 text-slate-400">Yuklanmoqda...</p>
        ) : tariff ? (
          <div className="grid grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-4">
            <TariffField label="Baza narx (Sbaza, yillik)" value={formatSom(tariff.baseRate)} />
            <TariffField label="Ekspluatatsiya" value={formatSom(tariff.exploitationRate)} />
            <TariffField label="Mavsumiy koeffitsiyent" value={String(tariff.seasonalCoefficient)} />
            <TariffField label="Penya (kuniga)" value={`${tariff.penaltyRatePerDay}%`} />
            <TariffField label="Penya chegarasi" value={`${tariff.penaltyCapPercent}%`} />
            <TariffField label="Min maydon" value={`${tariff.minAreaM2} m²`} />
            <TariffField label="Maks maydon" value={`${tariff.maxAreaM2} m²`} />
          </div>
        ) : (
          <p className="p-4 text-slate-400">Amaldagi tarif topilmadi</p>
        )}
      </Card>
    </div>
  );
}

function TariffField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}
