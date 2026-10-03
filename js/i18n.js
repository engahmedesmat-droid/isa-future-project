(function (root) {
  'use strict';

  var STR = {
    ar: {
      title: 'ISA Future Project', subtitle: 'طاولة مصرية على نور الفوانيس',
      chooseGame: 'اختار اللعبة', play: 'يلا نلعب',
      g3ada: 'عادة', g3adaDesc: 'الطاولة الكلاسيكية. لو ضربت أوشاط لوحده بيروح على الشريط.',
      gMahbusa: 'محبوسة', gMahbusaDesc: 'الـ15 أوشاط كلهم بيبدأوا من خانة واحدة. لما تقع على أوشاط لوحده بتحبسه ومش بيتحرك لحد ما تمشي من فوقه.',
      opponent: 'هتلعب مع مين؟', vsCpu: '١ · الكمبيوتر', vsLocal: '٢ · لاعبين على نفس الجهاز',
      difficulty: 'المستوى', easy: 'سهل', normal: 'عادي', hard: 'صعب',
      language: 'اللغة', sound: 'الصوت',
      you: 'إنت', p1: 'اللاعب 1', p2: 'اللاعب 2',
      ice: 'الثلجي', sapphire: 'الياقوتي',
      roll: 'ارمي الزهر', rolling: 'الزهر بيلف…',
      yourTurn: 'دورك', turnOf: 'دور {n}', thinking: '{n} بيفكر…',
      pickChecker: 'اختار الأوشاط اللي هتحركه', pickTarget: 'اختار هيروح فين',
      noMoves: 'مفيش حركات متاحة — الدور بيعدي', undo: 'رجّع', menu: 'القائمة',
      pips: 'النقط', borneOff: 'خرج', onBar: 'الشريط',
      wins: 'كسب {n}!', youWin: 'مبروك! كسبت', youLose: 'حظ أوفر المرة الجاية',
      gammon: 'جامون!', rematch: 'ماتش تاني', backToMenu: 'رجوع للقائمة',
      rules: 'إزاي تلعب',
      rules3ada: 'حرّك الـ15 أوشاط حوالين الطاولة لحد الربع الأخير بتاعك وبعدين طلّعهم بره. الأوشاط اللوحده ممكن يتضرب ويروح الشريط، ولازم يرجع الأول قبل أي حركة تانية.',
      rulesMahbusa: 'الاتنين بيبدأوا بالـ15 أوشاط على خانة واحدة. لو وقعت على أوشاط لوحده بتحبسه ومش هيتحرك لحد ما أوشاطك يمشي. أول واحد يطلّع الـ15 أوشاط بره يكسب.',
      tipClick: 'دوس على أوشاط وبعدين على الخانة المنوّرة.',
      ready: 'جاهز',
      cpuNames: ['عصمت', 'عبد العظيم', 'ياسر']

    }
  };

  var lang = 'ar';

  function setLang(l) {
    l = 'ar';
    lang = l;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }

  function t(k, vars) {
    var s = (STR.ar[k]) || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  }

  function cpuNameAt(i) {
    var list = STR[lang].cpuNames;
    return list[i % list.length];
  }

  root.TZ = Object.assign(root.TZ || {}, {
    i18n: { t: t, setLang: setLang, getLang: function () { return lang; }, cpuNameAt: cpuNameAt, langs: Object.keys(STR) }
  });
})(window);
