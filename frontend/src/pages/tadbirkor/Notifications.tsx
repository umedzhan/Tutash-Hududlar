import { useNotifications, useMarkNotificationRead } from '../../api/notifications';
import { Card } from '../../components/Card';
import { formatDate } from '../../lib/format';
import { Bell } from 'lucide-react';

export function TadbirkorNotifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <Card>
      {isLoading ? (
        <p className="p-4 text-slate-400">Yuklanmoqda...</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {(notifications ?? []).map((n) => (
            <li
              key={n._id}
              onClick={() => !n.isRead && markRead.mutate(n._id)}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 ${n.isRead ? '' : 'bg-blue-50/50'}`}
            >
              <div className="mt-0.5 text-brand-light"><Bell size={16} /></div>
              <div>
                <p className={`text-sm ${n.isRead ? 'text-slate-600' : 'font-medium text-slate-900'}`}>{n.message}</p>
                <p className="text-xs text-slate-400">{formatDate(n.createdAt)}</p>
              </div>
            </li>
          ))}
          {notifications && notifications.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">Xabarnomalar yo'q</p>
          )}
        </ul>
      )}
    </Card>
  );
}
