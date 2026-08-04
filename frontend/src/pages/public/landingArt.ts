// Bezak sifatidagi SVG illyustratsiyalar (tutash-hudud-portal.zip dizayn maketidan
// o'zgarishsiz olingan). SMIL <animate>/<animateTransform> teglari ko'p va hyphenli
// atributlarga (stroke-width va h.k.) ega bo'lgani uchun JSX'ga qo'lda o'tkazish
// o'rniga xom SVG satri sifatida saqlanadi va dangerouslySetInnerHTML orqali
// render qilinadi — kontent to'liq statik va ishonchli (foydalanuvchi kiritmasi emas).

export const HERO_ART_SVG = `<svg viewBox="0 0 560 430" xmlns="http://www.w3.org/2000/svg">
  <circle cx="300" cy="52" r="26" fill="#f5e7c6"/>
  <g fill="#e3f0e8">
    <rect x="118" y="44" width="62" height="190" rx="10"/>
    <rect x="198" y="76" width="48" height="158" rx="10"/>
    <rect x="410" y="36" width="72" height="170" rx="10"/>
  </g>
  <g fill="#ffffff" opacity=".8">
    <rect x="130" y="60" width="12" height="12" rx="2"/><rect x="152" y="60" width="12" height="12" rx="2"/>
    <rect x="130" y="84" width="12" height="12" rx="2"/><rect x="152" y="84" width="12" height="12" rx="2"/>
    <rect x="424" y="52" width="12" height="12" rx="2"/><rect x="446" y="52" width="12" height="12" rx="2"/>
    <rect x="424" y="76" width="12" height="12" rx="2"/><rect x="446" y="76" width="12" height="12" rx="2"/>
  </g>
  <circle cx="42" cy="190" r="52" fill="#cfe8db"/>
  <circle cx="80" cy="150" r="34" fill="#dcf0e5"/>
  <rect x="36" y="230" width="10" height="50" rx="5" fill="#9dc2ab"/>
  <circle cx="522" cy="160" r="55" fill="#c6e4d4"/>
  <circle cx="484" cy="120" r="30" fill="#dcf0e5"/>
  <rect x="516" y="206" width="10" height="56" rx="5" fill="#9dc2ab"/>
  <ellipse cx="280" cy="382" rx="302" ry="46" fill="#e6f2ea"/>
  <ellipse cx="180" cy="358" rx="140" ry="14" fill="#d3e7db"/>
  <ellipse cx="448" cy="352" rx="100" ry="12" fill="#d3e7db"/>
  <g>
    <rect x="64" y="170" width="196" height="160" rx="16" fill="#f7f4ec"/>
    <rect x="64" y="296" width="196" height="34" fill="#e8e2d2"/>
    <g>
      <path d="M76 214 h172 l-10 -38 h-152z" fill="#fff"/>
      <g fill="#0f5c63">
        <path d="M76 214 l12.7 -38 h25.3 l-12.7 38z"/>
        <path d="M126.6 214 l12.7 -38 h25.3 l-12.7 38z"/>
        <path d="M177.3 214 l12.7 -38 h25.3 l-12.7 38z"/>
        <path d="M228 214 l12.7 -38 h7.3 l10 38z"/>
      </g>
    </g>
    <rect x="88" y="222" width="148" height="68" rx="9" fill="#35565c"/>
    <circle cx="162" cy="250" r="13" fill="#f0c9a8"/>
    <path d="M149 246 a13 13 0 0 1 26 0 l-3 -10 h-20z" fill="#2e2b28"/>
    <path d="M144 290 q0 -26 18 -26 q18 0 18 26z" fill="#fff"/>
    <path d="M149 276 h26 v14 h-26z" fill="#3f8f6e"/>
    <rect x="80" y="290" width="164" height="10" rx="5" fill="#d9c9a8"/>
    <rect x="100" y="308" width="42" height="16" rx="4" fill="#fff" stroke="#cfe0d8"/>
    <path d="M106 314 h30M106 319 h20" stroke="#9db8ae" stroke-width="2" stroke-linecap="round"/>
    <g fill="#cfe8db">
      <circle cx="250" cy="160" r="6"><animate attributeName="cy" values="160;140;160" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="262" cy="150" r="4"><animate attributeName="cy" values="150;132;150" dur="2.6s" begin=".6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0;.8" dur="2.6s" begin=".6s" repeatCount="indefinite"/></circle>
    </g>
    <path d="M260 214 h42 q20 0 27 22 l9 30 v64 h-78z" fill="#f7f4ec"/>
    <path d="M272 226 h34 q12 0 16 14 l6 20 h-56z" fill="#bfe0d4"/>
    <circle cx="330" cy="300" r="6" fill="#f5d47a"/>
    <rect x="56" y="324" width="292" height="10" rx="5" fill="#cfe0d8"/>
    <circle cx="122" cy="338" r="22" fill="#33454c"/><circle cx="122" cy="338" r="9" fill="#dfe9e4"/>
    <circle cx="292" cy="338" r="22" fill="#33454c"/><circle cx="292" cy="338" r="9" fill="#dfe9e4"/>
  </g>
  <g>
    <rect x="446" y="140" width="6" height="150" fill="#b3a689"/>
    <path d="M356 168 q93 -74 186 0 q-46 -20 -93 0 q-47 -20 -93 0z" fill="#f3ecdd" stroke="#dccfb2" stroke-width="3"/>
    <circle cx="449" cy="132" r="6" fill="#dccfb2"/>
    <ellipse cx="449" cy="288" rx="50" ry="9" fill="#8a6f52"/>
    <rect x="446" y="290" width="7" height="66" fill="#8a6f52"/>
    <path d="M424 356 h50" stroke="#8a6f52" stroke-width="7" stroke-linecap="round"/>
    <rect x="428" y="272" width="9" height="14" rx="3" fill="#cfe0d5"/>
    <rect x="462" y="272" width="9" height="14" rx="3" fill="#e8b0a0"/>
    <g>
      <rect x="360" y="296" width="34" height="8" rx="4" fill="#a98e6c"/>
      <rect x="362" y="304" width="7" height="52" fill="#a98e6c"/><rect x="386" y="304" width="7" height="52" fill="#a98e6c"/>
      <rect x="356" y="252" width="8" height="52" rx="4" fill="#a98e6c"/>
      <circle cx="386" cy="230" r="15" fill="#f0c9a8"/>
      <path d="M386 215 q-19 -5 -16 13 q7 -10 16 -13z" fill="#2e2b28"/>
      <path d="M368 298 q-2 -50 20 -50 q17 0 26 26 l-7 5 q-7 -21 -19 -21 q-14 2 -12 40z" fill="#fdfdfb"/>
      <rect x="364" y="292" width="36" height="12" rx="6" fill="#41605a"/>
    </g>
    <g>
      <rect x="506" y="296" width="34" height="8" rx="4" fill="#a98e6c"/>
      <rect x="508" y="304" width="7" height="52" fill="#a98e6c"/><rect x="532" y="304" width="7" height="52" fill="#a98e6c"/>
      <rect x="536" y="252" width="8" height="52" rx="4" fill="#a98e6c"/>
      <circle cx="514" cy="232" r="14" fill="#e8b58e"/>
      <path d="M514 218 q20 -7 18 28 q-5 5 -9 3 q4 -24 -9 -31z" fill="#2e2b28"/>
      <path d="M532 298 q2 -48 -19 -48 q-16 0 -25 25 l7 5 q7 -20 18 -20 q13 2 11 38z" fill="#9fc4b4"/>
      <rect x="500" y="292" width="36" height="12" rx="6" fill="#3c4a54"/>
    </g>
  </g>
  <g>
    <rect x="18" y="330" width="30" height="34" rx="5" fill="#c9836a"/>
    <path d="M33 330 q-14 -26 2 -40 q14 14 2 40z" fill="#5b9c85"/>
    <path d="M26 332 q-20 -14 -12 -32 q16 6 12 32z" fill="#7fae9d"/>
  </g>
</svg>`;

export const STEP1_ART_SVG = `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
  <rect x="70" y="30" width="160" height="200" rx="8" fill="#cfe8db" transform="rotate(4 150 130)"/>
  <rect x="60" y="22" width="160" height="200" rx="8" fill="#fff" stroke="#dbe6e0" stroke-width="2" transform="rotate(-3 140 122)"/>
  <g transform="rotate(-3 140 122)">
    <rect x="92" y="40" width="96" height="22" rx="4" fill="none" stroke="#33565c" stroke-width="2.5"/>
    <text x="140" y="55" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="11" fill="#33565c">TUTASH HUDUD</text>
    <g stroke="#c3d2cc" stroke-width="4" stroke-linecap="round">
      <path d="M82 84 h116M82 100 h116M82 116 h96M82 132 h116M82 148 h76"/>
    </g>
    <path d="M92 185 q10 -18 20 0 q10 18 20 0 q10 -18 20 0" fill="none" stroke="#33565c" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dasharray="100">
      <animate attributeName="stroke-dashoffset" values="100;0;0;100" keyTimes="0;.4;.85;1" dur="4.5s" repeatCount="indefinite"/>
    </path>
    <circle cx="182" cy="185" r="17" fill="none" stroke="#9fbdb3" stroke-width="4" stroke-dasharray="5 4">
      <animateTransform attributeName="transform" type="rotate" from="0 182 185" to="360 182 185" dur="9s" repeatCount="indefinite"/>
    </circle>
  </g>
</svg>`;

export const STEP2_ART_SVG = `<svg viewBox="0 0 320 250" xmlns="http://www.w3.org/2000/svg">
  <g>
    <circle cx="150" cy="52" r="17" fill="#f0c9a8"/>
    <path d="M133 46 a18 18 0 0 1 34 0 l-4 -14 h-26z" fill="#e4b23e"/>
    <rect x="131" y="42" width="38" height="7" rx="3" fill="#e4b23e"/>
    <rect x="128" y="72" width="44" height="66" rx="10" fill="#7fae9d"/>
    <rect x="136" y="80" width="28" height="44" rx="4" fill="#5b8d7c"/>
    <rect x="118" y="138" width="26" height="72" rx="8" fill="#43555c"/><rect x="156" y="138" width="26" height="72" rx="8" fill="#43555c"/>
    <path d="M96 92 h108 v44 q-54 16 -108 0z" fill="#eef7f4" stroke="#c9ddd5" stroke-width="3"/>
    <g stroke="#7ba99a" stroke-width="2"><path d="M116 102 h68M116 112 h48M116 122 h60"/><rect x="150" y="100" width="26" height="24" fill="none"/></g>
  </g>
  <g>
    <circle cx="242" cy="60" r="16" fill="#e8b58e"/>
    <path d="M226 54 a17 17 0 0 1 33 0 l-4 -13 h-25z" fill="#3f6b60"/>
    <rect x="224" y="50" width="36" height="6" rx="3" fill="#3f6b60"/>
    <rect x="224" y="78" width="38" height="62" rx="9" fill="#333f47"/>
    <rect x="232" y="84" width="22" height="42" rx="4" fill="#e9a13c"/>
    <g>
      <animateTransform attributeName="transform" type="rotate" values="0 258 92;-9 258 92;0 258 92" dur="2.2s" repeatCount="indefinite"/>
      <path d="M258 88 q26 -6 40 -14" stroke="#e8b58e" stroke-width="11" stroke-linecap="round" fill="none"/>
    </g>
    <rect x="216" y="140" width="20" height="68" rx="7" fill="#2c363c"/><rect x="244" y="140" width="20" height="68" rx="7" fill="#2c363c"/>
  </g>
  <g>
    <circle cx="62" cy="112" r="15" fill="#f0c9a8"/>
    <path d="M48 106 a15 15 0 0 1 29 0 l-3 -11 h-23z" fill="#e4b23e"/>
    <rect x="46" y="104" width="33" height="6" rx="3" fill="#e4b23e"/>
    <rect x="46" y="128" width="34" height="48" rx="8" fill="#3b4a52"/>
    <rect x="52" y="134" width="20" height="30" rx="4" fill="#7fae9d"/>
    <rect x="42" y="176" width="44" height="16" rx="7" fill="#2c363c"/>
    <rect x="34" y="150" width="26" height="10" rx="5" fill="#f0c9a8"/>
    <rect x="20" y="152" width="22" height="14" rx="3" fill="#e9a13c"/><path d="M24 156 h14M24 161 h14" stroke="#b57718" stroke-width="1.6"/>
  </g>
  <path d="M92 236 q60 8 140 0" stroke="#0f5c63" stroke-width="2.2" stroke-dasharray="8 8" fill="none" opacity=".5"/>
</svg>`;

export const STEP3_ART_SVG = `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
  <rect x="72" y="34" width="158" height="198" rx="8" fill="#e2efe9" transform="rotate(5 150 130)"/>
  <rect x="64" y="26" width="158" height="198" rx="8" fill="#fff" stroke="#dbe6e0" stroke-width="2" transform="rotate(-2 142 124)"/>
  <g transform="rotate(-2 142 124)">
    <path d="M143 44 l20 8 v14 q0 20 -20 27 q-20 -7 -20 -27 v-14z" fill="#5b9c85"/>
    <path d="M135 66 l6 7 12 -14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="#c3d2cc" stroke-width="4" stroke-linecap="round">
      <path d="M92 112 h116M92 128 h116M92 144 h88M92 160 h116M92 176 h64"/>
    </g>
    <circle cx="186" cy="196" r="15" fill="none" stroke="#5b9c85" stroke-width="3.5">
      <animate attributeName="r" values="15;17;15" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <path d="M179 196 l5 5 10 -11" stroke="#5b9c85" stroke-width="3.5" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100">
      <animate attributeName="stroke-dashoffset" values="100;0;0;100" keyTimes="0;.3;.85;1" dur="3s" repeatCount="indefinite"/>
    </path>
  </g>
</svg>`;

export const STEP4_ART_SVG = `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
  <rect x="88" y="46" width="150" height="180" rx="8" fill="#9dc7b6" transform="rotate(8 160 136)"/>
  <rect x="66" y="34" width="150" height="180" rx="8" fill="#bcd9cc" transform="rotate(-4 140 124)"/>
  <g transform="rotate(-4 140 124)">
    <g stroke="#eef7f3" stroke-width="4" stroke-linecap="round">
      <path d="M96 76 h92M96 96 h92M96 116 h72M96 136 h92M96 156 h60M96 176 h80"/>
    </g>
    <g stroke="#2f7a5c" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M78 70 l6 7 11 -13M78 110 l6 7 11 -13M78 150 l6 7 11 -13M78 190 l6 7 11 -13" pathLength="100" stroke-dasharray="100">
        <animate attributeName="stroke-dashoffset" values="100;0;0;100" keyTimes="0;.5;.85;1" dur="5s" repeatCount="indefinite"/>
      </path>
    </g>
    <path d="M182 186 l16 16 26 -30" stroke="#2f7a5c" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="100" stroke-dasharray="100">
      <animate attributeName="stroke-dashoffset" values="100;0;0;100" keyTimes="0;.25;.85;1" dur="3.4s" repeatCount="indefinite"/>
    </path>
  </g>
  <path d="M116 30 q4 -16 16 -10 q12 6 4 16" fill="none" stroke="#5f8a78" stroke-width="5" stroke-linecap="round"/>
  <g>
    <animateTransform attributeName="transform" type="rotate" values="0 144 54;-5 144 54;0 144 54" dur="3.2s" repeatCount="indefinite"/>
    <rect x="118" y="42" width="52" height="24" rx="4" fill="#fff" stroke="#dbe6e0" transform="rotate(-8 144 54)"/>
    <text x="144" y="58" text-anchor="middle" transform="rotate(-8 144 54)" font-family="Space Grotesk" font-size="7.5" font-weight="700" fill="#c05545">TASDIQLANGAN</text>
  </g>
</svg>`;
