import { Link } from 'react-router-dom';
import { FileSignature, CreditCard, AlertCircle, FileText, MapPin, ClipboardCheck, PenLine } from 'lucide-react';
import { useMyDashboardSummary } from '../../api/reports';
import { useMyRegions } from '../../api/regions';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHead, Stats, Stat, Badge } from '../../components/admin/ui';
import { MapView } from '../../components/MapView';
import { PAYMENT_STATUS_LABEL } from '../../lib/status';
import { PAYMENT_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, formatSom, daysUntil } from '../../lib/format';
import type { Region } from '../../types';

export function TadbirkorDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: summary, isLoading } = useMyDashboardSummary();
  const { data: regions } = useMyRegions();

  if (isLoading || !summary) {
    return <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Xush kelibsiz!</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>{user?.name}</h2>
      </div>

      <Stats>
        <Stat icon={FileSignature} tone="blue" value={summary.jamiShartnomalar} unit="ta" label="Jami shartnomalar" trend={`Faol: ${summary.faolShartnomalar}`} />
        <Stat icon={CreditCard} tone="green" value={formatSom(summary.jamiTolovlar)} label="Jami to'lovlar" />
        <Stat
          icon={AlertCircle}
          tone={summary.qarzdorlik > 0 ? 'red' : 'green'}
          value={formatSom(summary.qarzdorlik)}
          label="Qarzdorlik"
          trend={summary.qarzdorlik > 0 ? "Muddati o'tgan" : "Qarzdorlik yo'q"}
        />
        <Stat icon={FileText} tone="violet" value={summary.aktivArizalar} unit="ta" label="Aktiv arizalar" />
      </Stats>

      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Card>
          <CardHead
            title="Mening hududlarim"
            action={
              <Link to="/tadbirkor/hududlarim" className="link">
                Xaritada ko'rish →
              </Link>
            }
          />
          <div className="map-wrap">
            <MapView regions={regions ?? []} height="320px" />
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHead
              title="To'lovlarim"
              action={
                <Link to="/tadbirkor/tolovlarim" className="link">
                  Barchasi →
                </Link>
              }
            />
            <div style={{ padding: 22 }}>
              {summary.nextPayment ? (
                <>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Keyingi to'lov</p>
                  <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 18, fontWeight: 800 }}>{formatSom(summary.nextPayment.amount)}</p>
                    <Badge tone="amber">{daysUntil(summary.nextPayment.dueDate)} kun qoldi</Badge>
                  </div>
                  <p style={{ marginBottom: 12, fontSize: 11, color: 'var(--text-3)' }}>To'lov sanasi: {formatDate(summary.nextPayment.dueDate)}</p>
                  <Link to="/tadbirkor/tolovlarim" className="btn btn-primary" style={{ display: 'flex', width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                    To'lov qilish
                  </Link>
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Kutilayotgan to'lov yo'q</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Shartnomalarim" />
            <div className="ariza-list">
              {summary.contracts.slice(0, 3).map((c) => {
                const region = c.hududId as Region;
                return (
                  <div key={c._id} className="ariza" style={{ cursor: 'default' }}>
                    <div className="ariza-body">
                      <b>{c.contractNumber}</b>
                      <p>{region?.address}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <CardHead title="So'nggi to'lovlar" />
        <div className="ariza-list">
          {summary.recentPayments.map((p) => (
            <div key={p._id} className="ariza" style={{ cursor: 'default' }}>
              <div className="ariza-body">
                <b>{formatSom(p.amount)}</b>
                <p>{formatDate(p.dueDate)}</p>
              </div>
              <div className="ariza-meta">
                <Badge tone={PAYMENT_STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <p style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>Xizmatlardan foydalanish bo'yicha qo'llanma</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <GuideStep icon={<MapPin size={18} />} step="1" title="Hudud tanlash" desc="Xaritadan mos hududni tanlang" />
          <GuideStep icon={<FileText size={18} />} step="2" title="Ariza yuborish" desc="Kerakli ma'lumotlarni to'ldirib ariza yuboring" />
          <GuideStep icon={<ClipboardCheck size={18} />} step="3" title="Ko'rib chiqish" desc="Arizangiz ko'rib chiqiladi va natija bildiriladi" />
          <GuideStep icon={<PenLine size={18} />} step="4" title="Shartnoma tuzish" desc="Tasdiqlangandan so'ng elektron shartnoma tuziladi" />
          <GuideStep icon={<CreditCard size={18} />} step="5" title="To'lov qilish" desc="To'lovlarni amalga oshirib faoliyatingizni boshlang" />
        </div>
      </div>
    </div>
  );
}

function GuideStep({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <Card style={{ padding: 16 }}>
      <div
        style={{
          marginBottom: 8,
          display: 'flex',
          height: 32,
          width: 32,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'var(--primary-soft)',
          color: 'var(--primary)',
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: 13, fontWeight: 700 }}>
        {step}. {title}
      </p>
      <p style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{desc}</p>
    </Card>
  );
}
