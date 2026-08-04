import { useRef } from 'react';
import './dalolatnoma.css';

const COMMISSION_ROLES = [
  'tumani (shahar) hokimining qurilish masalalari bo\'yicha o\'rinbosari',
  'tumani (shahar) Qurilish va uy-joy kommunal xo\'jaligi bo\'limi vakili',
  'Ekologiya va iqlim o\'zgarishi qo\'mitasining tumani (shahar) bo\'limi vakili',
  'tumani (shahar) Obodonlashtirish boshqarmasi vakili',
  'Kadastr agentligining tumani (shahar) bo\'limi vakili',
  'Favqulodda vaziyatlar vazirligining tumani (shahar) bo\'limi vakili',
  'tumani (shahar) Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi bo\'limi vakili',
  'tumani (shahar) Soliq inspeksiyasi vakili',
  'tumani (shahar) Ichki ishlar bo\'limi vakili',
  'tuman (shahar) IIB Yo\'l harakati xavfsizligi bo\'limi vakili',
  'tuman (shahar) Yo\'llardan foydalanish unitar korxonasi vakili',
];

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function DalolatnomaForm() {
  const sheetRef = useRef<HTMLDivElement>(null);

  function clearForm() {
    if (!sheetRef.current) return;
    if (!window.confirm("Barcha kiritilgan ma'lumotlar o'chirilsinmi?")) return;
    sheetRef.current.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      if (input.value !== '2026') input.value = '';
    });
  }

  function downloadWord() {
    if (!sheetRef.current) return;
    const clone = sheetRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      const u = document.createElement('u');
      const v = input.value.trim();
      u.innerHTML = v ? ` ${escapeHtml(v)} ` : ' __________ ';
      if (v) u.style.fontWeight = 'bold';
      input.replaceWith(u);
    });
    clone.querySelectorAll<HTMLTableElement>('.dp-ctable').forEach((table) => {
      table.setAttribute('border', '0');
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';
    });

    const docHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>Dalolatnoma</title>' +
      '<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>' +
      '<style>' +
      '@page{size:A4;margin:2cm 1.5cm 2cm 3cm}' +
      'body{font-family:"Times New Roman",serif;font-size:14pt;line-height:1.5;color:#000}' +
      'h1{font-size:14pt;text-align:center;font-weight:bold}' +
      'h2{font-size:13pt;font-weight:bold}' +
      'h3{font-size:13pt;font-weight:bold;text-align:center}' +
      'p{text-align:justify;text-indent:36pt;margin:6pt 0}' +
      '.dp-ilova{text-align:right;font-style:italic}' +
      '.dp-row2{margin:18pt 0}' +
      'table{width:100%;border-collapse:collapse}' +
      'th{text-align:left;border-bottom:1.5pt solid #000;padding:6pt 4pt;font-size:13pt}' +
      'td{padding:10pt 4pt;border-bottom:.5pt solid #999;vertical-align:bottom;font-size:13pt}' +
      'td:last-child,th:last-child{text-align:right;width:200pt}' +
      'u{text-underline:single}' +
      '</style></head><body>' + clone.innerHTML + '</body></html>';

    const blob = new Blob(['﻿' + docHtml], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dalolatnoma_tutash_hudud.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="dp-page-wrap">
      <div className="dp-toolbar">
        <span className="dp-hint">Bo'sh joylarni to'ldiring — hujjat tayyor bo'lgach Word shaklida yuklab oling</span>
        <button className="lp-btn lp-btn-ghost dp-btn-sm" onClick={clearForm} type="button">Tozalash</button>
        <button className="lp-btn lp-btn-teal dp-btn-sm" onClick={downloadWord} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Word yuklab olish
        </button>
      </div>

      <div className="dp-sheet" ref={sheetRef}>
        <div className="dp-ilova">3-ilova</div>
        <h1>Tadbirkorlik subyektlariga tutash hududlarni xatlovdan o'tkazish<br />dalolatnomasining namunaviy shakli</h1>

        <div className="dp-row2">
          <span><input className="dp-bl dp-w-m" placeholder="tuman/shahar" /> tumani (shahri)</span>
          <span><input className="dp-bl dp-w-s" placeholder="sana" /> <input className="dp-bl dp-w-s" defaultValue="2026" style={{ width: 64 }} />-yil</span>
        </div>

        <p>
          Tuzildi mazkur dalolatnoma <input className="dp-bl dp-w-m" placeholder="shahar/tuman" /> shahri, tumani,{' '}
          <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chasida joylashgan umumiy ovqatlanish, savdo va xizmat
          ko'rsatish sohasidagi tadbirkorlik subyektlari uchun o'ziga tegishli bino va inshootlarga hamda yer
          uchastkalariga tutash bo'lgan, davlat organlari va tashkilotlariga doimiy foydalanishga berilgan aholi
          punktlarining umumiy foydalanishdagi yer uchastkalarini aniqlash bo'yicha.
        </p>

        <h2>I. Xatlov o'tkazilgan <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chasining umumiy tasnifi.</h2>

        <p>
          <b>1.</b> <input className="dp-bl dp-w-m" placeholder="tuman" /> tumani, <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chasi{' '}
          <input className="dp-bl dp-w-m" placeholder="tuman" /> tumanning <input className="dp-bl dp-w-m" placeholder="ko'cha" /> va{' '}
          <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chalari bilan tutash.
        </p>

        <p>
          <b>2.</b> <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chasining avtomobil qatnov yo'li va tadbirkorlik
          subyektlarigacha bo'lgan oraliq masofa o'rtacha <input className="dp-bl dp-w-s" placeholder="—" /> metrni tashkil etadi.
        </p>

        <p>
          <b>3.</b> <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chasining piyodalar yo'lakchasigacha{' '}
          <input className="dp-bl dp-w-s" placeholder="—" /> metrni tashkil etadi.
        </p>

        <h2>
          II. <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chasidagi «<input className="dp-bl dp-w-m" placeholder="nomi" />» MChJ
          obyekti va unga tutash hudud tasnifi.
        </h2>

        <p><b>1.</b> «<input className="dp-bl dp-w-m" placeholder="nomi" />» MChJ obyektning joylashuvi — <input className="dp-bl dp-w-l" placeholder="joylashuvi" />;</p>

        <p>
          <b>2.</b> Yuridik manzili — <input className="dp-bl dp-w-m" placeholder="manzil" />, «<input className="dp-bl dp-w-m" placeholder="MFY nomi" />» MFY,{' '}
          <input className="dp-bl dp-w-m" placeholder="ko'cha" /> ko'chasi <input className="dp-bl dp-w-s" placeholder="№" />-uy;
        </p>

        <p><b>3.</b> Faoliyat turi — <input className="dp-bl dp-w-l" placeholder="faoliyat turi" />;</p>

        <p>
          <b>4.</b> «<input className="dp-bl dp-w-m" placeholder="nomi" />» MChJ tomonidan foydalanib kelinayotgan o'ziga tegishli bo'lmagan
          tutash hudud maydoni — <input className="dp-bl dp-w-s" placeholder="—" /> kv.m;
        </p>

        <p><b>5.</b> Tutash hududdan foydalanish maqsadi — <input className="dp-bl dp-w-l" placeholder="maqsad" />;</p>

        <p><b>6.</b> Tutash hududda mavjud bino va inshootlar — <input className="dp-bl dp-w-l" placeholder="bino/inshootlar" />;</p>

        <p><b>7.</b> Izoh va qo'shimchalar — <input className="dp-bl dp-w-xl" placeholder="izoh..." />.</p>

        <h2>III. «<input className="dp-bl dp-w-m" placeholder="nomi" />» MChJning dalolatnoma bilan tanishganligi.</h2>

        <p className="dp-noind" style={{ textIndent: 36 }}>
          Dalolatnomada qayd etilganlar «<input className="dp-bl dp-w-m" placeholder="nomi" />» MChJga tanishtirildi.
        </p>

        <p className="dp-noind" style={{ textIndent: 36 }}>
          Tanishdim: «<input className="dp-bl dp-w-m" placeholder="nomi" />» MChJ rahbari (vakili) <input className="dp-bl dp-w-m" placeholder="F.I.O." />{' '}
          <i>Imzo/muhr o'rni</i>
        </p>

        <h3>Xatlovdan o'tkazish bo'yicha komissiya a'zolari:</h3>

        <table className="dp-ctable">
          <tbody>
            <tr><th>Tashkilot nomi va rahbar/xodim lavozimi</th><th>F.I.O.</th></tr>
            {COMMISSION_ROLES.map((role, i) => (
              <tr key={i}>
                <td><input className="dp-bl dp-w-m" placeholder="tuman" /> {role}</td>
                <td><input className="dp-bl dp-w-l" placeholder="F.I.O." /></td>
              </tr>
            ))}
            <tr>
              <td>
                <input className="dp-bl dp-w-m" placeholder="tuman" /> tuman (shahar) «<input className="dp-bl dp-w-m" placeholder="MFY nomi" />» MFYdagi hokim yordamchisi
              </td>
              <td><input className="dp-bl dp-w-l" placeholder="F.I.O." /></td>
            </tr>
          </tbody>
        </table>

        <p className="dp-sign-note dp-noind" style={{ textIndent: 0 }}>
          Komissiya a'zolari imzosi: _________________________________________________
        </p>
      </div>
    </div>
  );
}
