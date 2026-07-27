import { Phone } from 'lucide-react';
import { Card, CardHeader } from '../../components/Card';

export function TadbirkorRequests() {
  return (
    <Card>
      <CardHeader title="Murojaatlarim" />
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-sm text-slate-500">Murojaatlar bo'limi tez orada ishga tushiriladi.</p>
        <p className="text-sm text-slate-500">Hozircha savollaringiz bo'lsa, biz bilan bog'laning:</p>
        <a href="tel:+998712031000" className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light">
          <Phone size={16} /> +998 71 203 10 00
        </a>
      </div>
    </Card>
  );
}
