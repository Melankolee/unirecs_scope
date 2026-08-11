(function () {
  var $ = function (id) { return document.getElementById(id); };

  var state = {
    limits: { scopeMin: 200, scopeMax: 15000, requestMin: 20, requestMax: 3000 },
    leadId: null,
    exampleUsed: false,
    waitTimers: [],
  };

  var VERDICT_LABEL = {
    in_scope: 'In scope',
    out_of_scope: 'Out of scope',
    unclear: 'Unclear',
  };

  /* ---------- screens ---------- */

  var SCREENS = ['screen-scope', 'screen-request', 'screen-waiting', 'screen-verdict', 'screen-error'];

  function show(id) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
    $('screen-price').hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- counters ---------- */

  function bindCounter(input, counter, min, max) {
    function update() {
      var n = input.value.trim().length;
      counter.textContent = n.toLocaleString('en-US') + ' / ' + max.toLocaleString('en-US');
      counter.classList.toggle('over', n > max);
    }
    input.addEventListener('input', update);
    update();
  }

  function localValidate(value, min, max, what) {
    var n = value.trim().length;
    if (n === 0) return 'Paste the ' + what + ' first.';
    if (n < min) return 'Add a bit more — at least ' + min + ' characters.';
    if (n > max) return "That's over the " + max.toLocaleString('en-US') + ' character limit.';
    return null;
  }

  /* ---------- waiting ---------- */

  function startWaiting() {
    var items = $('waiting-steps').querySelectorAll('li');
    items.forEach(function (li) { li.className = ''; });
    items[0].className = 'active';

    // A spinner for ten seconds reads as a hang. Named steps read as work.
    //
    // Measured round trips are 3-7s, so the original 4s/9s pacing meant the
    // third caption usually never appeared. These land all three inside a fast
    // response and simply hold longer on a slow one.
    state.waitTimers.push(setTimeout(function () {
      items[0].className = 'done';
      items[1].className = 'active';
    }, 1800));
    state.waitTimers.push(setTimeout(function () {
      items[1].className = 'done';
      items[2].className = 'active';
    }, 3800));
  }

  function stopWaiting() {
    state.waitTimers.forEach(clearTimeout);
    state.waitTimers = [];
  }

  /* ---------- verdict ---------- */

  function renderVerdict(v) {
    var status = $('verdict-status');
    status.className = 'verdict-status v-' + v.verdict;
    $('verdict-label').textContent = VERDICT_LABEL[v.verdict] || v.verdict;
    $('verdict-reasoning').textContent = v.reasoning;

    var evidence = $('verdict-evidence');
    if (v.evidence) {
      evidence.textContent = '“' + v.evidence + '”';
      evidence.hidden = false;
    } else {
      evidence.hidden = true;
    }

    var note = $('verdict-confidence');
    if (v.confidence === 'low') {
      note.textContent = 'Low confidence — the terms genuinely read more than one way here. Treat this as a starting point for the conversation, not a settled answer.';
      note.hidden = false;
    } else {
      note.hidden = true;
    }

    $('verdict-reply').textContent = v.reply;

    var co = $('change-order');
    if (v.change_order) {
      $('co-summary').textContent = v.change_order.summary;
      $('co-terms').textContent = v.change_order.suggested_terms;
      co.hidden = false;
      co.open = false;
    } else {
      co.hidden = true;
    }

    show('screen-verdict');
    SG.track('verdict_shown');
    SG.track('verdict_result', { verdict: v.verdict, confidence: v.confidence });

    // The price screen comes after the value has landed, not instead of it.
    setTimeout(showPrice, 2500);
  }

  /* ---------- price ---------- */

  function showPrice(limited) {
    if (limited) {
      $('price-heading').textContent = 'You’ve used your free check';
      $('price-sub').textContent = 'Further checks are part of the full version.';
      SCREENS.forEach(function (s) { $(s).hidden = true; });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    $('screen-price').hidden = false;
    SG.track('price_screen_view', limited ? { reason: 'limit' } : {});
  }

  /* ---------- server calls ---------- */

  function post(path, body) {
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    }).then(function (res) {
      if (res.status === 204) return {};
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Request failed.');
        return data;
      });
    });
  }

  function runCheck() {
    show('screen-waiting');
    startWaiting();

    post('/api/check', {
      leadId: state.leadId,
      scope: $('scope-input').value.trim(),
      request: $('request-input').value.trim(),
    }).then(function (data) {
      stopWaiting();
      renderVerdict(data.verdict);
    }).catch(function (err) {
      stopWaiting();
      SG.track('verdict_error');
      $('fatal-error').textContent = err.message;
      show('screen-error');
    });
  }

  /* ---------- wiring ---------- */

  function init(cfg) {
    if (cfg && cfg.limits) state.limits = cfg.limits;
    if (cfg && cfg.plan) {
      $('price-value').textContent = cfg.plan.price;
      $('price-period').textContent = cfg.plan.period;
    }
    SG.initAnalytics(cfg ? cfg.ga4MeasurementId : '');

    var L = state.limits;
    bindCounter($('scope-input'), $('scope-counter'), L.scopeMin, L.scopeMax);
    bindCounter($('request-input'), $('request-counter'), L.requestMin, L.requestMax);
  }

  $('use-example').addEventListener('click', function () {
    $('scope-input').value = SG.EXAMPLE_SCOPE;
    $('scope-input').dispatchEvent(new Event('input'));
    $('scope-error').textContent = '';
    state.exampleUsed = true;
    SG.track('example_used');
  });

  $('scope-next').addEventListener('click', function () {
    var value = $('scope-input').value;
    var error = localValidate(value, state.limits.scopeMin, state.limits.scopeMax, 'agreement');
    $('scope-error').textContent = error || '';
    if (error) return;

    $('scope-recap-input').value = value;
    if (state.exampleUsed && !$('request-input').value.trim()) {
      $('request-input').value = SG.EXAMPLE_REQUEST;
      $('request-input').dispatchEvent(new Event('input'));
    }
    show('screen-request');
    SG.track('scope_filled', { used_example: state.exampleUsed });
  });

  $('back-to-scope').addEventListener('click', function () {
    $('scope-input').value = $('scope-recap-input').value;
    $('scope-input').dispatchEvent(new Event('input'));
    show('screen-scope');
  });

  // Editing the collapsed agreement on screen 2 must reach the real field.
  $('scope-recap-input').addEventListener('input', function () {
    $('scope-input').value = this.value;
    $('scope-input').dispatchEvent(new Event('input'));
  });

  $('check-btn').addEventListener('click', function () {
    var error = localValidate(
      $('request-input').value, state.limits.requestMin, state.limits.requestMax, "client's message",
    );
    $('request-error').textContent = error || '';
    if (error) return;

    $('gate').hidden = false;
    $('email-input').focus();
  });

  $('gate-cancel').addEventListener('click', function () {
    $('gate').hidden = true;
  });

  $('email-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') $('email-submit').click();
  });

  $('email-submit').addEventListener('click', function () {
    var button = this;
    var marks = SG.marks();
    $('email-error').textContent = '';
    button.disabled = true;

    post('/api/lead', { email: $('email-input').value, marks: marks })
      .then(function (data) {
        $('gate').hidden = true;
        button.disabled = false;

        if (data.limited) {
          showPrice(true);
          return;
        }
        state.leadId = data.leadId;
        SG.track('email_submit');
        // No extra click: the address was the last thing standing between the
        // visitor and the answer.
        runCheck();
      })
      .catch(function (err) {
        button.disabled = false;
        $('email-error').textContent = err.message;
      });
  });

  $('copy-reply').addEventListener('click', function () {
    var button = this;
    var text = $('verdict-reply').textContent;
    var done = function () {
      button.textContent = 'Copied';
      setTimeout(function () { button.textContent = 'Copy reply'; }, 2000);
      SG.track('reply_copied');
      post('/api/event', { leadId: state.leadId, type: 'reply_copied' }).catch(function () {});
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
      ta.remove();
    }
  });

  $('change-order').addEventListener('toggle', function () {
    if (this.open) SG.track('change_order_open');
  });

  $('price-cta').addEventListener('click', function () {
    this.disabled = true;
    $('price-note').textContent = 'You’re on the list — we’ll email you when it opens.';
    SG.track('price_cta_click');
    post('/api/event', { leadId: state.leadId, type: 'price_cta' }).catch(function () {});
  });

  // A separate signal from silence: declining and ignoring are different things.
  $('price-dismiss').addEventListener('click', function () {
    SG.track('price_dismiss');
    $('screen-price').hidden = true;
  });

  $('retry-btn').addEventListener('click', function () {
    if (state.leadId) runCheck(); else show('screen-request');
  });

  SG.config().then(init).catch(function () { init(null); });
})();
