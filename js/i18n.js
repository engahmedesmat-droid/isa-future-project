(function (root) {
  'use strict';

  var STR = {
    en: {
      title: 'ISA Future Project', subtitle: 'Egyptian backgammon by moonlit lantern light',
      chooseGame: 'Choose your game', play: 'Play',
      g3ada: '3ada', g3adaDesc: 'Classic backgammon. Hit a lone checker and it goes to the bar.',
      gMahbusa: 'Ma7boussa', gMahbusaDesc: 'All 15 checkers start on one point. Land on a lone checker and it is imprisoned until you move away.',
      opponent: 'Opponent', vsCpu: 'Computer', vsLocal: 'Two players',
      difficulty: 'Difficulty', easy: 'Easy', normal: 'Normal', hard: 'Hard',
      language: 'Language', sound: 'Sound',
      you: 'You', p1: 'Player 1', p2: 'Player 2',
      ice: 'Ice', sapphire: 'Sapphire',
      roll: 'Roll the dice', rolling: 'Rolling…',
      yourTurn: 'Your turn', turnOf: '{n}’s turn', thinking: '{n} is thinking…',
      pickChecker: 'Pick a checker to move', pickTarget: 'Pick where it goes',
      noMoves: 'No legal moves — turn passes', undo: 'Undo', menu: 'Menu',
      pips: 'Pips', borneOff: 'Off', onBar: 'Bar',
      wins: '{n} wins!', youWin: 'You win!', youLose: 'Better luck next time',
      gammon: 'Gammon!', rematch: 'Play again', backToMenu: 'Back to menu',
      rules: 'How to play',
      rules3ada: 'Move all 15 checkers around the board into your last quarter, then bear them off. A lone checker can be hit and sent to the bar; it must re-enter before anything else moves.',
      rulesMahbusa: 'Both sides start with all 15 checkers on one point. Land on a lone enemy checker to imprison it: it cannot move until your checker leaves. First to bear off all 15 wins.',
      tipClick: 'Click a checker, then click a highlighted point.',
      ready: 'Ready',
      cpuNames: ['Esmat', 'AbdelAzim', 'Yasser']

    },
    ar: {
      title: 'ISA Future Project', subtitle: 'طاولة مصرية على نور الفوانيس',
      chooseGame: 'اختار اللعبة', play: 'يلا نلعب',
      g3ada: 'عادة', g3adaDesc: 'الطاولة الكلاسيكية. لو ضربت حجر لوحده بيروح على الشريط.',
      gMahbusa: 'محبوسة', gMahbusaDesc: 'الـ15 حجر كلهم بيبدأوا من خانة واحدة. لما تقع على حجر لوحده بتحبسه ومش بيتحرك لحد ما تمشي من فوقه.',
      opponent: 'الخصم', vsCpu: 'الكمبيوتر', vsLocal: 'لاعبين على نفس الجهاز',
      difficulty: 'المستوى', easy: 'سهل', normal: 'عادي', hard: 'صعب',
      language: 'اللغة', sound: 'الصوت',
      you: 'إنت', p1: 'اللاعب 1', p2: 'اللاعب 2',
      ice: 'الثلجي', sapphire: 'الياقوتي',
      roll: 'ارمي الزهر', rolling: 'الزهر بيلف…',
      yourTurn: 'دورك', turnOf: 'دور {n}', thinking: '{n} بيفكر…',
      pickChecker: 'اختار الحجر اللي هتحركه', pickTarget: 'اختار هيروح فين',
      noMoves: 'مفيش حركات متاحة — الدور بيعدي', undo: 'رجّع', menu: 'القائمة',
      pips: 'النقط', borneOff: 'خرج', onBar: 'الشريط',
      wins: 'كسب {n}!', youWin: 'مبروك! كسبت', youLose: 'حظ أوفر المرة الجاية',
      gammon: 'جامون!', rematch: 'ماتش تاني', backToMenu: 'رجوع للقائمة',
      rules: 'إزاي تلعب',
      rules3ada: 'حرّك الـ15 حجر حوالين الطاولة لحد الربع الأخير بتاعك وبعدين طلّعهم بره. الحجر اللوحده ممكن يتضرب ويروح الشريط، ولازم يرجع الأول قبل أي حركة تانية.',
      rulesMahbusa: 'الاتنين بيبدأوا بالـ15 حجر على خانة واحدة. لو وقعت على حجر لوحده بتحبسه ومش هيتحرك لحد ما حجرك يمشي. أول واحد يطلّع الـ15 حجر بره يكسب.',
      tipClick: 'دوس على حجر وبعدين على الخانة المنوّرة.',
      ready: 'جاهز',
      cpuNames: ['عصمت', 'عبد العظيم', 'ياسر']

    },
    fr: {
      title: 'ISA Future Project', subtitle: 'Le backgammon égyptien à la lueur des lanternes',
      chooseGame: 'Choisissez votre jeu', play: 'Jouer',
      g3ada: '3ada', g3adaDesc: 'Le backgammon classique. Un pion seul touché part sur la barre.',
      gMahbusa: 'Ma7boussa', gMahbusaDesc: 'Les 15 pions partent d’une seule case. Tombez sur un pion seul pour l’emprisonner tant que vous ne bougez pas.',
      opponent: 'Adversaire', vsCpu: 'Ordinateur', vsLocal: 'Deux joueurs',
      difficulty: 'Difficulté', easy: 'Facile', normal: 'Normal', hard: 'Difficile',
      language: 'Langue', sound: 'Son',
      you: 'Vous', p1: 'Joueur 1', p2: 'Joueur 2',
      ice: 'Glace', sapphire: 'Saphir',
      roll: 'Lancer les dés', rolling: 'Les dés roulent…',
      yourTurn: 'À vous de jouer', turnOf: 'Tour de {n}', thinking: '{n} réfléchit…',
      pickChecker: 'Choisissez un pion', pickTarget: 'Choisissez la destination',
      noMoves: 'Aucun coup possible — le tour passe', undo: 'Annuler', menu: 'Menu',
      pips: 'Pips', borneOff: 'Sortis', onBar: 'Barre',
      wins: '{n} gagne !', youWin: 'Vous gagnez !', youLose: 'Ce sera pour la prochaine fois',
      gammon: 'Gammon !', rematch: 'Rejouer', backToMenu: 'Retour au menu',
      rules: 'Règles',
      rules3ada: 'Ramenez vos 15 pions dans votre dernier quart puis sortez-les. Un pion seul peut être touché et envoyé sur la barre ; il doit rentrer avant tout autre coup.',
      rulesMahbusa: 'Chacun commence avec ses 15 pions sur une case. Tombez sur un pion adverse seul pour l’emprisonner : il ne bouge plus tant que votre pion reste. Le premier à tout sortir gagne.',
      tipClick: 'Cliquez un pion, puis une case en surbrillance.',
      ready: 'Prêt',
      cpuNames: ['Esmat', 'AbdelAzim', 'Yasser']

    }
  };

  var lang = 'ar';

  function setLang(l) {
    if (!STR[l]) l = 'en';
    lang = l;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }

  function t(k, vars) {
    var s = (STR[lang] && STR[lang][k]) || STR.en[k] || k;
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
