import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';
import { LandingNav, Logo } from './LandingNav';
import { HERO_ART_SVG, STEP1_ART_SVG, STEP2_ART_SVG, STEP3_ART_SVG, STEP4_ART_SVG } from './landingArt';

const STATS = [
  { count: 412, label: 'Viloyat reyestridagi hududlar' },
  { count: 238, label: 'Faol ijara shartnomalari' },
  { count: 57, label: 'Shu oyda berilgan guvohnomalar' },
  { count: 98, label: '% arizalar onlayn ko\'rib chiqiladi' },
];

const STEPS = [
  {
    num: '1',
    title: 'Ijara uchun ariza berish',
    text: "Tadbirkor elektron ariza topshiradi, unda hudud tavsifi, faoliyat turi va obyektning fotosuratlari bo'ladi.",
    art: STEP1_ART_SVG,
  },
  {
    num: '2',
    title: 'Tekshirish va o\'lchash',
    text: 'Vakolatli organ xodimi ariza beruvchi bilan bog\'lanadi, joyga tashrif buyuradi, maydonni o\'lchaydi va fotofiksatsiya o\'tkazadi.',
    art: STEP2_ART_SVG,
  },
  {
    num: '3',
    title: 'Kelishuv va shartnoma',
    text: 'Vakolatli organ xodimi ma\'lumotlarni tekshiradi. Agar kelishilgan bo\'lsa, tadbirkor kelishish va to\'lov uchun shartnoma hamda hisob-fakturani oladi.',
    art: STEP3_ART_SVG,
  },
  {
    num: '4',
    title: 'To\'lov va dalolatnomani topshirish',
    text: 'To\'lov tasdiqlangandan so\'ng, Tutash Hudud hududidan foydalanish huquqini ro\'yxatdan o\'tkazish to\'g\'risidagi guvohnoma beriladi.',
    art: STEP4_ART_SVG,
  },
];

const FAQ = [
  {
    q: "Kimlar tutash hududdan foydalanish uchun ijara shartnomasini olishi mumkin?",
    a: (
      <>
        <p>O'zbekiston Respublikasi Vazirlar Mahkamasining 2025-yil 31-iyuldagi 478-son qaroriga muvofiq, quyidagi tadbirkorlar ijara shartnomasini olish huquqiga ega:</p>
        <ul>
          <li>umumiy ovqatlanish sohasida faoliyat yuritayotganlar;</li>
          <li>chakana savdo bilan shug'ullanuvchi tadbirkorlar;</li>
          <li>xizmat ko'rsatish sohasidagi tadbirkorlar;</li>
          <li>o'ziga tegishli yoki qonuniy foydalanilayotgan bino yoki yer uchastkasiga ega bo'lganlar;</li>
          <li>obyektiga tutash yoki undan 5 metrgacha bo'lgan umumiy foydalanishdagi yerdan foydalanishni istagan tadbirkorlar.</li>
        </ul>
      </>
    ),
  },
  {
    q: 'Bu yerlarni auksiondan olish kerakmi?',
    a: (
      <>
        <p>Yo'q, auksion talab etilmaydi.</p>
        <p>Qarorga ko'ra, agar maydon: sizning obyektingizga tutash bo'lsa yoki undan 5 metrdan ortiq bo'lmagan masofada joylashgan bo'lsa, u holda ushbu maydon to'g'ridan-to'g'ri ijara asosida beriladi.</p>
      </>
    ),
  },
  {
    q: 'Ijara qancha muddatga beriladi?',
    a: (
      <>
        <p>Ijara shartnomasi 1 kalendar yilga tuziladi.</p>
        <p>Agar qoidabuzarlik bo'lmasa, keyingi yillarga uzaytirish huquqi saqlanadi.</p>
      </>
    ),
  },
  {
    q: 'Ijara to\'lovi qancha bo\'ladi?',
    a: <p>Har 1 kv.m uchun yer solig'i stavkasining 3 baravarigacha miqdorda belgilanadi. Soliq imtiyozlarisiz hisoblanadi.</p>,
  },
  {
    q: "Kafe oldiga naves, stol-stul yoki yengil konstruksiya qo'ysam bo'ladimi?",
    a: (
      <>
        <p>Ha, lekin qat'iy shartlar bilan:</p>
        <p>Faqat vaqtinchalik, yengil konstruksiyalar mahalliy hokimlik tomonidan tasdiqlanadigan "dizayn-kod"ga muvofiq. Kapital qurilish qat'iyan taqiqlanadi.</p>
      </>
    ),
  },
  {
    q: 'Qanday joylarda umuman ruxsat berilmaydi?',
    a: (
      <>
        <p>Qat'iyan taqiqlangan:</p>
        <ul>
          <li>madaniy meros obyektlari va qo'riqlanadigan tabiiy hududlar fasadi oldida;</li>
          <li>bino va inshootlarning yong'inga qarshi oraliqlarida;</li>
          <li>kommunikatsiyalariga zarar yetkazadigan (himoya) zonalarda;</li>
          <li>chorrahalarga 15 metrdan yaqinroq joylarda;</li>
          <li>piyodalar o'tish joylarida;</li>
          <li>velosiped yo'laklarida;</li>
          <li>yo'l qatnov qismining xavfli burilishlarida;</li>
          <li>loaqal bir yo'nalishdagi ko'rinish masofasi yuz metrdan kam bo'lgan yo'l do'ngliklari yaqinida;</li>
          <li>qatnov qismining kesishmalarida va kesishayotgan qatnov qismi chetiga o'n besh metrdan kam masofada (uch tomonlama kesishmalarda (chorrahalarda) yondan tutashgan yo'lning sidirg'a chiziq yoki ajratuvchi bo'lak bilan ajratilgan qarama-qarshi tomoni bundan mustasno).</li>
        </ul>
      </>
    ),
  },
];

export function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsRefs = useRef<(HTMLDetailsElement | null)[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-on');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.querySelectorAll('.lp-rv').forEach((el) => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          counterObserver.unobserve(entry.target);
          const el = entry.target as HTMLElement;
          const end = Number(el.dataset.count);
          const t0 = performance.now();
          function step(now: number) {
            const p = Math.min((now - t0) / 1600, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(end * ease).toLocaleString('uz');
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );
    root.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  function handleFaqToggle(index: number) {
    const current = detailsRefs.current[index];
    if (current?.open) {
      detailsRefs.current.forEach((el, i) => {
        if (i !== index && el) el.open = false;
      });
    }
  }

  return (
    <div className="landing-page" ref={containerRef}>
      <LandingNav scrolled={scrolled} />

      <header className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-hero-pill lp-rv"><span className="lp-dot" /> Surxondaryo viloyati · Elektron reyestr</div>
              <h1 className="lp-rv lp-d1">Tutash Hudud<br /><span>obyektlar reyestri</span></h1>
              <p className="lp-lead lp-rv lp-d2">Mavsumiy savdo, umumiy ovqatlanish va xizmat ko'rsatish uchun tutash hududlardan qonuniy foydalanish huquqlarini ro'yxatdan o'tkazish jarayoni</p>
              <div className="lp-hero-cta lp-rv lp-d3">
                <Link to="/royxatdan-otish" className="lp-btn lp-btn-teal">Ariza topshirish</Link>
                <a className="lp-btn lp-btn-ghost" href="#jarayon">Jarayon bilan tanishish</a>
              </div>
              <div className="lp-hero-trust lp-rv lp-d3">
                <div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" stroke="#0f5c63" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-5" stroke="#0f5c63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Auksionsiz, to'g'ridan-to'g'ri ijara
                </div>
                <div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#0f5c63" strokeWidth="2" /><path d="M12 7v5l3 3" stroke="#0f5c63" strokeWidth="2" strokeLinecap="round" /></svg>
                  Ariza 10 daqiqada
                </div>
                <div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="3" stroke="#0f5c63" strokeWidth="2" /><path d="M8 8h8M8 12h8M8 16h5" stroke="#0f5c63" strokeWidth="2" strokeLinecap="round" /></svg>
                  Shartnoma 1 yilga
                </div>
              </div>
            </div>

            <div className="lp-hero-art lp-rv lp-d2">
              <div className="lp-frame" dangerouslySetInnerHTML={{ __html: HERO_ART_SVG }} />
              <div className="lp-chip lp-c1"><span className="lp-ico" style={{ background: '#e2f5ec' }}>✅</span><span>Guvohnoma berildi<small>Termiz sh. · 120 m²</small></span></div>
              <div className="lp-chip lp-c2"><span className="lp-ico" style={{ background: '#fdf1dc' }}>📄</span><span>Ariza qabul qilindi<small>Denov t. · yozgi kafe</small></span></div>
              <div className="lp-chip lp-c3"><span className="lp-ico" style={{ background: '#e7effc' }}>⏱</span><span>3 ish kunida<small>ko'rib chiqiladi</small></span></div>
            </div>
          </div>
        </div>
        <div className="lp-scroll-hint"><i /></div>
      </header>

      <section id="statistika" className="lp-section" style={{ paddingTop: 70, paddingBottom: 40 }}>
        <div className="lp-container">
          <div className="lp-stats">
            {STATS.map((s, i) => (
              <div key={s.label} className={`lp-stat lp-rv${i > 0 ? ` lp-d${Math.min(i, 3)}` : ''}`}>
                <div className="lp-num" data-count={s.count}>0</div>
                <div className="lp-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="jarayon" className="lp-section lp-process">
        <div className="lp-container">
          <div className="lp-sec-head lp-rv">
            <div className="lp-tag">Jarayon</div>
            <h2>Ro'yxatdan o'tish bosqichlari</h2>
          </div>

          {STEPS.map((step, i) => (
            <div key={step.num}>
              <div className={`lp-prow${i % 2 === 1 ? ' lp-flip' : ''}`}>
                {i % 2 === 1 && (
                  <div className="lp-pill-illustr lp-rv" dangerouslySetInnerHTML={{ __html: step.art }} />
                )}
                <div className={`lp-pstep lp-rv${i % 2 === 1 ? ' lp-d1' : ''}`}>
                  <div className="lp-pnum"><b>{step.num}</b></div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
                {i % 2 === 0 && (
                  <div className="lp-pill-illustr lp-rv lp-d1" dangerouslySetInnerHTML={{ __html: step.art }} />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className="lp-connector lp-rv">
                  <svg viewBox="0 0 480 90" fill="none">
                    {i % 2 === 0 ? (
                      <path d="M460 8 C 330 30, 150 40, 20 82" stroke="#0f5c63" strokeWidth="2.5" strokeDasharray="10 9" strokeLinecap="round" />
                    ) : (
                      <path d="M20 8 C 150 30, 330 40, 460 82" stroke="#0f5c63" strokeWidth="2.5" strokeDasharray="10 9" strokeLinecap="round" />
                    )}
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="savollar" className="lp-section" style={{ background: 'linear-gradient(180deg,#fff,var(--lp-mint2) 120%)' }}>
        <div className="lp-container">
          <div className="lp-sec-head lp-rv">
            <h2>Ko'p so'raladigan savollar</h2>
          </div>
          <div className="lp-faq">
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                className="lp-rv"
                ref={(el) => {
                  detailsRefs.current[i] = el;
                }}
                onToggle={() => handleFaqToggle(i)}
              >
                <summary>{item.q} <span className="lp-x" /></summary>
                <div className="lp-ans">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="ariza" className="lp-section" style={{ paddingTop: 30 }}>
        <div className="lp-container">
          <div className="lp-cta-band lp-rv">
            <div>
              <h2>Bugun ariza topshiring — jarayon to'liq elektron</h2>
              <p>OneID orqali 2 daqiqada shaxsiy kabinet oching. Arizalar holati, shartnomalar va to'lovlar — barchasi bir joyda.</p>
            </div>
            <Link to="/royxatdan-otish" className="lp-btn lp-btn-teal" style={{ padding: '17px 34px', fontSize: 16 }}>
              Ariza topshirish
            </Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-f-grid">
            <div>
              <div style={{ marginBottom: 18 }}><Logo /></div>
              <p style={{ color: 'var(--lp-muted)', fontSize: 13.5, lineHeight: 1.7, maxWidth: 290 }}>
                Surxondaryo viloyati tutash hududlar va vaqtinchalik obyektlar elektron reyestri. Davlat yerlarini tadbirkorlarga ijaraga berish portali.
              </p>
            </div>
            <div>
              <h4>Portal</h4>
              <a href="#jarayon">Jarayon</a>
              <a href="#statistika">Statistika</a>
              <a href="#savollar">Savollar</a>
              <Link to="/dalolatnoma">Dalolatnoma</Link>
              <Link to="/royxatdan-otish">Ariza topshirish</Link>
            </div>
            <div>
              <h4>Ma'lumot</h4>
              <a href="#">VM 478-son qarori</a>
              <a href="#">Dizayn-kod talablari</a>
              <a href="#">Yo'riqnomalar</a>
              <a href="#">Ochiq ma'lumotlar</a>
            </div>
            <div>
              <h4>Aloqa</h4>
              <a href="#">Call-markaz: 1080</a>
              <a href="#">info@surxondaryo-th.uz</a>
              <a href="#">Telegram-bot</a>
              <a href="#">Murojaat yuborish</a>
            </div>
          </div>
          <div className="lp-f-bottom">
            <span>© {new Date().getFullYear()} Surxondaryo viloyati tutash hududlar reyestri. Barcha huquqlar himoyalangan.</span>
            <span>OneID · E-imzo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
