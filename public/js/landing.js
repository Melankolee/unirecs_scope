(function () {
  var $ = function (id) { return document.getElementById(id); };

  SG.config().then(function (cfg) {
    SG.initAnalytics(cfg.ga4MeasurementId);
  }).catch(function () {
    SG.initAnalytics('');
  });

  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      SG.track('cta_click', { placement: el.getAttribute('data-cta') });
    });
  });

  /* ---------- access form ----------
   *
   * Three of the four CTAs ask for an address instead of sending the visitor
   * straight into the tool. One box serves all three, and the placement travels
   * with every event so the report can tell which of them earned the email.
   *
   * The event is `access_submit`, never `email_submit`: that name belongs to the
   * gate before the verdict, and the whole test rests on reading it against
   * `verdict_shown`. Two different questions, two different counters. */

  var access = $('access');

  if (access) {
    var placement = 'header';

    var openAccess = function (from) {
      placement = from;
      access.hidden = false;
      // Reopened after a successful signup, the box is already on its thank-you
      // state and there is no field to put the cursor in.
      if (!$('access-form').hidden) $('access-email').focus();
      SG.track('access_open', { placement: from });
    };

    var closeAccess = function () {
      access.hidden = true;
      $('access-error').textContent = '';
    };

    document.querySelectorAll('[data-access]').forEach(function (el) {
      el.addEventListener('click', function () {
        openAccess(el.getAttribute('data-cta') || 'unknown');
      });
    });

    $('access-close').addEventListener('click', closeAccess);

    // Clicking the dark surround is the other way out people reach for.
    access.addEventListener('click', function (event) {
      if (event.target === access) closeAccess();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !access.hidden) closeAccess();
    });

    $('access-email').addEventListener('keydown', function (event) {
      if (event.key === 'Enter') $('access-submit').click();
    });

    $('access-submit').addEventListener('click', function () {
      var button = this;
      $('access-error').textContent = '';
      button.disabled = true;

      fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: $('access-email').value, marks: SG.marks() }),
      }).then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Request failed.');
          return data;
        });
      }).then(function () {
        button.disabled = false;
        $('access-form').hidden = true;
        $('access-done').hidden = false;
        SG.track('access_submit', { placement: placement });
      }).catch(function (err) {
        button.disabled = false;
        $('access-error').textContent = err.message;
      });
    });
  }

  /* ---------- cost calculator ----------
   *
   * Everything on the card derives from three chips the visitor picks, and the
   * formula is printed under the number rather than hidden. A calculator that
   * won't show its working is an advert, not an argument. */

  var HOURS_PER_WEEK = 40;
  var HOURS_PER_DAY = 8;

  var rateChips = $('rate-chips');
  var hoursChips = $('hours-chips');
  var projChips = $('proj-chips');

  if (rateChips && hoursChips && projChips) {
    var rate = 40;
    var extraHours = 5;
    var projects = 3;

    function pressed(group, attr, fallback) {
      var hit = group.querySelector('[aria-pressed="true"]');
      return hit ? Number(hit.getAttribute(attr)) : fallback;
    }

    function locale() { return SG.lang() === 'ru' ? 'ru-RU' : 'en-US'; }

    function decimal(n) {
      return n.toFixed(1).replace(/\.0$/, '').replace('.', SG.lang() === 'ru' ? ',' : '.');
    }

    /* $7,200 reads as an invoice; $7.2k reads as a loss. Below a thousand the
       shorthand stops being shorthand, so the plain number stays. */
    function money(n) {
      if (n < 1000) return '$' + n.toLocaleString(locale());
      var k = n / 1000;
      var rounded = k >= 10 ? String(Math.round(k)) : decimal(k);
      return '$' + rounded + SG.t('loss.thousands');
    }

    function renderLoss() {
      var hours = extraHours * projects * 12;
      var lost = rate * hours;
      var days = Math.round(hours / HOURS_PER_DAY);

      $('loss-days').textContent = SG.t(SG.plural('loss.days', days), { n: days });
      $('loss-figure').textContent = money(lost);
      $('loss-monthly').textContent = SG.t('loss.monthly', { n: Math.round(lost / 12).toLocaleString(locale()) });
      $('loss-weeks').textContent = SG.t('loss.weeks', { n: decimal(hours / HOURS_PER_WEEK) });
      $('loss-formula').textContent = SG.t('loss.formula', {
        hours: extraHours,
        proj: projects,
        projWord: SG.t(SG.plural('loss.projWord', projects)),
        rate: rate,
      });

      // One dot per unpaid work day. The dots shrink rather than get truncated:
      // a capped grid would stop matching the number printed above it.
      var box = $('loss-dots');
      box.className = 'loss__dots' + (days > 96 ? ' is-denser' : days > 48 ? ' is-dense' : '');
      box.textContent = '';
      for (var i = 0; i < days; i++) box.appendChild(document.createElement('span'));
    }

    // Chip captions carry units, so they are rebuilt on a language switch too.
    function relabel(group, attr, key) {
      group.querySelectorAll('button').forEach(function (b) {
        b.textContent = SG.t(key, { n: b.getAttribute(attr) });
      });
    }

    function bindChips(group, attr, onPick) {
      group.addEventListener('click', function (event) {
        var value = event.target.getAttribute && event.target.getAttribute(attr);
        if (!value) return;
        group.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-pressed', b === event.target ? 'true' : 'false');
        });
        onPick(Number(value));
        renderLoss();
        SG.track('loss_calc_change', { rate: rate, hours: extraHours, projects: projects });
      });
    }

    rate = pressed(rateChips, 'data-rate', rate);
    extraHours = pressed(hoursChips, 'data-hours', extraHours);
    projects = pressed(projChips, 'data-proj', projects);

    bindChips(rateChips, 'data-rate', function (v) { rate = v; });
    bindChips(hoursChips, 'data-hours', function (v) { extraHours = v; });
    bindChips(projChips, 'data-proj', function (v) { projects = v; });

    SG.onLang(function () {
      relabel(rateChips, 'data-rate', 'loss.rateChip');
      relabel(hoursChips, 'data-hours', 'loss.hoursChip');
      renderLoss();
    });
  }

  /* ---------- verdict samples ---------- */

  var tabs = $('sample-tabs');
  if (tabs) {
    tabs.addEventListener('click', function (event) {
      var name = event.target.getAttribute && event.target.getAttribute('data-sample');
      if (!name) return;

      tabs.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-selected', b === event.target ? 'true' : 'false');
      });
      document.querySelectorAll('[data-sample-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-sample-panel') !== name;
      });
      SG.track('sample_verdict_view', { verdict: name });
    });
  }
})();
