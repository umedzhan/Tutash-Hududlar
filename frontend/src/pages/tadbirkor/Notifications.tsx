import { useNotifications, useMarkNotificationRead } from '../../api/notifications';
import { Card, CardHead } from '../../components/admin/ui';
import { formatDate } from '../../lib/format';
import { Bell } from 'lucide-react';

export function TadbirkorNotifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <Card>
      <CardHead title="Xabarnomalar" subtitle={`Jami ${notifications?.length ?? 0} ta`} />
      {isLoading ? (
        <p style={{ padding: 22, color: 'var(--text-3)' }}>Yuklanmoqda...</p>
      ) : (
        <div className="ariza-list">
          {(notifications ?? []).map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead.mutate(n._id)}
              className="ariza"
              style={{ background: n.isRead ? undefined : 'var(--primary-soft)' }}
            >
              <div className="ariza-av c-blue">
                <Bell size={16} />
              </div>
              <div className="ariza-body">
                <b style={{ fontWeight: n.isRead ? 600 : 800 }}>{n.message}</b>
                <p>{formatDate(n.createdAt)}</p>
              </div>
            </div>
          ))}
          {notifications && notifications.length === 0 && (
            <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Xabarnomalar yo'q</p>
          )}
        </div>
      )}
    </Card>
  );
}
