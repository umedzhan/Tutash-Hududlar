import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, CheckCircle2, CircleDashed, AlertTriangle, FileText, CalendarClock, TrendingUp, Home } from 'lucide-react';
import { useDashboardSummary, useDistrictRanking } from '../../api/reports';
import { useRegions } from '../../api/regions';
import { Card, CardHead, Stats, Stat, Badge, Empty } from '../../components/admin/ui';
import { MapView } from '../../components/MapView';
import { DistrictZoneFilter, type DistrictZoneFilterValue } from '../../components/DistrictZoneFilter';
import { APPLICATION_STATUS_LABEL } from '../../lib/status';
import { APPLICATION_STATUS_TONE } from '../../lib/adminTone';
import { formatDate, formatSom, initials } from '../../lib/format';
import type { Application, Company } from '../../types';

export function AdminDashboard() {
  const [filter, setFilter] = useState<DistrictZoneFilterValue>({ districtId: '', zoneId: '' });
  const { data: summary, isLoading } = useDashboardSummary(filter);
  const { data: regions } = useRegions();
  const { data: ranking } = useDistrictRanking();

  const filteredRegions = useMemo(() => {
    if (!regions) return [];
    return regions.filter((r) => {
      if (filter.zoneId) return r.zoneId === filter.zoneId;
      if (filter.districtId) return r.districtId === filter.districtId;
      return true;
    });
  }, [regions, filter]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <DistrictZoneFilter districtId={filter.districtId} zoneId={filter.zoneId} onChange={setFilter} />
      </div>

      {isLoading || !summary ? (
        <p style={{ color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (
        <>
          <Stats>
            <Stat icon={Map} tone="blue" value={summary.regionStats.jami} unit="ta" label="Jami hududlar" trend="Barchasi" barPct={100} />
            <Stat
              icon={CheckCircle2}
              tone="green"
              value={summary.regionStats.band}
              unit="ta"
              label="Band hududlar"
              trend={`${summary.regionStats.bandPercent}%`}
              barPct={summary.regionStats.bandPercent}
            />
            <Stat
              icon={CircleDashed}
              tone="amber"
              value={summary.regionStats.bosh}
              unit="ta"
              label="Bo'sh hududlar"
              trend={`${summary.regionStats.boshPercent}%`}
              barPct={summary.regionStats.boshPercent}
            />
            <Stat
              icon={AlertTriangle}
              tone="red"
              value={summary.regionStats.muammoli}
              unit="ta"
              label="Muammoli hududlar"
              trend={`${summary.regionStats.muammoliPercent}%`}
              barPct={summary.regionStats.muammoliPercent}
            />
          </Stats>

          <Stats>
            <Stat
              icon={FileText}
              tone="violet"
              value={summary.applicationStats.total}
              unit="ta"
              label="Jami arizalar"
              trend={`Ko'rilmoqda: ${summary.applicationStats.inReview}`}
              barPct={summary.applicationStats.total ? (summary.applicationStats.inReview / summary.applicationStats.total) * 100 : 0}
            />
            <Stat
              icon={CheckCircle2}
              tone="green"
              value={summary.applicationStats.approved}
              unit="ta"
              label="Tasdiqlangan"
              trend={summary.applicationStats.total ? `${Math.round((summary.applicationStats.approved / summary.applicationStats.total) * 100)}%` : '0%'}
              barPct={summary.applicationStats.total ? (summary.applicationStats.approved / summary.applicationStats.total) * 100 : 0}
            />
            <Stat
              icon={AlertTriangle}
              tone="red"
              value={summary.applicationStats.rejected}
              unit="ta"
              label="Rad etilgan"
              trend={summary.applicationStats.total ? `${Math.round((summary.applicationStats.rejected / summary.applicationStats.total) * 100)}%` : '0%'}
              barPct={summary.applicationStats.total ? (summary.applicationStats.rejected / summary.applicationStats.total) * 100 : 0}
            />
            <Stat
              icon={CalendarClock}
              tone="cyan"
              value={summary.expiringSoon30}
              unit="shartnoma"
              label="30 kun ichida tugaydi"
            />
          </Stats>

          <div className="grid-2">
            <Card>
              <CardHead
                title="Hududlar xaritasi"
                subtitle="Termiz shahri bo'yicha joylashuv"
                action={
                  <Link to="/admin/hududlar" className="link">
                    Barchasi →
                  </Link>
                }
              />
              <div className="map-wrap">
                <MapView regions={filteredRegions} height="360px" />
              </div>
            </Card>

            <Card>
              <CardHead
                title="So'nggi arizalar"
                subtitle="Oxirgi kelib tushganlar"
                action={
                  <Link to="/admin/arizalar" className="link">
                    Barchasi →
                  </Link>
                }
              />
              <div className="ariza-list">
                {summary.recentApplications.map((app: Application) => {
                  const company = app.companyId as Company;
                  const tone = APPLICATION_STATUS_TONE[app.status];
                  return (
                    <Link key={app._id} to={`/admin/arizalar/${app._id}`} className="ariza">
                      <div className={`ariza-av c-${tone}`}>{initials(company?.name ?? '?')}</div>
                      <div className="ariza-body">
                        <b>{company?.name}</b>
                        <p>{app.address}</p>
                      </div>
                      <div className="ariza-meta">
                        <Badge tone={tone}>{APPLICATION_STATUS_LABEL[app.status]}</Badge>
                        <time>{formatDate(app.createdAt)}</time>
                      </div>
                    </Link>
                  );
                })}
                {summary.recentApplications.length === 0 && (
                  <p style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Ariza yo'q</p>
                )}
              </div>
            </Card>
          </div>

          <Card style={{ marginBottom: 20 }}>
            <CardHead
              title="Muddati tugayotgan shartnomalar"
              subtitle="Yaqin 30 kun ichida"
              action={
                <Link to="/admin/muddati-tugayotgan-shartnomalar" className="link">
                  Batafsil →
                </Link>
              }
            />
            {summary.expiringSoon30 > 0 ? (
              <p style={{ padding: '16px 22px 22px', fontSize: 13, color: 'var(--text-2)' }}>
                <b style={{ color: 'var(--amber)' }}>{summary.expiringSoon30} ta</b> faol shartnoma yaqin 30 kun ichida
                muddati tugaydi — tadbirkorlar bilan bog'lanish yoki uzaytirish jarayonini boshlash tavsiya etiladi.
              </p>
            ) : (
              <Empty icon={CheckCircle2} title="Hammasi joyida!" text="Yaqin 30 kun ichida muddati tugaydigan faol shartnoma yo'q." />
            )}
          </Card>

          <Stats>
            <Stat icon={CalendarClock} tone="amber" value={formatSom(summary.paymentStats.kutilayotgan)} label="Kutilayotgan to'lovlar" />
            <Stat icon={CheckCircle2} tone="green" value={formatSom(summary.paymentStats.undirilgan)} label="Undirilgan to'lovlar" />
            <Stat icon={AlertTriangle} tone="red" value={formatSom(summary.paymentStats.qarzdorlik)} label="Qarzdorlik" />
          </Stats>

          <div className="grid-2" style={{ marginTop: 4 }}>
            <Card>
              <CardHead title="Eng faol tumanlar" action={<TrendingUp size={16} style={{ color: 'var(--text-3)' }} />} />
              <div className="ariza-list">
                {(ranking?.districts ?? []).slice(0, 5).map((row, idx) => (
                  <div key={row.districtId} className="ariza" style={{ cursor: 'default' }}>
                    <div className="ariza-body">
                      <b>
                        {idx + 1}. {row.districtName}
                      </b>
                    </div>
                    <div className="ariza-meta">
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{row.applicationCount} ariza</span>
                    </div>
                  </div>
                ))}
                {(!ranking || ranking.districts.length === 0) && (
                  <p style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Ma'lumot yo'q</p>
                )}
              </div>
            </Card>
            <Card>
              <CardHead title="Eng band mahallalar" action={<Home size={16} style={{ color: 'var(--text-3)' }} />} />
              <div className="ariza-list">
                {(ranking?.zones ?? []).slice(0, 5).map((row, idx) => (
                  <div key={row.zoneId} className="ariza" style={{ cursor: 'default' }}>
                    <div className="ariza-body">
                      <b>
                        {idx + 1}. {row.zoneName}
                      </b>
                      <p>{row.districtName}</p>
                    </div>
                    <div className="ariza-meta">
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{row.bandPercent}%</span>
                    </div>
                  </div>
                ))}
                {(!ranking || ranking.zones.length === 0) && (
                  <p style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Ma'lumot yo'q</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
