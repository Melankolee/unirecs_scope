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
      'meta.description': "Paste what you agreed to, paste the client's message, get a verdict and a reply you can send.",
      'meta.appTitle': 'Check a client request — Signalens',

      'nav.privacy': 'Privacy',
      'nav.terms': 'Terms',
      'cta.access': 'Get access',
      'cta.try': 'Try a free check',

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
      'hero.note': 'Free · no account · about a minute',
      'hero.sampleRequestLabel': 'Client request',
      'hero.sampleRequest': '“Can you do one more round on the pricing page?”',
      'hero.sampleReasoning': 'Three rounds are covered. All three are used.',
      'hero.sampleReply': 'Happy to take another look — our agreement covers three rounds and we wrapped the third last week, so I’d quote this fourth one separately.',

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
      'sample.cta': 'Try now',
      'sample.out_of_scope.reply': 'Happy to take another look at the pricing page. Our agreement covers three rounds of revisions and we wrapped the third last week, so this would be a fourth — I can quote it as a small add-on, or roll it into the next phase if you’d rather keep everything together.',

      'feat.eyebrow': 'What sets Signalens apart',
      'feat.title': 'Two features you’ll rely on every single day.',
      'feat.sow.tag': 'Every plan · New',
      'feat.sow.title': 'SOW Health & Risk Report',
      'feat.sow.body': 'When you upload a contract PDF, Signalens scores it against 10 industry standards — surfacing weak clauses, missing protections, and exact language to add before anything goes wrong.',
      'feat.sow.p1': 'Pinpoints high-risk gaps: no kill fee, vague deliverables, missing revision limits',
      'feat.sow.p2': 'Lists all protective clauses already present in your contract',
      'feat.sow.p3': 'Gives you exact clause language to add — copy and paste ready',
      'feat.sow.cta': 'Try now',
      'feat.ctx.tag': 'Scope analysis · Smarter',
      'feat.ctx.title': 'Context-Aware Evaluation',
      'feat.ctx.body': 'Most tools only accept copy-paste. Signalens understands context — paste the client’s exact message or simply describe what they’re asking. Both get the same precision verdict.',
      'feat.ctx.exactLabel': 'Exact message',
      'feat.ctx.exact': '“Can you also build a mobile app version?”',
      'feat.ctx.or': 'or',
      'feat.ctx.ownLabel': 'Your own words',
      'feat.ctx.own': '“Client is asking for a mobile app”',

      'cost.eyebrow': 'The hidden cost',
      'cost.title': 'One “small ask” just cost you $1,400.',
      'cost.story': '“You finish the logo. The client says: <b>‘Can you also do the brand guidelines?’</b> You say yes — it’s just 2 more hours. Then comes the social kit. Then the pitch deck. You’ve worked 14 extra hours and invoiced for zero.”',
      'cost.note': 'This is scope creep. It happens to every designer, developer, writer, and consultant — and most never bill for it. Not because they don’t want to. Because they don’t have the words.',
      'cost.s1.figure': '71%',
      'cost.s1.body': 'of freelancers deal with scope creep on most projects',
      'cost.s1.source': 'AND CO Freelancer Report, 2019',
      'cost.s1.note': 'Freelancers who reported that scope creep happens on most or all of their projects.',
      'cost.s2.figure': '63%',
      'cost.s2.body': 'never invoice for the out-of-scope work they do',
      'cost.s2.source': 'Freelancing in America, Upwork × Freelancers Union, 2019',
      'cost.s2.note': 'Of the freelancers who do work outside the agreement, the share who never bill for any of it.',
      'cost.s3.figure': '$9,000+',
      'cost.s3.body': 'average annual loss from unbilled out-of-scope work',
      'cost.s3.source': 'est. based on BLS median rate × avg. extra hours',
      'cost.s3.note': 'An estimate, not a surveyed figure: a median hourly rate multiplied by the extra hours freelancers report giving away over a year.',
      'cost.close': 'Signalens spots it <b>before you say yes</b> — and gives you the exact words to respond.',

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
      'app.scope.placeholder': 'Paste the agreement here…',
      'app.scope.example': 'Don’t have it handy? Use an example',
      'app.scope.attach': 'Attach a file',
      'app.attach.reading': 'Reading {name}…',
      'app.attach.added': 'Text from {name}',
      'app.attach.err.type': 'That format can’t be read here — attach a .docx, .txt or .md, or paste the text.',
      'app.attach.err.legacy': 'Old .doc files can’t be read here. Save it as .docx, or paste the text.',
      'app.attach.err.big': 'That file is over {n} MB. Paste the part that matters instead.',
      'app.attach.err.empty': 'No text came out of that file. If it’s a scan or a set of images, paste the text instead.',
      'app.attach.err.read': 'That file wouldn’t open. Paste the text instead.',
      'app.attach.err.browser': 'This browser can’t unpack a .docx. Paste the text instead.',
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

      'cookie.text': 'We use analytics cookies to see how many people finish a check.',
      'cookie.accept': 'Accept',
      'cookie.decline': 'Decline',

      'legal.langNote': 'This page is available in English only. The English text is the one that governs.',
    },

    ru: {
      'meta.title': 'Signalens — этот запрос вообще входит в рамки?',
      'meta.description': 'Вставьте то, о чём договорились, вставьте сообщение клиента и получите вердикт и готовый ответ.',
      'meta.appTitle': 'Проверить запрос клиента — Signalens',

      'nav.privacy': 'Приватность',
      'nav.terms': 'Условия',
      'cta.access': 'Получить доступ',
      'cta.try': 'Попробовать бесплатно',

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
      'hero.note': 'Бесплатно · без регистрации · около минуты',
      'hero.sampleRequestLabel': 'Запрос клиента',
      'hero.sampleRequest': '«Прогонишь ещё раз страницу тарифов?»',
      'hero.sampleReasoning': 'Три раунда правок входят в договор. Все три израсходованы.',
      'hero.sampleReply': 'С удовольствием посмотрю ещё раз — в договоре три раунда правок, третий мы закрыли на прошлой неделе, так что четвёртый я оценю отдельно.',

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
      'sample.cta': 'Попробовать',
      'sample.out_of_scope.reply': 'С удовольствием ещё раз посмотрю страницу тарифов. Договор покрывает три раунда правок, третий мы закрыли на прошлой неделе, так что это будет четвёртый — могу оценить его отдельной небольшой задачей или включить в следующий этап, если удобнее держать всё вместе.',

      'feat.eyebrow': 'Чем Signalens отличается',
      'feat.title': 'Две возможности, без которых уже не обойтись.',
      'feat.sow.tag': 'В любом тарифе · Новое',
      'feat.sow.title': 'Отчёт о рисках в договоре',
      'feat.sow.body': 'Загрузите договор в PDF — Signalens оценит его по 10 отраслевым стандартам: покажет слабые формулировки, недостающие защиты и точные пункты, которые стоит добавить, пока ничего не случилось.',
      'feat.sow.p1': 'Находит опасные пробелы: нет платы за отмену, размытые результаты, не ограничены раунды правок',
      'feat.sow.p2': 'Перечисляет все защитные пункты, которые в договоре уже есть',
      'feat.sow.p3': 'Даёт готовые формулировки пунктов — скопировать и вставить',
      'feat.sow.cta': 'Попробовать',
      'feat.ctx.tag': 'Разбор запроса · Точнее',
      'feat.ctx.title': 'Понимает контекст',
      'feat.ctx.body': 'Другие инструменты принимают только копипаст. Signalens понимает контекст: вставьте дословное сообщение клиента или просто опишите, о чём он просит. Вердикт будет одинаково точным.',
      'feat.ctx.exactLabel': 'Дословное сообщение',
      'feat.ctx.exact': '«Сделаешь ещё и мобильную версию приложения?»',
      'feat.ctx.or': 'или',
      'feat.ctx.ownLabel': 'Своими словами',
      'feat.ctx.own': '«Клиент просит мобильное приложение»',

      'cost.eyebrow': 'Скрытая цена',
      'cost.title': 'Одна «мелкая просьба» только что стоила вам $1 400.',
      'cost.story': '«Вы закончили логотип. Клиент говорит: <b>„А брендбук тоже сделаешь?“</b> Вы соглашаетесь — это же всего 2 часа. Потом появляется набор для соцсетей. Потом презентация. Вы отработали 14 лишних часов и выставили счёт на ноль.»',
      'cost.note': 'Это и есть расползание объёма работ. Оно случается с каждым дизайнером, разработчиком, копирайтером и консультантом — и почти никто за него не платит. Не потому, что не хотят. Потому что не находят слов.',
      'cost.s1.figure': '71%',
      'cost.s1.body': 'фрилансеров сталкиваются с расползанием объёма на большинстве проектов',
      'cost.s1.source': 'AND CO Freelancer Report, 2019',
      'cost.s1.note': 'Фрилансеры, ответившие, что расползание объёма происходит на большинстве их проектов или на всех.',
      'cost.s2.figure': '63%',
      'cost.s2.body': 'никогда не выставляют счёт за работу вне рамок договора',
      'cost.s2.source': 'Freelancing in America, Upwork × Freelancers Union, 2019',
      'cost.s2.note': 'Среди тех, кто делает работу вне договора, — доля тех, кто не выставляет за неё счёт вообще никогда.',
      'cost.s3.figure': '$9 000+',
      'cost.s3.body': 'средняя годовая потеря на неоплаченной работе вне рамок',
      'cost.s3.source': 'оценка: медианная ставка BLS × средние лишние часы',
      'cost.s3.note': 'Это оценка, а не результат опроса: медианная часовая ставка, умноженная на лишние часы, которые фрилансеры отдают за год.',
      'cost.close': 'Signalens замечает это <b>до того, как вы согласились</b>, — и даёт точные слова для ответа.',

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
      'app.scope.placeholder': 'Вставьте договор сюда…',
      'app.scope.example': 'Нет под рукой? Возьмите пример',
      'app.scope.attach': 'Прикрепить файл',
      'app.attach.reading': 'Читаю {name}…',
      'app.attach.added': 'Текст из {name}',
      'app.attach.err.type': 'Такой формат здесь не читается — прикрепите .docx, .txt или .md либо вставьте текст.',
      'app.attach.err.legacy': 'Старый .doc здесь не читается. Пересохраните в .docx или вставьте текст.',
      'app.attach.err.big': 'Файл больше {n} МБ. Вставьте текстом ту часть, которая нужна.',
      'app.attach.err.empty': 'Из этого файла не извлёкся текст. Если это скан или картинки, вставьте текст вручную.',
      'app.attach.err.read': 'Файл не открылся. Вставьте текст вручную.',
      'app.attach.err.browser': 'Этот браузер не умеет распаковывать .docx. Вставьте текст вручную.',
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

      'cookie.text': 'Мы используем аналитические cookie, чтобы видеть, сколько людей доходит до конца проверки.',
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
