import { useState } from 'react';
import {
  useRegistrationRequests,
  useApproveRegistrationRequest,
  useRejectRegistrationRequest,
  type RegistrationRequestStatus,
} from '../../api/registration';
import { Card, CardHead, Badge, Select } from '../../components/admin/ui';
import { formatDate } from '../../lib/format';
import type { Tone } from '../../lib/adminTone';

const STATUS_LABEL: Record<RegistrationRequestStatus, string> = {
  kutilmoqda: 'Kutilmoqda',
  tasdiqlangan: 'Tasdiqlangan',
  rad_etilgan: 'Rad etilgan',
};

const STATUS_TONE: Record<RegistrationRequestStatus, Tone> = {
  kutilmoqda: 'amber',
  tasdiqlangan: 'green',
  rad_etilgan: 'red',
};

export function AdminRegistrationRequests() {
  const [statusFilter, setStatusFilter] = useState<RegistrationRequestStatus | ''>('kutilmoqda');
  const { data: requests, isLoading } = useRegistrationRequests(statusFilter || undefined);
  const approve = useApproveRegistrationRequest();
  const reject = useRejectRegistrationRequest();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setError(null);
    try {
      await approve.mutateAsync(id);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Xatolik yuz berdi');
    }
  }

  async function handleReject(id: string) {
    setError(null);
    try {
      await reject.mutateAsync({ id, reason });
      setRejectingId(null);
      setReason('');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Xatolik yuz berdi');
    }
  }

  return (
    <div>
      <div className="filterbar">
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Tadbirkorlarning platformaga kirish so'rovlari</span>
        <div style={{ marginLeft: 'auto' }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RegistrationRequestStatus | '')}>
            <option value="">Barchasi</option>
            <option value="kutilmoqda">Kutilmoqda</option>
            <option value="tasdiqlangan">Tasdiqlangan</option>
            <option value="rad_etilgan">Rad etilgan</option>
          </Select>
        </div>
      </div>

      {error && <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--red)' }}>{error}</p>}

      {isLoading ? (
        <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (requests ?? []).length === 0 ? (
        <Card>
          <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>So'rovlar topilmadi</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(requests ?? []).map((r) => (
            <Card key={r._id}>
              <CardHead title={r.companyName} action={<Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" style={{ padding: 22 }}>
                <Info label="STIR" value={r.stir} />
                <Info label="Rahbar" value={r.director} />
                <Info label="Telefon" value={r.phone} />
                <Info label="Email" value={r.email} />
                <Info label="Hudud" value={typeof r.districtId === 'object' && r.districtId ? r.districtId.name : '-'} />
                <Info label="Mahalla" value={typeof r.zoneId === 'object' && r.zoneId ? r.zoneId.name : '-'} />
                <Info label="Manzil" value={r.address || '-'} />
                <Info label="Yuborilgan sana" value={formatDate(r.createdAt)} />
                {r.status === 'rad_etilgan' && r.rejectionReason && <Info label="Rad etish sababi" value={r.rejectionReason} />}
              </div>

              {r.status === 'kutilmoqda' && (
                <div style={{ borderTop: '1px solid var(--border)', padding: 22 }}>
                  {rejectingId === r._id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Rad etish sababi..."
                        rows={2}
                        className="as-input"
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" className="btn btn-no" disabled={reject.isPending} onClick={() => handleReject(r._id)}>
                          Rad etishni tasdiqlash
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setRejectingId(null);
                            setReason('');
                          }}
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ok" disabled={approve.isPending} onClick={() => handleApprove(r._id)}>
                        ✓ Tasdiqlash
                      </button>
                      <button type="button" className="btn btn-no" onClick={() => setRejectingId(r._id)}>
                        ✕ Rad etish
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text)' }}>{value}</p>
    </div>
  );
}
