import { useState } from 'react';
import {
  useRegistrationRequests,
  useApproveRegistrationRequest,
  useRejectRegistrationRequest,
  type RegistrationRequestStatus,
} from '../../api/registration';
import { Card, CardHeader } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../lib/format';

const STATUS_LABEL: Record<RegistrationRequestStatus, string> = {
  kutilmoqda: 'Kutilmoqda',
  tasdiqlangan: 'Tasdiqlangan',
  rad_etilgan: 'Rad etilgan',
};

const STATUS_BADGE: Record<RegistrationRequestStatus, string> = {
  kutilmoqda: 'bg-amber-100 text-amber-700',
  tasdiqlangan: 'bg-emerald-100 text-emerald-700',
  rad_etilgan: 'bg-red-100 text-red-700',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-600">Ro'yxatdan o'tish so'rovlari</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RegistrationRequestStatus | '')}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Barchasi</option>
          <option value="kutilmoqda">Kutilmoqda</option>
          <option value="tasdiqlangan">Tasdiqlangan</option>
          <option value="rad_etilgan">Rad etilgan</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <p className="text-slate-400">Yuklanmoqda...</p>
      ) : (requests ?? []).length === 0 ? (
        <Card>
          <p className="p-8 text-center text-sm text-slate-400">So'rovlar topilmadi</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {(requests ?? []).map((r) => (
            <Card key={r._id}>
              <CardHeader
                title={r.companyName}
                action={<StatusBadge label={STATUS_LABEL[r.status]} className={STATUS_BADGE[r.status]} />}
              />
              <div className="grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-3">
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
                <div className="border-t border-slate-100 p-4">
                  {rejectingId === r._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Rad etish sababi..."
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(r._id)}
                          disabled={reject.isPending}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Rad etishni tasdiqlash
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setReason(''); }}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(r._id)}
                        disabled={approve.isPending}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => setRejectingId(r._id)}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Rad etish
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
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}
