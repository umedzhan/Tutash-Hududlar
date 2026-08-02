import { Link } from 'react-router-dom';
import {
  Landmark,
  MapPin,
  FileText,
  ClipboardCheck,
  PenLine,
  CreditCard,
  ShieldCheck,
  Clock,
  Calculator,
  QrCode,
  ArrowRight,
} from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f2657] text-white">
              <Landmark size={20} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900">TUTASH HUDUDLAR</p>
              <p className="text-[10px] tracking-wide text-slate-500">ELEKTRON PLATFORMASI</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
            <a href="#qanday-ishlaydi" className="transition hover:text-brand">Qanday ishlaydi</a>
            <a href="#afzalliklar" className="transition hover:text-brand">Afzalliklar</a>
            <a href="#aloqa" className="transition hover:text-brand">Aloqa</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              Kirish
            </Link>
            <Link to="/royxatdan-otish" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-light">
              Ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #0f2657 1.5px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[-180px] -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-light/20 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
          <span className="rounded-full border border-brand/15 bg-brand/5 px-3 py-1 text-xs font-medium text-brand">
            Surxondaryo viloyati hokimliklari uchun rasmiy platforma
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            Tadbirkorlik uchun yer uchastkalarini <span className="text-brand">onlayn ijaraga oling</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Hududni xaritadan tanlang, ariza yuboring, rasmiy yer solig'i stavkalari asosida shaffof narxni ko'ring va
            elektron shartnomani E-IMZO bilan imzolang — hammasi bitta platformada.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/royxatdan-otish"
              className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white shadow-card transition hover:bg-brand-light"
            >
              Ariza qoldirish uchun ro'yxatdan o'ting
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#qanday-ishlaydi" className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              Qanday ishlashini bilish
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center sm:grid-cols-4">
          <Stat value="15" label="tuman va shahar" />
          <Stat value="700+" label="mahalla (MFY)" />
          <Stat value="4" label="bosqichli ko'rib chiqish" />
          <Stat value="100%" label="onlayn jarayon" />
        </div>
      </section>

      <section id="qanday-ishlaydi" className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Qanday ishlaydi</h2>
        <p className="mb-12 text-center text-sm text-slate-500">Arizadan shartnomagacha — 5 ta oddiy qadam</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Step icon={<MapPin size={18} />} step="1" title="Hudud tanlash" desc="Xaritadan mos hududni tanlang yoki chegarani chizing" />
          <Step icon={<FileText size={18} />} step="2" title="Ariza yuborish" desc="Kerakli ma'lumot va hujjatlarni to'ldirib ariza yuboring" />
          <Step icon={<ClipboardCheck size={18} />} step="3" title="Ko'rib chiqish" desc="Kadastr, arxitektura va soliq bosqichlaridan o'tadi" />
          <Step icon={<PenLine size={18} />} step="4" title="Shartnoma tuzish" desc="Tasdiqlangandan so'ng elektron shartnoma avtomatik tuziladi" />
          <Step icon={<CreditCard size={18} />} step="5" title="To'lov qilish" desc="Onlayn to'lovni amalga oshirib faoliyatingizni boshlang" />
        </div>
      </section>

      <section id="afzalliklar" className="bg-slate-50/60 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Afzalliklari</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={<Calculator size={20} />} title="Shaffof narxlash" desc="Har bir mahalla uchun rasmiy yer solig'i stavkalari asosida avtomatik hisoblanadigan narx" />
            <Feature icon={<Clock size={20} />} title="Tezkor ko'rib chiqish" desc="4 bosqichli ketma-ket tekshiruv — jarayon holatini istalgan vaqtda kuzatib boring" />
            <Feature icon={<QrCode size={20} />} title="Elektron shartnoma" desc="E-IMZO orqali imzolangan, QR kod bilan tasdiqlanadigan rasmiy shartnoma" />
            <Feature icon={<ShieldCheck size={20} />} title="Xavfsiz va nazoratli" desc="Barcha amallar audit jurnaliga yoziladi, hududlar xaritada real vaqtda ko'rinadi" />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#132c60] via-[#0f2657] to-[#0b1d40] px-6 py-16 text-center text-white shadow-card">
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">Bugun ariza qoldiring</h2>
          <p className="mx-auto mb-7 max-w-xl text-sm leading-relaxed text-white/70">
            Ro'yxatdan o'tish so'rovingiz yuboriladi, tasdiqlangach elektron pochtangizga xabar keladi va tizimga kirib
            ariza topshirishingiz mumkin bo'ladi.
          </p>
          <Link
            to="/royxatdan-otish"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-6 py-3 text-sm font-medium text-[#0f2657] transition hover:bg-white/90"
          >
            Ro'yxatdan o'tish
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer id="aloqa" className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-slate-500">
          <p className="mb-1 font-medium text-slate-700">Tutash Hududlar — elektron platformasi</p>
          <p>Surxondaryo viloyati hokimliklari</p>
          <p className="mt-4 text-xs text-slate-400">© {new Date().getFullYear()} Tutash Hududlar. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">{value}</p>
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
    </div>
  );
}

function Step({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">{icon}</div>
      <p className="text-sm font-medium text-slate-800">{step}. {title}</p>
      <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</div>
      <p className="mb-1 text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}
