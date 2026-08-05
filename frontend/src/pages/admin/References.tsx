import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCompanies, useCreateCompany } from '../../api/users';
import { useDistricts, usePurposes, useTariff, useZones } from '../../api/references';
import { Card, CardHead, TableWrap, Btn, Select } from '../../components/admin/ui';
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
    <div>
      <div className="filterbar">
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Kompaniyalar (tadbirkorlik subyektlari) ma'lumotnomasi</span>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} />
            {showForm ? 'Bekor qilish' : 'Yangi kompaniya'}
          </Btn>
        </div>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Yangi kompaniya qo'shish" />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 22 }}>
            <input required placeholder="Nomi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="as-input" />
            <input required placeholder="STIR" value={form.stir} onChange={(e) => setForm({ ...form, stir: e.target.value })} className="as-input" />
            <input required placeholder="Direktor" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} className="as-input" />
            <input required placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="as-input" />
            <Btn type="submit" variant="primary">
              Saqlash
            </Btn>
          </form>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Kompaniyalar" subtitle={`Jami ${companies?.length ?? 0} ta`} />
        {isLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Nomi</th>
                <th>STIR</th>
                <th>Direktor</th>
                <th>Telefon</th>
              </tr>
            </thead>
            <tbody>
              {(companies ?? []).map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td><span className="mono">{c.stir}</span></td>
                  <td style={{ color: 'var(--text-2)' }}>{c.director}</td>
                  <td style={{ color: 'var(--text-2)' }}>{c.phones?.join(', ') ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Tumanlar" />
        {districtsLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Kod</th>
                <th>Ktuman</th>
              </tr>
            </thead>
            <tbody>
              {(districts ?? []).map((d) => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{d.code}</td>
                  <td>{d.coefficient}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHead
          title="Zonalar (mahallalar)"
          subtitle={zones ? `${zones.length} ta` : undefined}
          action={
            <Select value={zoneDistrictFilter} onChange={(e) => setZoneDistrictFilter(e.target.value)}>
              <option value="">Barcha tumanlar</option>
              {(districts ?? []).map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Select>
          }
        />
        {zonesLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <div style={{ maxHeight: 384, overflowY: 'auto' }}>
            <TableWrap>
              <thead>
                <tr>
                  <th>Mahalla nomi</th>
                  <th>Tuman/shahar</th>
                  <th>Kzona</th>
                </tr>
              </thead>
              <tbody>
                {(zones ?? []).map((z) => (
                  <tr key={z._id}>
                    <td>{z.name}</td>
                    <td style={{ color: 'var(--text-2)' }}>{districts?.find((d) => d._id === z.districtId)?.name ?? '-'}</td>
                    <td>{z.coefficient}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Maqsadlar" />
        {purposesLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Kmaqsad</th>
                <th>Mavsumiy ruxsat</th>
              </tr>
            </thead>
            <tbody>
              {(purposes ?? []).map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.coefficient}</td>
                  <td style={{ color: 'var(--text-2)' }}>{p.seasonalAllowed ? 'Ha' : "Yo'q"}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Card>
        <CardHead title="Amaldagi tarif" />
        {tariffLoading ? (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
        ) : tariff ? (
          <div className="kv-grid">
            <div className="kv"><span>Baza narx (Sbaza, yillik)</span><b>{formatSom(tariff.baseRate)}</b></div>
            <div className="kv"><span>Mavsumiy koeffitsiyent</span><b>{tariff.seasonalCoefficient}</b></div>
            <div className="kv"><span>Penya (kuniga)</span><b>{tariff.penaltyRatePerDay}%</b></div>
            <div className="kv"><span>Penya chegarasi</span><b>{tariff.penaltyCapPercent}%</b></div>
            <div className="kv"><span>Min maydon</span><b>{tariff.minAreaM2} m²</b></div>
            <div className="kv"><span>Maks maydon</span><b>{tariff.maxAreaM2} m²</b></div>
          </div>
        ) : (
          <p style={{ padding: 22, color: 'var(--text-3)' }}>Amaldagi tarif topilmadi</p>
        )}
      </Card>
    </div>
  );
}
