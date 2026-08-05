import { Phone } from 'lucide-react';
import { Card, CardHead } from '../../components/admin/ui';

export function TadbirkorRequests() {
  return (
    <Card>
      <CardHead title="Murojaatlarim" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 48, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Murojaatlar bo'limi tez orada ishga tushiriladi.</p>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Hozircha savollaringiz bo'lsa, biz bilan bog'laning:</p>
        <a href="tel:+998712031000" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Phone size={16} /> +998 71 203 10 00
        </a>
      </div>
    </Card>
  );
}
