/* EN/RU strings for the marketing page and the tool.
 *
 * The English copy also lives in the HTML, so the page reads correctly before
 * this file runs and for anyone without JavaScript. This dictionary is what
 * makes the RU switch possible; en[] entries exist so a missing RU key falls
 * back to something real rather than to a key name.
 *
 * The legal pages are deliberately not translated — a machine-translated
 * privacy notice is a liability, not a feature. Their chrome switches; their
 * body stays English and says so. */

window.SG = window.SG || {};

(function () {
  var KEY = 'sg_lang';

  var DICT = {
    en: {
      'meta.title': 'Signalens — is that request actually in scope?',
      'meta.description': "Paste what you agreed to, paste the client's message, get a verdict and a reply you can send. Your text is never stored.",
      'meta.appTitle': 'Check a client request — Signalens',

      'nav.privacy': 'Privacy',
      'nav.terms': 'Terms',
      'cta.access': 'Get access',

      'verdict.in_scope': 'In scope',
      'verdict.unclear': 'Unclear',
      'verdict.out_of_scope': 'Out of scope',
      'verdict.lowConfidence': 'Low confidence — the terms genuinely read more than one way here. Treat this as a starting point for the conversation, not a settled answer.',
      'reply.label': 'Reply to the client',
      'changeOrder.pill': 'Change order suggested',
      'changeOrder.summary': 'Change order',
      'changeOrder.what': 'Summary',
      'changeOrder.terms': 'Worth pinning down',

      'hero.eyebrow': 'For freelancers',
      'hero.title': '“Could you just <span class="grad-text">quickly also…</span>”',
      'hero.lead': 'Two “quick” extras a month is a week of unpaid work a year. Paste what you agreed to, paste the message that just arrived, and find out where the request actually stands — with a reply you can send as it is.',
      'hero.note': 'Free · no account · nothing stored',
      'hero.sampleRequestLabel': 'The message that arrived',
      'hero.sampleRequest': 'Hey! Quick one — could you do one more pass on the pricing page? New hero image and a bit more contrast on the buttons.',
      'hero.sampleReasoning': 'Three rounds of revisions are covered. The client has used all three. A fourth round is new work.',
      'hero.sampleReply': 'Happy to take another look at the pricing page — I want it to land properly too. Worth flagging that our agreement covers three rounds, and we wrapped the third last week, so this would be a fourth.',

      'how.eyebrow': 'How it works',
      'how.title': 'Three steps, about a minute',
      'how.s1.title': 'Paste what you agreed to',
      'how.s1.body': 'The contract, the SOW, the proposal they accepted, or the thread where you settled the details.',
      'how.s2.title': 'Paste the client’s message',
      'how.s2.body': 'The one that starts with “small thing” and ends with three days of work.',
      'how.s3.title': 'Get the verdict and the reply',
      'how.s3.body': 'In scope, out of scope, or genuinely unclear — with the exact line it rests on, and wording you can send.',

      'loss.title': 'What is scope creep costing you a year?',
      'loss.rateLabel': 'Your hourly rate',
      'loss.hoursLabel': 'Extra hours a client pulls out of you per project',
      'loss.projectsLabel': 'Projects per month',
      'loss.rateChip': '${n}/hr',
      'loss.hoursChip': '~{n} hrs',
      'loss.days.one': '{n} unpaid work day this year',
      'loss.days.few': '{n} unpaid work days this year',
      'loss.days.many': '{n} unpaid work days this year',
      'loss.intro': 'You are handing over roughly',
      'loss.thousands': 'k',
      'loss.monthly': '${n} a month',
      'loss.weeks': '{n} work weeks a year, unbilled',
      'loss.projWord.one': 'proj',
      'loss.projWord.few': 'proj',
      'loss.projWord.many': 'proj',
      'loss.formula': '~{hours} hrs × {proj} {projWord}/mo × 12 × ${rate}/hr',
      'loss.cta': 'Start billing for them',

      'sample.eyebrow': 'What you get',
      'sample.title': 'All three answers, not just the one you hoped for',
      'sample.lead': 'Real verdicts, so you know what you’re getting before you paste anything.',
      'sample.in_scope.reasoning': 'The agreement lists the Contact page among the five agreed designs, and swapping the form fields is part of designing it. This is covered work.',
      'sample.in_scope.evidence': '“Responsive designs for five (5) pages: Home, Shop, Product Detail, About, and Contact.”',
      'sample.in_scope.reply': 'Yes, that’s covered — the Contact page is one of the five in our agreement, and the field changes are part of designing it. I’ll fold it into the current round and you’ll see it in the next hand-off.',
      'sample.unclear.reasoning': 'The agreement covers the five page designs but says nothing about a mobile app screen. It is neither included nor excluded — the terms are silent, which is a different answer from “no”.',
      'sample.unclear.note': 'Low confidence — the terms genuinely read more than one way here. Treat this as a starting point for the conversation, not a settled answer.',
      'sample.unclear.reply': 'Good question, and honestly our agreement doesn’t say either way — it lists five web pages and stops there. Before I start, can we agree whether the app screen sits inside this phase or becomes its own small piece of work?',
      'sample.out_of_scope.reasoning': 'The agreement covers three rounds of revisions on the agreed page set, and the client has already used all three. A fourth round is new work, even though revisions themselves are covered.',
      'sample.out_of_scope.evidence': '“Includes up to three (3) rounds of revisions across the five agreed page designs. Additional rounds are quoted separately.”',
      'sample.out_of_scope.reply': 'Happy to take another look at the pricing page — I want it to land properly too. One thing worth flagging: our agreement covers three rounds of revisions, and we wrapped the third one last week, so this would be a fourth. I can pick it up as a small add-on with its own timeline and cost, or roll it into the next phase if you’d rather keep everything together. Let me know which you prefer and I’ll send the details across.',
      'sample.out_of_scope.coSummary': 'A fourth revision round on the pricing page, beyond the three included rounds.',
      'sample.out_of_scope.coTerms': 'How many revisions this round covers, when it lands, and how it’s billed.',

      'catch.eyebrow': 'Where it earns its keep',
      'catch.title': 'What this catches',
      'catch.lead': 'Not the obvious ones. The ones that sound reasonable right up until you’ve done the work for free.',
      'catch.i1.title': 'Extras dressed up as small favours',
      'catch.i1.body': '“While you’re in there” is a scope change with a friendlier face.',
      'catch.i2.title': 'Revision rounds past the limit',
      'catch.i2.body': 'The topic is covered. The count isn’t. Those are different questions, and only one of them is in your contract.',
      'catch.i3.title': 'Wording that was always going to be argued about',
      'catch.i3.body': 'Some terms genuinely read two ways. Better to find that out now than halfway through the work.',

      'privacy.eyebrow': 'About your contract',
      'privacy.title': 'You’re pasting a client agreement into a stranger’s website',
      'privacy.lead': 'That deserves a straight answer rather than a link to a policy.',
      'privacy.body': 'The text you paste is used for your check and nothing else. It is not saved to our database, it is not written to our logs, and it is not used to train anything. What we keep is your email address, the verdict, how confident it was, and how long your inputs were — enough to know whether the tool works, and not enough to read your contract.',
      'privacy.link.pre': 'The details are in the',
      'privacy.link.text': 'privacy notice',

      'final.title': 'Check the message that’s sitting in your inbox',
      'final.body': 'It takes about a minute, and you’ll have the reply written.',

      'access.title': 'Where should we send your access?',
      'access.body': 'Signalens is opening in batches. Leave your address and we’ll send you a way in. That’s the only thing we’ll use it for.',
      'access.submit': 'Get access',
      'access.close': 'Close',
      'access.done.title': 'You’re on the list',
      'access.done.body': 'We’ll email you a way in when the next batch opens. Until then, one check is on us — no account needed.',
      'access.done.cta': 'Try a free check',

      'app.step1': 'Step 1 of 2',
      'app.step2': 'Step 2 of 2',
      'app.next': 'Next',
      'app.back': 'Back',
      'app.check': 'Check this request',
      'app.copy': 'Copy reply',
      'app.copied': 'Copied',
      'app.scope.title': 'Paste what you agreed to',
      'app.scope.body': 'The contract, the SOW, the proposal they accepted, or the email thread where you settled the details. Whatever actually defines the work.',
      'app.scope.privacy': 'This text isn’t stored — it’s used for this check and then it’s gone.',
      'app.scope.placeholder': 'Paste the agreement here…',
      'app.scope.example': 'Don’t have it handy? Use an example',
      'app.request.title': 'Paste the client’s message',
      'app.request.recap': 'The agreement you pasted',
      'app.request.example': 'Don’t have one? Use an example',
      'app.request.body': 'The request itself — forwarded email, Slack message, whatever arrived.',
      'app.request.placeholder': '“Hey! Quick one — could you also…”',
      'app.wait.s1': 'Reading your agreement',
      'app.wait.s2': 'Comparing the request',
      'app.wait.s3': 'Drafting your reply',
      'app.wait.note': 'Usually five to fifteen seconds.',
      'app.price.title': 'One check is on us',
      'app.price.sub': 'The next ones are part of the full version.',
      'app.price.titleLimited': 'You’ve used your free check',
      'app.price.subLimited': 'Further checks are part of the full version.',
      'app.price.f1': 'Unlimited checks',
      'app.price.f2': 'Every verdict and reply kept in one place',
      'app.price.f3': 'Several projects, each with its own agreement',
      'app.price.cta': 'Get early access',
      'app.price.dismiss': 'Not now',
      'app.price.done': 'You’re on the list — we’ll email you when it opens.',
      'app.error.title': 'That didn’t come back',
      'app.error.retry': 'Try again',
      'app.what.scope': 'agreement',
      'app.what.request': 'client’s message',
      'app.err.empty': 'Paste the {what} first.',
      'app.err.short': 'Add a bit more — at least {n} characters.',
      'app.err.long': 'That’s over the {n} character limit.',

      'gate.title': 'Where should we send your access?',
      'gate.body': 'Your result appears on this screen in a moment — the address is so we can send you a way in when the full version opens. That’s the only thing we’ll use it for.',
      'gate.submit': 'Show my verdict',

      'cookie.text': 'We use analytics cookies to see how many people finish a check. Nothing you paste is stored either way.',
      'cookie.accept': 'Accept',
      'cookie.decline': 'Decline',

      'legal.langNote': 'This page is available in English only. The English text is the one that governs.',
    },

    ru: {
      'meta.title': 'Signalens — этот запрос вообще входит в рамки?',
      'meta.description': 'Вставьте то, о чём договорились, вставьте сообщение клиента и получите вердикт и готовый ответ. Ваш текст нигде не сохраняется.',
      'meta.appTitle': 'Проверить запрос клиента — Signalens',

      'nav.privacy': 'Приватность',
      'nav.terms': 'Условия',
      'cta.access': 'Получить доступ',

      'verdict.in_scope': 'В рамках',
      'verdict.unclear': 'Неоднозначно',
      'verdict.out_of_scope': 'Вне рамок',
      'verdict.lowConfidence': 'Низкая уверенность — условия здесь действительно читаются по-разному. Считайте это поводом начать разговор, а не окончательным ответом.',
      'reply.label': 'Ответ клиенту',
      'changeOrder.pill': 'Нужен допник',
      'changeOrder.summary': 'Дополнительное соглашение',
      'changeOrder.what': 'Суть',
      'changeOrder.terms': 'Что зафиксировать',

      'hero.eyebrow': 'Для фрилансеров',
      'hero.title': '«А можешь <span class="grad-text">по-быстрому ещё…</span>»',
      'hero.lead': 'Две «мелочи» в месяц — это неделя неоплаченной работы в год. Вставьте то, о чём договорились, вставьте только что пришедшее сообщение и узнайте, где на самом деле стоит запрос — вместе с ответом, который можно отправить как есть.',
      'hero.note': 'Бесплатно · без регистрации · ничего не сохраняем',
      'hero.sampleRequestLabel': 'Пришедшее сообщение',
      'hero.sampleRequest': 'Привет! По-быстрому — прогони ещё раз страницу тарифов? Новую картинку в шапку и кнопки поконтрастнее.',
      'hero.sampleReasoning': 'Три раунда правок входят в договор. Клиент израсходовал все три. Четвёртый раунд — это новая работа.',
      'hero.sampleReply': 'С удовольствием ещё раз посмотрю страницу тарифов — мне тоже важно, чтобы она получилась. Стоит отметить: в договоре три раунда правок, третий мы закрыли на прошлой неделе, так что это будет четвёртый.',

      'how.eyebrow': 'Как это работает',
      'how.title': 'Три шага, около минуты',
      'how.s1.title': 'Вставьте то, о чём договорились',
      'how.s1.body': 'Договор, ТЗ, принятое клиентом предложение или переписку, где вы обо всём условились.',
      'how.s2.title': 'Вставьте сообщение клиента',
      'how.s2.body': 'То самое, которое начинается с «мелочь» и заканчивается тремя днями работы.',
      'how.s3.title': 'Получите вердикт и ответ',
      'how.s3.body': 'В рамках, вне рамок или действительно неоднозначно — с точной строкой, на которой всё держится, и с формулировкой, которую можно отправить.',

      'loss.title': 'Во сколько вам обходятся доделки за год?',
      'loss.rateLabel': 'Ваша часовая ставка',
      'loss.hoursLabel': 'Лишних часов, которые клиент вытягивает из вас на проект',
      'loss.projectsLabel': 'Проектов в месяц',
      'loss.rateChip': '${n}/час',
      'loss.hoursChip': '~{n} ч',
      'loss.days.one': '{n} неоплаченный рабочий день в этом году',
      'loss.days.few': '{n} неоплаченных рабочих дня в этом году',
      'loss.days.many': '{n} неоплаченных рабочих дней в этом году',
      'loss.intro': 'Вы отдаёте примерно',
      'loss.thousands': ' тыс.',
      'loss.monthly': '${n} в месяц',
      // Fractions take the genitive singular in Russian, and the figure is
      // always printed with one decimal, so there is only ever one form.
      'loss.weeks': '{n} рабочей недели в год, не выставленных в счёт',
      'loss.projWord.one': 'проект',
      'loss.projWord.few': 'проекта',
      'loss.projWord.many': 'проектов',
      'loss.formula': '~{hours} ч × {proj} {projWord}/мес × 12 × ${rate}/час',
      'loss.cta': 'Начать выставлять их в счёт',

      'sample.eyebrow': 'Что вы получите',
      'sample.title': 'Все три ответа, а не только тот, на который вы надеялись',
      'sample.lead': 'Настоящие вердикты — чтобы вы знали, что получите, ещё до того как что-то вставите.',
      'sample.in_scope.reasoning': 'В договоре страница «Контакты» перечислена среди пяти согласованных макетов, а замена полей формы — часть её проектирования. Это входит в работу.',
      'sample.in_scope.evidence': '«Адаптивные макеты для пяти (5) страниц: Главная, Каталог, Карточка товара, О нас и Контакты.»',
      'sample.in_scope.reply': 'Да, это входит — «Контакты» одна из пяти страниц по договору, а изменение полей относится к её проектированию. Возьму в текущий раунд, увидите в ближайшей передаче макетов.',
      'sample.unclear.reasoning': 'Договор покрывает пять страниц сайта, но о экране мобильного приложения не говорит ничего. Он не включён и не исключён — условия молчат, а это не то же самое, что «нет».',
      'sample.unclear.note': 'Низкая уверенность — условия здесь действительно читаются по-разному. Считайте это поводом начать разговор, а не окончательным ответом.',
      'sample.unclear.reply': 'Хороший вопрос, и честно — в договоре об этом ничего нет: там перечислены пять веб-страниц и всё. Прежде чем начну, давайте договоримся, входит ли экран приложения в этот этап или становится отдельной небольшой работой.',
      'sample.out_of_scope.reasoning': 'Договор покрывает три раунда правок по согласованному набору страниц, и клиент израсходовал все три. Четвёртый раунд — новая работа, хотя сами правки в договор входят.',
      'sample.out_of_scope.evidence': '«Включено до трёх (3) раундов правок по пяти согласованным макетам. Дополнительные раунды оцениваются отдельно.»',
      'sample.out_of_scope.reply': 'С удовольствием ещё раз посмотрю страницу тарифов — мне тоже важно, чтобы она получилась. Одно стоит отметить: договор покрывает три раунда правок, третий мы закрыли на прошлой неделе, так что это будет четвёртый. Могу взять его отдельной небольшой задачей со своим сроком и стоимостью — или включить в следующий этап, если удобнее держать всё вместе. Скажите, что предпочитаете, и я пришлю детали.',
      'sample.out_of_scope.coSummary': 'Четвёртый раунд правок по странице тарифов, сверх трёх включённых.',
      'sample.out_of_scope.coTerms': 'Сколько правок покрывает этот раунд, когда он выполняется и как оплачивается.',

      'catch.eyebrow': 'Где это окупается',
      'catch.title': 'Что это ловит',
      'catch.lead': 'Не очевидные случаи. Те, которые звучат разумно ровно до момента, когда вы сделали работу бесплатно.',
      'catch.i1.title': 'Довески под видом мелких одолжений',
      'catch.i1.body': '«Раз уж ты всё равно там» — это изменение объёма работ с добрым лицом.',
      'catch.i2.title': 'Раунды правок сверх лимита',
      'catch.i2.body': 'Тема покрыта. Количество — нет. Это разные вопросы, и только один из них есть в вашем договоре.',
      'catch.i3.title': 'Формулировки, о которых всё равно бы поспорили',
      'catch.i3.body': 'Некоторые условия честно читаются двумя способами. Лучше выяснить это сейчас, чем на середине работы.',

      'privacy.eyebrow': 'О вашем договоре',
      'privacy.title': 'Вы вставляете договор с клиентом на сайт незнакомых людей',
      'privacy.lead': 'Это заслуживает прямого ответа, а не ссылки на политику.',
      'privacy.body': 'Вставленный текст используется для вашей проверки и ни для чего больше. Он не сохраняется в нашей базе, не пишется в наши логи и не используется для обучения чего-либо. Мы храним ваш email, вердикт, уровень уверенности и длину каждого из двух полей — этого достаточно, чтобы понять, работает ли инструмент, и недостаточно, чтобы прочитать ваш договор.',
      'privacy.link.pre': 'Подробности — в',
      'privacy.link.text': 'политике приватности',

      'final.title': 'Проверьте сообщение, которое лежит у вас во входящих',
      'final.body': 'Это займёт около минуты, и ответ будет уже написан.',

      'access.title': 'Куда прислать доступ?',
      'access.body': 'Signalens открывается партиями. Оставьте адрес — пришлём вход. Больше мы его ни для чего не используем.',
      'access.submit': 'Получить доступ',
      'access.close': 'Закрыть',
      'access.done.title': 'Вы в списке',
      'access.done.body': 'Напишем, когда откроется следующая партия. А пока одна проверка — за наш счёт, без регистрации.',
      'access.done.cta': 'Попробовать бесплатно',

      'app.step1': 'Шаг 1 из 2',
      'app.step2': 'Шаг 2 из 2',
      'app.next': 'Дальше',
      'app.back': 'Назад',
      'app.check': 'Проверить запрос',
      'app.copy': 'Скопировать ответ',
      'app.copied': 'Скопировано',
      'app.scope.title': 'Вставьте то, о чём договорились',
      'app.scope.body': 'Договор, ТЗ, принятое клиентом предложение или переписку, где вы обо всём условились. Всё, что на самом деле определяет работу.',
      'app.scope.privacy': 'Этот текст не сохраняется — он нужен для этой проверки и после неё исчезает.',
      'app.scope.placeholder': 'Вставьте договор сюда…',
      'app.scope.example': 'Нет под рукой? Возьмите пример',
      'app.request.title': 'Вставьте сообщение клиента',
      'app.request.recap': 'Договор, который вы вставили',
      'app.request.example': 'Нет под рукой? Возьмите пример',
      'app.request.body': 'Сам запрос — пересланное письмо, сообщение в мессенджере, что угодно.',
      'app.request.placeholder': '«Привет! По-быстрому — а можешь ещё…»',
      'app.wait.s1': 'Читаем ваш договор',
      'app.wait.s2': 'Сравниваем с запросом',
      'app.wait.s3': 'Пишем ваш ответ',
      'app.wait.note': 'Обычно от пяти до пятнадцати секунд.',
      'app.price.title': 'Одна проверка — за наш счёт',
      'app.price.sub': 'Следующие входят в полную версию.',
      'app.price.titleLimited': 'Бесплатная проверка израсходована',
      'app.price.subLimited': 'Дальнейшие проверки входят в полную версию.',
      'app.price.f1': 'Проверок без ограничений',
      'app.price.f2': 'Все вердикты и ответы в одном месте',
      'app.price.f3': 'Несколько проектов, у каждого свой договор',
      'app.price.cta': 'Получить ранний доступ',
      'app.price.dismiss': 'Не сейчас',
      'app.price.done': 'Вы в списке — напишем, когда откроем.',
      'app.error.title': 'Ответ не вернулся',
      'app.error.retry': 'Попробовать снова',
      'app.what.scope': 'договор',
      'app.what.request': 'сообщение клиента',
      'app.err.empty': 'Сначала вставьте {what}.',
      'app.err.short': 'Добавьте ещё немного — минимум {n} символов.',
      'app.err.long': 'Это больше лимита в {n} символов.',

      'gate.title': 'Куда прислать доступ?',
      'gate.body': 'Результат появится на этом экране через мгновение — адрес нужен, чтобы прислать вам вход, когда откроется полная версия. Больше мы его ни для чего не используем.',
      'gate.submit': 'Показать вердикт',

      'cookie.text': 'Мы используем аналитические cookie, чтобы видеть, сколько людей доходит до конца проверки. Вставленный текст не сохраняется в любом случае.',
      'cookie.accept': 'Принять',
      'cookie.decline': 'Отклонить',

      'legal.langNote': 'Эта страница доступна только на английском. Юридическую силу имеет английский текст.',
    },
  };

  var lang = 'en';
  var listeners = [];

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function persist(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode */ }
  }

  function detect() {
    var saved = stored();
    if (saved && DICT[saved]) return saved;
    var nav = (navigator.language || 'en').toLowerCase();
    return nav.indexOf('ru') === 0 ? 'ru' : 'en';
  }

  SG.t = function (key, vars) {
    var value = (DICT[lang] || {})[key];
    if (value === undefined) value = DICT.en[key];
    if (value === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        value = value.split('{' + name + '}').join(vars[name]);
      });
    }
    return value;
  };

  SG.lang = function () { return lang; };

  /* Russian needs three forms where English needs two ("72 часа", "36 часов"),
     so callers ask for a key stem and get the right leaf back. */
  SG.plural = function (stem, n) {
    if (lang !== 'ru') return stem + (n === 1 ? '.one' : '.few');
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return stem + '.one';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return stem + '.few';
    return stem + '.many';
  };

  /* Components that build their own text register here so a language switch
     re-renders them instead of leaving half the page in the old language. */
  SG.onLang = function (fn) { listeners.push(fn); fn(lang); };

  function apply() {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = SG.t(el.getAttribute('data-i18n'));
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, value); else el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = SG.t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.placeholder = SG.t(el.getAttribute('data-i18n-ph'));
    });
    document.querySelectorAll('#lang button').forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    listeners.forEach(function (fn) { fn(lang); });
  }

  SG.setLang = function (next) {
    if (!DICT[next] || next === lang) return;
    lang = next;
    persist(next);
    apply();
    if (SG.track) SG.track('lang_switch', { lang: next });
  };

  lang = detect();

  var switcher = document.getElementById('lang');
  if (switcher) {
    switcher.addEventListener('click', function (event) {
      var next = event.target.getAttribute('data-lang');
      if (next) SG.setLang(next);
    });
  }

  // Only touch the DOM when we are not already showing the authored language.
  if (lang !== 'en') apply(); else document.documentElement.lang = 'en';
})();
