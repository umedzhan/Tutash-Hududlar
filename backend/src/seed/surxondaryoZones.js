// Manba: roadmap/qaror/*.pdf — Surxondaryo viloyati tumanlari va Termiz shahri Xalq
// deputatlari Kengashlarining 2026-yil yer solig'i stavkalarini belgilash haqidagi
// qarorlari (yuridik shaxslar uchun, qishloq xo'jaligiga mo'ljallanmagan yerlar).
//
// Har bir tuman/shahar uchun: qaror jadvalidagi bazaviy stavka (1 gektar uchun, so'mda)
// va shu bazaga nisbatan mahalla/MFY/SHFY darajasidagi kamaytiruvchi/oshiruvchi
// koeffitsiyent (Kzona uchun asos). Qaror matni bilan jadval o'rtasida farq bo'lgan
// hollarda (masalan Qiziriq, Oltinsoy, Bandixon) jadvaldagi hisob-kitobga mos —
// ya'ni "koeffitsiyent x baza = jadvaldagi soliq summasi" formulasi bilan ichki
// izchil bo'lgan — qiymat olindi, izohda qayd etilgan.
//
// Ktuman (District.coefficient) — barcha tumanlar orasidagi eng past bazaviy stavkaga
// (43 355 000 so'm/ga — Bandixon/Muzrabot/Sherobod) nisbatan normallashtirilgan.

export const REFERENCE_BASE_RATE = 43355000;

export const DISTRICTS = [
  { code: 'TERMIZ_SH', name: 'Termiz shahri', baseRate: 57681000 },
  { code: 'TERMIZ_T', name: 'Termiz tumani', baseRate: 52780000 },
  { code: 'BOYSUN', name: 'Boysun tumani', baseRate: 45240000 },
  { code: 'JARQORGON', name: "Jarqo'rg'on tumani", baseRate: 52780000 },
  { code: 'SARIOSIYO', name: 'Sariosiyo tumani', baseRate: 49010000 },
  { code: 'QIZIRIQ', name: 'Qiziriq tumani', baseRate: 45240000 },
  { code: 'DENOV', name: 'Denov tumani', baseRate: 54665000 },
  { code: 'UZUN', name: 'Uzun tumani', baseRate: 49010000 },
  { code: 'QUMQORGON', name: "Qumqo'rg'on tumani", baseRate: 49010000 },
  { code: 'BANDIXON', name: 'Bandixon tumani', baseRate: 43355000 },
  { code: 'OLTINSOY', name: 'Oltinsoy tumani', baseRate: 45240000 },
  { code: 'MUZRABOT', name: 'Muzrabot tumani', baseRate: 43355000 },
  { code: 'SHEROBOD', name: 'Sherobod tumani', baseRate: 43355000 },
  { code: 'SHORCHI', name: "Sho'rchi tumani", baseRate: 52780000 },
  { code: 'ANGOR', name: 'Angor tumani', baseRate: 48067500 },
];

export const ZONES_BY_DISTRICT = {
  // Termiz shahri — 37 mahalla (termezcityqaror.pdf / mahllalar.docx)
  TERMIZ_SH: [
    ['Abdulla Avloniy', 1.2], ['Abdurahmon Jomiy', 1.0], ['Alisher Navoiy', 1.0],
    ['Alpomish', 1.2], ['Amu sohillari', 1.0], ['Baynalmilal', 1.0],
    ["Bog'ishamol", 1.2], ["Bog'zor", 1.1], ["Bo'ston", 1.1], ['Chegara', 1.0],
    ["Do'stlik", 1.1], ['Eskishahar', 1.0], ['Farhod', 1.0], ["Gulira'no", 1.0],
    ['Guliston', 1.1], ['Jayhun', 1.2], ["Jo'yjangal", 1.1], ["Kattabog'", 1.2],
    ['Kokildorota', 1.0], ["Ma'rifat", 1.2], ['Majnuntol', 1.0], ['Manguzar', 1.0],
    ['Mehrobod', 1.0], ['Namuna', 1.0], ["Navro'z", 1.2], ['Nurli kelajak', 1.0],
    ['Pattakesar', 1.0], ['Saxovat', 1.2], ['Shifokor', 1.0], ['Shodlik', 1.2],
    ['Surxon sohili', 1.2], ["Temiryo'lchi", 1.0], ['Tinchlik', 1.1],
    ["Tuproqqo'rg'on", 1.2], ['Turon', 1.1], ["O'zbekiston", 1.2], ['Yulduz', 1.2],
  ],

  // Termiz tumani — 30 MFY, jadvalda barchasi bir xil (0,82 koeffitsiyent, farqlanish yo'q)
  TERMIZ_T: [
    ['Ayritom MFY', 1.0], ['Amir Temur MFY', 1.0], ['AT-Termiziy MFY', 1.0],
    ['Bunyodkor MFY', 1.0], ['Gulbaxor MFY', 1.0], ['Guliston MFY', 1.0],
    ["Do'stlik MFY", 1.0], ["Jo'yjangal MFY", 1.0], ['Istiqlol MFY', 1.0],
    ['Qaxramon MFY', 1.0], ['Qoraxon MFY', 1.0], ["Quyoshli Yurt MFY", 1.0],
    ["Qo'ng'irot MFY", 1.0], ['Mustaqillik MFY', 1.0], ['Muxiddin Eshtemirov MFY', 1.0],
    ["Navro'z MFY", 1.0], ['Namuna MFY', 1.0], ['Nurafshon MFY', 1.0],
    ['Nurli Diyor MFY', 1.0], ['Orol MFY', 1.0], ['Sabzipoya MFY', 1.0],
    ['Soliobod MFY', 1.0], ['Termiz MFY', 1.0], ['Uchqizil MFY', 1.0],
    ['Xalqobod MFY', 1.0], ['Sharof Rashidov MFY', 1.0], ['Yangi Hayot MFY', 1.0],
    ['Yangiyer MFY', 1.0], ['Yangiobod MFY', 1.0], ['Kelajak MFY', 1.0],
  ],

  // Boysun tumani — 39 MFY, jadvalda barchasi 0,7 (bazaga nisbatan)
  BOYSUN: [
    ['Urmonchi MFY', 0.7], ['Pulxokim MFY', 0.7], ['Sayrob MFY', 0.7], ['Tillokamar MFY', 0.7],
    ['Togchi MFY', 0.7], ['Tuda MFY', 0.7], ['Tuzbozor MFY', 0.7], ['Urta Machay MFY', 0.7],
    ['Chorchinor MFY', 0.7], ['Xujaidod MFY', 0.7], ['Sariosiyo MFY', 0.7], ['Chilonzor MFY', 0.7],
    ['Poygaboshi MFY', 0.7], ['Shirinobod MFY', 0.7], ['Shifobulok MFY', 0.7], ['Shursoy MFY', 0.7],
    ['Yukori Machay MFY', 0.7], ['Xujabulgon MFY', 0.7], ['Pasurxi MFY', 0.7], ['Temir Darvoza MFY', 0.7],
    ['Mustakillik MFY', 0.7], ['Obi MFY', 0.7], ['Avlod MFY', 0.7], ['Arik-usti MFY', 0.7],
    ['Bibishirin MFY', 0.7], ['Bogibolo MFY', 0.7], ['Gaza MFY', 0.7], ['Darband MFY', 0.7],
    ['Daxnaijom MFY', 0.7], ["Dashtig'oz MFY", 0.7], ['Boshrabot MFY', 0.7], ['Duoba MFY', 0.7],
    ['Inkabod MFY', 0.7], ['Kizilnavr MFY', 0.7], ['Kosiblar MFY', 0.7], ['Kofrun MFY', 0.7],
    ['Kuchkak MFY', 0.7], ['Dexibola MFY', 0.7], ['Munchok MFY', 0.7],
  ],

  // Jarqo'rg'on tumani — 66 MFY, deyarli barchasi 1,0; Paxtazavod MFYda qo'shimcha 0,90 hudud koeffitsiyenti
  JARQORGON: [
    ['Paxtazavod MFY', 0.9], ['Oltintepa MFY', 1.0], ['Oktepa MFY', 1.0], ['Obod guzar MFY', 1.0],
    ['Oftobkurgon MFY', 1.0], ['Obi xayot MFY', 1.0], ['Navruz MFY', 1.0], ['Neftchilar MFY', 1.0],
    ['Namuna MFY', 1.0], ['Mustakillik MFY', 1.0], ['Mingchinor MFY', 1.0], ['Paxtaobod MFY', 1.0],
    ['Mexnat-roxat MFY', 1.0], ['Nurli diyor MFY', 1.0], ['Polvonlar yurti MFY', 1.0],
    ['Eskiqishloq MFY', 1.0], ['Sokchi MFY', 1.0], ['Mexnatobod MFY', 1.0], ['Yangiobod MFY', 1.0],
    ['Yangi usul MFY', 1.0], ['Yangi turmush MFY', 1.0], ['Yangi kishlok MFY', 1.0],
    ['Yangi arik MFY', 1.0], ['Porlok yulduz MFY', 1.0], ['Xujakishlok MFY', 1.0],
    ['Xayitobod MFY', 1.0], ['Urikli MFY', 1.0], ['Ulugbek MFY', 1.0], ['Uzumzor MFY', 1.0],
    ['Uzbekiston MFY', 1.0], ['Surxon soxili MFY', 1.0], ['Xalkobod MFY', 1.0], ['Matonat MFY', 1.0],
    ['Kuldovli MFY', 1.0], ['Markaziy surxon MFY', 1.0], ['Maslaxattepa MFY', 1.0],
    ['A.Navoiy MFY', 1.0], ['Avlod MFY', 1.0], ['Beshbulok MFY', 1.0], ['Bobotog MFY', 1.0],
    ['Bobur MFY', 1.0], ['Boymokli MFY', 1.0], ['Gulxovuz MFY', 1.0], ['Gur-gur MFY', 1.0],
    ['Dam MFY', 1.0], ['Dexkonobod MFY', 1.0], ['Dustlik MFY', 1.0], ['Yoshlik MFY', 1.0],
    ['Janub kalkonlari MFY', 1.0], ['Jarkurgon minorasi MFY', 1.0], ['Guliston MFY', 1.0],
    ['Zartepa MFY', 1.0], ['Madaniyat MFY', 1.0], ['Jinjaktepa MFY', 1.0], ['Loykand MFY', 1.0],
    ['Kushtepa MFY', 1.0], ['Kunchikish MFY', 1.0], ['Korakursok MFY', 1.0], ['Korayontok MFY', 1.0],
    ['Kumkishlok MFY', 1.0], ['Korayogoch MFY', 1.0], ['Korabura MFY', 1.0], ['Yashnaobod MFY', 1.0],
    ['Kamar MFY', 1.0], ['Istiklol MFY', 1.0], ['Ismoiltepa MFY', 1.0],
  ],

  // Sariosiyo tumani — 61 MFY, 0,8–1,2 oralig'ida farqlanadi
  SARIOSIYO: [
    ['Alisher Navoiy MFY', 1.1], ['Aeroport MFY', 1.1], ['Afrosiyob MFY', 1.1], ['Anorzor MFY', 1.1],
    ['Billur MFY', 1.2], ["Bog'iobod MFY", 1.0], ["Bog'iston MFY", 0.9], ["Bog'isamarqand MFY", 0.9],
    ["Bog'ishamol MFY", 1.0], ["Bog'ishirin MFY", 1.0], ['Boysunobod MFY', 0.8], ['Buyrapusht MFY', 1.0],
    ['Chilonzor MFY', 0.8], ['Chosh MFY', 0.8], ['Daragiston MFY', 0.8], ['Diydor MFY', 1.0],
    ["Do'stlik MFY", 1.0], ['Ehtirom MFY', 1.0], ['Feruz MFY', 1.0], ['Galabutta MFY', 1.0],
    ['Gulobod MFY', 1.2], ['Jannatmakon MFY', 1.0], ['Karsh MFY', 0.8], ['Kelajak sari MFY', 0.9],
    ['Konchilar MFY', 0.9], ['Lochin MFY', 1.2], ['Lutfkor MFY', 1.2], ['Mirzo Ulugbek MFY', 1.2],
    ["Ma'dankon MFY", 1.0], ['Maland MFY', 0.8], ['Marjona MFY', 0.9], ['Mehr-shavqat MFY', 1.2],
    ['Neloba MFY', 1.1], ['Nilu MFY', 0.8], ['Niholzor MFY', 0.9], ['Nodirabegim MFY', 1.1],
    ['Nurbuloq MFY', 1.0], ['Nurobod MFY', 0.9], ["Sa'diy Sheroziy MFY", 1.2], ['Sangardak MFY', 1.0],
    ['Sarijar MFY', 0.9], ['Sebzor MFY', 0.9], ['Shabnam MFY', 0.9], ['Sharq yulduzi MFY', 1.2],
    ['Sharofobod MFY', 0.9], ['Shahriobod MFY', 1.2], ['Shirin MFY', 0.9], ['Shohqishloq MFY', 0.9],
    ['Shohjahon MFY', 1.2], ['Subxidam MFY', 0.8], ['Terakzor MFY', 1.2], ['Tortuli MFY', 1.0],
    ['Turmushobod MFY', 0.9], ['Xalqobod MFY', 1.0], ['Hamkorlik MFY', 1.0], ['Xonjiza MFY', 0.9],
    ['Xulkar MFY', 0.9], ['Xumoyun (Xufar) MFY', 0.8], ['Xurshid MFY', 0.9], ['Yangi hayot MFY', 1.2],
    ["Yoqutlibog' MFY", 1.2],
  ],

  // Qiziriq tumani — 31 MFY, jadvaldan hisob-kitobga mos baza 45 240 000 so'm/ga
  QIZIRIQ: [
    ["Bog'bonlar yurti MFY", 0.75], ["Bog'iston MFY", 0.75], ['Buyuk kelajak MFY', 0.7],
    ['Gilambob MFY', 0.73], ['Gulzor MFY', 0.7], ['Gulobod MFY', 0.7], ["Do'stlik MFY", 1.0],
    ['Yetimqum MFY', 0.7], ['Zarbdor MFY', 0.7], ['Zarobod MFY', 0.7], ['Zartepa MFY', 0.7],
    ['Istara MFY', 0.75], ['Istiqlol MFY', 0.7], ['Karmaki MFY', 0.7], ['Qishloqozon MFY', 0.8],
    ['Qorasuv MFY', 0.7], ['Kunchiqish MFY', 0.7], ['Mustaqillik MFY', 0.7], ["Navro'z MFY", 0.7],
    ['Oqjar MFY', 1.0], ['Rabotak MFY', 1.0], ['Takiya MFY', 0.7], ['Tinchlik MFY', 0.7],
    ['Xalqobod MFY', 0.7], ['Xomkon MFY', 0.7], ['Shodlik MFY', 1.0], ['Yakka-terak MFY', 0.7],
    ['Yangi turmush MFY', 1.0], ['Yangi hayot MFY', 0.7], ['Yangikent MFY', 0.7], ['Yangiobod MFY', 0.7],
  ],

  // Denov tumani — 98 MFY, 0,73–1,00 oralig'ida
  DENOV: [
    ['AJomiy MFY', 1.0], ['Bahariston MFY', 1.0], ["Bog'i shamol MFY", 0.83], ["Bog'i Eram MFY", 0.83],
    ['Boginav MFY', 1.0], ['Buston MFY', 0.83], ['Buyuk zamin MFY', 0.83], ["Buyuk ipak yo'li MFY", 0.83],
    ['Buyuk kelajak MFY', 1.0], ['Vodiy MFY', 0.83], ['Guliston SHFY', 1.0], ['Guliston MFY', 0.83],
    ['Gulobod MFY', 0.83], ['Dahana MFY', 0.73], ['Dashti Chinor MFY', 0.73], ['Dunyotepa MFY', 0.83],
    ['Dustlik MFY', 0.83], ['Yoshlik MFY', 0.83], ['Jamatak MFY', 0.83], ['Z.M.Bobur MFY', 1.0],
    ['Zarafshon MFY', 0.83], ['Zartepa MFY', 0.83], ['Ibn Sino MFY', 1.0], ['Istiqbol MFY', 1.0],
    ['Istiqlol yulduzi MFY', 0.83], ['Qaytmas MFY', 0.83], ['Kata Qarshi MFY', 0.83],
    ['Qizilgul MFY', 0.83], ['Qiziljar MFY', 0.83], ['Qovunlisoy MFY', 0.83], ["Qorabog'tepa MFY", 0.83],
    ["Qorako'z MFY", 0.83], ['Qoraxon MFY', 0.83], ['Quyoshli yurt MFY', 1.0], ['Kuzichoqli MFY', 0.83],
    ['Kukabuloq MFY', 0.73], ['Kuhsor MFY', 0.73], ['Lag`monota MFY', 0.83], ['Lolazor MFY', 1.0],
    ['Lochin MFY', 0.83], ['Lupon MFY', 0.83], ['Mehnatobod MFY', 0.73], ['Mehr-oqibat MFY', 1.0],
    ['Mingbuloq MFY', 0.83], ['Minora MFY', 0.83], ['Muqumiy MFY', 0.83], ['Navbahor MFY', 0.83],
    ['Navnixol MFY', 0.83], ['Namozgoh MFY', 0.83], ['Namuna MFY', 0.83], ['Nuriston MFY', 1.0],
    ['Nurli manzil MFY', 1.0], ['Obod turmush MFY', 0.83], ['Obodon MFY', 0.83], ['Ozod MFY', 0.83],
    ['Oybarak MFY', 0.73], ['Oqtom MFY', 0.83], ["Oqqurg'on MFY", 0.83], ['Olovuddin MFY', 0.83],
    ['Ostona MFY', 0.83], ['Paxtakurash MFY', 0.83], ['Chashmasor MFY', 0.73], ['Sanoatchilik MFY', 1.0],
    ['Sebzor MFY', 0.83], ['Sina MFY', 0.73], ['Soxibkor MFY', 0.73], ['Sumbula MFY', 0.73],
    ['Surnaytepa MFY', 0.83], ['Surxon MFY', 0.83], ['Surxondiyor MFY', 0.83], ['Sufi Olloyor MFY', 1.0],
    ['Tasmasoy MFY', 0.83], ['Tinchlik MFY', 0.83], ['Totuvlik MFY', 1.0], ["O'zbekiston MFY", 0.83],
    ["O'zgarish MFY", 0.83], ["O'rikzor MFY", 1.0], ["O'rta qishloq MFY", 0.83], ['Ushor MFY', 0.73],
    ['Fayzli MFY', 0.83], ['Fayzobod MFY', 0.73], ["Xo'jaxalqi MFY", 0.83], ['Chagoniyon MFY', 0.83],
    ['Chambil MFY', 0.83], ['Chim MFY', 0.83], ['Chorgul MFY', 0.83], ['Chuqur qishloq MFY', 0.83],
    ['Chuntosh MFY', 0.83], ['Shamoli MFY', 0.83], ['Shahrinav MFY', 0.83], ['Elobod MFY', 0.83],
    ['Yurchi MFY', 0.83], ['Yangi Ariq MFY', 0.83], ['Yangi qishloq MFY', 0.83],
    ['Yangi Hazorbog MFY', 0.83], ['Yangikuch MFY', 0.83], ['Yangiobod MFY', 0.83], ['Yangihayot MFY', 1.0],
  ],

  // Uzun tumani — 51 MFY. #18 "Xatib Kaxromon MFY" manbada 9,00 deb bosilgan (aniq
  // xatolik, 0,90ning atrofidagi barcha qo'shni qiymatlarga mos ravishda tuzatildi).
  UZUN: [
    ['Yoshlik MFY', 1.0], ['Xujakulsin MFY', 0.7], ['Baxoriston MFY', 1.0], ['Beshkapa MFY', 0.9],
    ["Bobotog' MFY", 0.7], ['Guliston MFY', 0.75], ['Dexkon MFY', 0.75], ["Dug'ob MFY", 0.7],
    ['Dustlik MFY', 0.9], ['Jiydabuloq MFY', 0.7], ['Surxon MFY', 0.75], ['Istiklol MFY', 0.9],
    ['Uzunkishlok MFY', 0.9], ['Ulankul MFY', 0.7], ['Urmanchi MFY', 0.7], ['Fayzobod MFY', 0.75],
    ['Fayzova MFY', 0.75], ['Xatib Kaxromon MFY', 0.9], ['Xursand MFY', 0.7], ['Uzbekiston MFY', 1.0],
    ['Chakar MFY', 1.0], ['Erkinlik MFY', 1.0], ['Yangi Kuch MFY', 1.0], ['Yangi obod MFY', 0.7],
    ['Yangiyul MFY', 1.0], ['Zarkamar MFY', 0.7], ['Yangiruzgor MFY', 1.0], ['Yangishaxar MFY', 1.0],
    ['Chinor MFY', 0.8], ['Tomchi MFY', 0.7], ['Yangi xayot MFY', 0.9], ['Tojikobod MFY', 0.9],
    ['Karashik MFY', 0.9], ['Kichik joncheka MFY', 1.0], ['Toltugay MFY', 0.7],
    ['Madaniy Turmush MFY', 0.75], ['Malandiyon MFY', 1.0], ['Mexnat MFY', 1.0],
    ['Mustakillik MFY', 0.7], ['Mustakillikning 22 yilligi MFY', 0.72], ['Navruz MFY', 1.0],
    ['Ittifoq MFY', 1.0], ['Obizarang MFY', 1.0], ['Obod yurt MFY', 0.8], ['Ok ostona MFY', 0.8],
    ['Okmachit MFY', 0.7], ['Nurafshon MFY', 0.7], ['Serxarakat MFY', 0.8], ['Saxovat MFY', 0.7],
    ['Nurli kelajak MFY', 0.7], ['Paxlavon MFY', 0.7],
  ],

  // Qumqo'rg'on tumani — 61 MFY
  QUMQORGON: [
    ['Bobolochin MFY', 0.75], ['Azlarsoy MFY', 0.85], ['Oktom MFY', 0.75], ['Besh kaxramon MFY', 0.9],
    ['Neftchilar MFY', 0.9], ['Navbaxor MFY', 0.8], ['Mustakillik MFY', 0.75], ['Munchoktepa MFY', 0.8],
    ['Mexrobod MFY', 0.8], ['Kuganli MFY', 0.75], ['Hunarmandlar MFY', 0.75], ['Kattakul MFY', 0.75],
    ['Qarsokli MFY', 0.8], ['Istiklol MFY', 0.75], ['Islomobod MFY', 0.75], ['Imomtepa MFY', 0.75],
    ['Joziba MFY', 0.75], ['Jiydali MFY', 0.9], ['Jarkishlok MFY', 0.75], ['Jaloir MFY', 0.75],
    ['Dustlik MFY', 0.9], ['Davlatsoy MFY', 0.7], ['Gultepa MFY', 0.75], ['Guliston MFY', 0.7],
    ['Galaba MFY', 0.75], ['Buston MFY', 0.75], ['Boymokli MFY', 0.75], ['Bogora MFY', 0.8],
    ['Bobotog MFY', 0.75], ['Pastxam MFY', 0.75], ['Paxtaobod MFY', 0.8], ['Nurli diyor MFY', 0.75],
    ['Surxon soxili MFY', 0.85], ["Arig'oshgan MFY", 0.75], ['Arpapoya MFY', 0.75], ['Achamoyli MFY', 0.75],
    ['Arslonboyli MFY', 0.75], ['Yangikishlok MFY', 0.75], ['Yangier MFY', 0.85], ['Yangi shaxar MFY', 0.9],
    ['Yangi xayot MFY', 0.75], ['Yangi obod MFY', 0.75], ['Saxovat MFY', 0.7], ['Elobod MFY', 0.8],
    ['Sherozi MFY', 0.75], ['Chukirli MFY', 0.75], ['Yangi avlod MFY', 0.75], ['Hurriyat MFY', 0.8],
    ['Tayfang MFY', 0.75], ['Tebet MFY', 0.7], ['Yuksalish MFY', 0.75], ['Tuda MFY', 0.75],
    ['Uzbekiston 5 yilligi MFY', 0.75], ['Ulugbek MFY', 0.9], ["Tug'on MFY", 0.8], ['Uyas MFY', 0.75],
    ['Xalaki MFY', 0.75], ['Xalkobod MFY', 0.75], ['Xujaqishlok MFY', 0.75], ['Xujamulki MFY', 0.75],
    ['Umid nixollari MFY', 0.75],
  ],

  // Bandixon tumani — 22 MFY
  BANDIXON: [
    ['Obod turmush MFY', 0.87], ['Obod yurt MFY', 0.75], ['Paxtakor MFY', 0.75], ['Polvontosh MFY', 0.75],
    ["Xo'jaipok MFY", 0.75], ["Urg'ulsoy MFY", 0.87], ['Farovon MFY', 0.75], ['Chinor MFY', 0.89],
    ['Obikor MFY', 0.76], ['Saroy MFY', 1.05], ['Navruz MFY', 0.76], ['Navbahor MFY', 0.75],
    ['Limonzor MFY', 0.87], ['Bag`rikeng MFY', 0.75], ['Bahoriston MFY', 0.87], ['Bektepa MFY', 1.05],
    ['Birdamlik MFY', 0.75], ['Bandixon MFY', 1.05], ['Zevar MFY', 0.75], ["Qaldirg'och MFY", 0.87],
    ['Quduqsoy MFY', 0.75], ["Gulbog' MFY", 0.87],
  ],

  // Oltinsoy tumani — 54 MFY
  OLTINSOY: [
    ['Jilibuloq MFY', 0.9], ['Madaniyat MFY', 0.8], ['Qusharcha MFY', 0.7], ['Qurama-1 MFY', 0.8],
    ['Qumpaykal MFY', 0.8], ['Qoratepa MFY', 1.0], ['Qiziltepa MFY', 0.8], ['Karsagan MFY', 0.7],
    ['Ipoq MFY', 1.0], ['Zardaqul MFY', 0.7], ['Nurafshon MFY', 0.7], ['Jobu MFY', 0.7],
    ['Marmin MFY', 0.7], ['Jiyanbobo MFY', 0.9], ['Gulchechak MFY', 0.8], ['Gulobod MFY', 0.8],
    ['Guliston MFY', 1.0], ['Obod Vaxshivor MFY', 0.7], ['Katta Vaxshivor MFY', 0.7], ["Bo'ston MFY", 1.0],
    ['Botosh MFY', 0.8], ['Bibizaynab MFY', 0.8], ['Beshbola paxlavon MFY', 0.8],
    ['Barkamol avlod MFY', 0.8], ['Shodlik MFY', 1.0], ["Dug'oba MFY", 0.8], ['Mingchinor MFY', 0.7],
    ['Qorliq MFY', 0.8], ['Muminqul MFY', 0.7], ['Yangiqurilish MFY', 0.8], ['Yangiarik MFY', 0.8],
    ['Yakka-tut MFY', 1.0], ['Ekraz MFY', 0.8], ['Shoxcha MFY', 0.8], ['Shakar-qamish MFY', 0.8],
    ['Chinor MFY', 0.7], ['Mirshodi MFY', 0.8], ['Xujaipok MFY', 0.7], ['Xidirsho MFY', 0.7],
    ['Xalqobod MFY', 0.8], ['Xayrandara MFY', 0.7], ['Chep MFY', 0.8], ['Mustaqillik-10 yilligi MFY', 0.8],
    ["Tog'ay Murod MFY", 0.7], ['Sohibkor MFY', 0.7], ['Sayrak MFY', 0.7], ['Paxlavon MFY', 0.7],
    ['Olmazor MFY', 0.8], ['Oqarbuloq MFY', 1.0], ['Ovchi MFY', 0.8], ['Obshir MFY', 0.7],
    ['Obod turmush MFY', 0.8], ['Navruz MFY', 0.8], ['Tuxtamish MFY', 0.7],
  ],

  // Muzrabot tumani — 37 MFY. "Yangiyer MFY" manbada "Jami" (jami qator) qiymati bilan
  // aralashib qolgan, qo'shni qatorlar bilan bir xil (0,75) deb olindi.
  MUZRABOT: [
    ['Alpomish MFY', 0.75], ['Anorzor MFY', 0.75], ['At Termiziy MFY', 0.8], ["Bog'i eram MFY", 0.75],
    ['Bodomzor MFY', 0.75], ["Buyuk ipak yo'li MFY", 0.75], ['Guliston MFY', 0.75], ['Gulobod MFY', 0.75],
    ['Darband MFY', 0.75], ['Dexqonobod MFY', 0.75], ['Duoba MFY', 0.75], ["Do'stlik MFY", 0.75],
    ["Yo'lchi MFY", 0.75], ['Madaniyat MFY', 0.75], ['Mexnatabod MFY', 0.75], ['Mexrigiyox MFY', 0.75],
    ['Moxiyat MFY', 0.75], ['Muzrabot darvoza MFY', 0.75], ['Mustaqillik MFY', 0.75], ['Navruz MFY', 0.75],
    ['Nurli xayot MFY', 0.8], ['Obi xayot MFY', 0.75], ['Obod turmush MFY', 0.75], ['Olmazor MFY', 0.75],
    ['Oriyat MFY', 0.75], ['Sopollitepa MFY', 0.75], ["Tong yulduzi MFY", 0.75], ['Fayziobod MFY', 0.75],
    ['Fidokor MFY', 0.75], ["Xalq yuli MFY", 0.75], ['Chegarachi MFY', 0.75], ['Shaffof MFY', 0.95],
    ['Yurtim jamoli MFY', 0.8], ['Yakkatol MFY', 0.75], ['Yangi diyor MFY', 0.75], ['Yangi xayot MFY', 0.95],
    ['Yangiyer MFY', 0.75],
  ],

  // Sherobod tumani — 48 MFY. Manbada koeffitsiyent 100 baravar (masalan "90,4") ko'rinishida
  // bosilgan, /100 qilib qayta hisoblandi (90,4 -> 0,904, tekshirildi: summaga mos keladi).
  SHEROBOD: [
    ['Balxiguzar MFY', 0.95], ['Bahor MFY', 1.0], ["Bog'iobod MFY", 0.904], ['Boybuloq MFY', 0.904],
    ['Boyqishloq MFY', 0.904], ["Buyuk ipak yo'li MFY", 1.073], ['Vandob MFY', 0.904],
    ['Galaguzar MFY', 0.904], ["G'ambur MFY", 1.073], ['Guliston MFY', 0.904], ['Gulchinor MFY', 0.904],
    ["G'urjak 1 MFY", 0.904], ["G'urjak 2 MFY", 0.904], ["G'o'rin-Gilambob MFY", 1.0],
    ['Dehqonariq MFY', 0.904], ["Do'stlik MFY", 1.1], ['Yoshlik MFY', 1.073], ["Zarabog' MFY", 0.904],
    ['Istiqbol MFY', 0.904], ['Katta hayot MFY', 1.1], ["Kattabog' MFY", 0.95], ['Qizilolma MFY', 0.904],
    ['Qishloqbozor MFY', 0.904], ['Qorabog\' MFY', 1.0], ['Qulluqsho MFY', 0.904],
    ["Qo'rg'on MFY", 1.073], ['Majnuntol MFY', 0.95], ['Mehnatobod MFY', 0.904], ['Mehrobod MFY', 0.904],
    ['Navbur MFY', 0.95], ['Nurtepa MFY', 0.95], ['Oyinli MFY', 0.904], ['Oqtepa MFY', 0.904],
    ['Oltinvoha MFY', 0.904], ['Poshxurt MFY', 0.904], ['Taroqli MFY', 0.95], ['Uzunsoy MFY', 0.904],
    ["Uch yog'och MFY", 0.904], ['Hakimobod MFY', 0.904], ["Xo'jaqiya 1 MFY", 0.904],
    ["Xo'jaqiya 2 MFY", 0.904], ["Xo'jgi MFY", 1.073], ["Chag'atoy MFY", 0.904], ['Chorbog\' MFY', 0.904],
    ["Cho'yinchi MFY", 0.904], ["Chuqurko'l MFY", 0.904], ["Cho'mishli MFY", 0.904], ['Sherobod MFY', 0.904],
  ],

  // Sho'rchi tumani — 53 MFY/SHFY
  SHORCHI: [
    ['Joyilma SHFY', 1.0], ['Zarbdor MFY', 0.8], ['Ibn-Sino MFY', 1.0], ['Kokaydi MFY', 0.8],
    ['Katta Savur SHFY', 0.8], ['Jarqishloq SHFY', 1.0], ['Konobod MFY', 0.8], ['Kakan MFY', 0.8],
    ['Yoshgayrat MFY', 0.8], ['Bobur MFY', 1.0], ['Guliston MFY', 0.8], ['Guzallik SHFY', 0.8],
    ['Bobotog MFY', 1.0], ['Baxshtepa-1 MFY', 0.8], ['Baxshtepa MFY', 0.8], ['A.Navoiy MFY', 1.0],
    ['Garmakurg\'on SHFY', 0.8], ['Koraarik MFY', 0.8], ['Dustlik MFY', 1.0], ['Kuklam MFY', 1.0],
    ['Buston MFY', 1.0], ['Kushtegirmon SHFY', 0.8], ['Kushon MFY', 0.8], ['Yangiarik MFY', 0.8],
    ['Yalti SHFY', 0.8], ['Yakkabog MFY', 0.8], ['Elbayon MFY', 0.8], ['Ezgulik MFY', 0.8],
    ['Egarchi MFY', 0.8], ['Bunyodkor MFY', 0.8], ['Shaldirok MFY', 0.8], ['Shakarkul MFY', 0.8],
    ['Xushchekka SHFY', 0.8], ['Xayrobod MFY', 1.0], ['Tula MFY', 1.0], ['Tolli MFY', 0.8],
    ['Sovjironbobo MFY', 0.8], ['Xurlik MFY', 0.8], ['Tamshush MFY', 0.8], ['Laylakxona MFY', 0.8],
    ['Navruz MFY', 1.0], ['Obodon MFY', 0.8], ['Tamaddun MFY', 0.8], ['Oynakul MFY', 0.8],
    ['Okkamar MFY', 0.8], ["Oqqo'rg'on MFY", 0.8], ['Ozod MFY', 0.8], ['Olatemir MFY', 0.8],
    ['Oliyximmat MFY', 0.8], ['Oftobmakon MFY', 0.8], ['Saksankapa MFY', 0.8], ['Saurtepa MFY', 0.8],
    ['Oktumshuk MFY', 0.8],
  ],

  // Angor tumani (manba fayl nomi buzilgan edi, hujjat sarlavhasidan aniqlandi) — 36 MFY
  ANGOR: [
    ['Bahor MFY', 0.9], ['Gilambob MFY', 0.9], ['Gulzor MFY', 0.9], ['Guliston MFY', 0.9],
    ['Qoraqir MFY', 0.9], ['Yangihayot MFY', 0.9], ['Zang Gilambob MFY', 0.9], ['Zartepa MFY', 0.9],
    ["Ilg'or MFY", 0.9], ['Qadimiy Angor MFY', 0.9], ['Kayran MFY', 0.9], ['Karvon MFY', 0.9],
    ['Kattaqum MFY', 0.9], ["Qorabog' MFY", 0.9], ['Qorasuv MFY', 0.9], ["Qo'shtegirmon MFY", 0.9],
    ['Madaniyat MFY', 0.9], ['Markaz MFY', 0.9], ['Navbahor MFY', 1.0], ["Navro'z MFY", 1.0],
    ['Navshahar MFY', 0.9], ["Do'stlik MFY", 0.9], ['Tallashqon MFY', 0.9], ["To'lqin MFY", 0.9],
    ["O'zbekiston MFY", 1.0], ["Ulug'bek MFY", 0.9], ['Farovon MFY', 0.9], ['Xomkon MFY', 0.9],
    ["Xo'janqon MFY", 0.9], ['Chinobod MFY', 0.9], ['Sharq guli MFY', 1.0],
    ['Yuqori Tallashqon MFY', 0.9], ['Yuqori Tallimaron MFY', 0.9], ["Yuqori Xo'jaqiya MFY", 0.9],
    ['Yangiobod MFY', 0.9], ['Yangiturmush MFY', 0.9],
  ],
};
