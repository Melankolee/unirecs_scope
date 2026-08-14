(function () {
  var $ = function (id) { return document.getElementById(id); };

  var state = {
    limits: { scopeMin: 200, scopeMax: 15000, requestMin: 20, requestMax: 3000 },
    leadId: null,
    exampleUsed: false,
    attachUsed: false,
    verdict: null,
    priceLimited: false,
    waitTimers: [],
    waitTick: null,
    waitStart: 0,
  };

  /* ---------- screens ---------- */

  var SCREENS = ['screen-scope', 'screen-request', 'screen-waiting', 'screen-verdict', 'screen-error'];

  function show(id) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
    $('screen-price').hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- counters ---------- */

  function bindCounter(input, counter, max) {
    function update() {
      var n = input.value.trim().length;
      counter.textContent = n.toLocaleString('en-US') + ' / ' + max.toLocaleString('en-US');
      counter.classList.toggle('is-over', n > max);
    }
    input.addEventListener('input', update);
    update();
  }

  /* ---------- attachment ----------
   *
   * The agreement usually exists as a file, and retyping it is where the check
   * gets abandoned. SG.readDocument turns the file into text in the browser;
   * nothing but that text reaches the field, and nothing but the field is ever
   * sent. The file name is shown back while the file is being read but never
   * travels — not to the server and not into an analytics event, where
   * "Contract — Acme Ltd.docx" would be the client's name in a report.
   *
   * Nothing is said once the text lands: the chip is only there while the field
   * is empty (styles.css), and the text now in the field is the better receipt
   * anyway. The line is cleared either way so that a field emptied later brings
   * back the paperclip and not the name of a file whose text has just gone. */

  function attach(file) {
    if (!file) return;
    var input = $('scope-input');

    $('scope-error').textContent = '';
    $('attach-name').textContent = SG.t('app.attach.reading', { name: file.name });

    SG.readDocument(file).then(function (text) {
      // Appended, not substituted: someone who has already pasted one document
      // is adding a second, and losing the first to a click would be worse than
      // a field they have to tidy.
      var current = input.value.trim();
      input.value = current ? current + '\n\n' + text : text;
      input.dispatchEvent(new Event('input'));

      state.attachUsed = true;
      $('attach-name').textContent = '';
      SG.track('attachment_used', { kind: file.name.split('.').pop().toLowerCase() });
    }).catch(function (err) {
      $('attach-name').textContent = '';
      $('scope-error').textContent = SG.t(err.key || 'app.attach.err.read', err.params);
      SG.track('attachment_error', { reason: err.key || 'unknown' });
    });
  }

  function localValidate(value, min, max, whatKey) {
    var n = value.trim().length;
    if (n === 0) return SG.t('app.err.empty', { what: SG.t(whatKey) });
    if (n < min) return SG.t('app.err.short', { n: min });
    if (n > max) return SG.t('app.err.long', { n: max.toLocaleString('en-US') });
    return null;
  }

  /* ---------- waiting ----------
   *
   * A spinner for ten seconds reads as a hang. Named steps read as work, and
   * the ring gives the wait a shape.
   *
   * The percentage is honest about what it is: the server sends no progress, so
   * it eases toward 95% on a curve tuned to the measured 3-7s round trip and
   * waits there. It never claims to be finished before the answer arrives. */

  var WAIT_CURVE_MS = 6000;
  var WAIT_CEILING = 0.95;

  function setStep(index) {
    var lines = $('loader-lines').querySelectorAll('.loader__line');
    lines.forEach(function (line, i) {
      line.className = 'loader__line' + (i < index ? ' is-done' : i === index ? ' is-active' : '');
    });
    $('loader-steps').querySelectorAll('span').forEach(function (span, i) {
      span.classList.toggle('is-reached', i <= index);
    });
  }

  function paint(p) {
    $('loader-ring').style.setProperty('--p', p);
    $('loader-percent').textContent = Math.round(p * 100) + '%';
  }

  function startWaiting() {
    state.waitStart = Date.now();
    setStep(0);
    paint(0);

    state.waitTick = setInterval(function () {
      var elapsed = Date.now() - state.waitStart;
      paint(WAIT_CEILING * (1 - Math.exp(-elapsed / WAIT_CURVE_MS)));
    }, 80);

    // Timed so all three captions land inside a fast response and simply hold
    // longer on a slow one.
    state.waitTimers.push(setTimeout(function () { setStep(1); }, 1800));
    state.waitTimers.push(setTimeout(function () { setStep(2); }, 3800));
  }

  function stopWaiting() {
    state.waitTimers.forEach(clearTimeout);
    state.waitTimers = [];
    clearInterval(state.waitTick);
    state.waitTick = null;
    paint(1);
  }

  /* ---------- verdict ---------- */

  function renderVerdict(v) {
    var status = $('verdict-status');
    status.className = 'verdict__status is-' + v.verdict;
    status.textContent = SG.t('verdict.' + v.verdict);
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
      note.textContent = SG.t('verdict.lowConfidence');
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
      $('verdict-pill-row').hidden = false;
    } else {
      co.hidden = true;
      $('verdict-pill-row').hidden = true;
    }
  }

  function showVerdict(v) {
    state.verdict = v;
    renderVerdict(v);
    $('change-order').open = false;

    show('screen-verdict');
    SG.track('verdict_shown');
    SG.track('verdict_result', { verdict: v.verdict, confidence: v.confidence });

    // The price screen comes after the value has landed, not instead of it.
    setTimeout(showPrice, 2500);
  }

  /* ---------- price ---------- */

  function renderPrice() {
    $('price-heading').textContent = SG.t(state.priceLimited ? 'app.price.titleLimited' : 'app.price.title');
    $('price-sub').textContent = SG.t(state.priceLimited ? 'app.price.subLimited' : 'app.price.sub');
  }

  function showPrice(limited) {
    if (limited) {
      state.priceLimited = true;
      SCREENS.forEach(function (s) { $(s).hidden = true; });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    renderPrice();
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
      showVerdict(data.verdict);
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
    SG.initAnalytics(cfg ? cfg.ga4MeasurementId : '');

    var L = state.limits;
    bindCounter($('scope-input'), $('scope-counter'), L.scopeMax);
    bindCounter($('request-input'), $('request-counter'), L.requestMax);
  }

  /* Nothing fills a field on its own. Both examples are behind their own
     button, on the screen the field belongs to — a value that appears in a
     box the visitor never touched reads as their own text a screen later. */
  $('use-example').addEventListener('click', function () {
    $('scope-input').value = SG.EXAMPLE_SCOPE;
    $('scope-input').dispatchEvent(new Event('input'));
    $('scope-error').textContent = '';
    state.exampleUsed = true;
    SG.track('example_used', { field: 'scope' });
  });

  $('use-example-request').addEventListener('click', function () {
    $('request-input').value = SG.EXAMPLE_REQUEST;
    $('request-input').dispatchEvent(new Event('input'));
    $('request-error').textContent = '';
    state.exampleUsed = true;
    SG.track('example_used', { field: 'request' });
  });

  $('attach-btn').addEventListener('click', function () {
    $('attach-input').click();
  });

  $('attach-input').addEventListener('change', function () {
    attach(this.files[0]);
    // Cleared so the same file picked twice still fires a change event.
    this.value = '';
  });

  /* Dragging the contract onto the field is the same gesture as the paperclip,
     and the browser's own handling of a dropped file — navigate away to it —
     would throw away whatever is already in the field. Text drops are left
     alone: dropping selected text into a textarea already does the right
     thing. */
  (function () {
    var field = $('scope-input');
    var carriesFile = function (event) {
      var types = event.dataTransfer && event.dataTransfer.types;
      return !!types && Array.prototype.indexOf.call(types, 'Files') !== -1;
    };

    ['dragenter', 'dragover'].forEach(function (name) {
      field.addEventListener(name, function (event) {
        if (!carriesFile(event)) return;
        event.preventDefault();
        field.classList.add('is-drop');
      });
    });

    ['dragleave', 'dragend'].forEach(function (name) {
      field.addEventListener(name, function () { field.classList.remove('is-drop'); });
    });

    field.addEventListener('drop', function (event) {
      if (!carriesFile(event)) return;
      event.preventDefault();
      field.classList.remove('is-drop');
      attach(event.dataTransfer.files[0]);
    });
  })();

  $('scope-next').addEventListener('click', function () {
    var value = $('scope-input').value;
    var error = localValidate(value, state.limits.scopeMin, state.limits.scopeMax, 'app.what.scope');
    $('scope-error').textContent = error || '';
    if (error) return;

    $('scope-recap-input').value = value;
    show('screen-request');
    SG.track('scope_filled', { used_example: state.exampleUsed, used_attachment: state.attachUsed });
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
      $('request-input').value, state.limits.requestMin, state.limits.requestMax, 'app.what.request',
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
      button.textContent = SG.t('app.copied');
      setTimeout(function () { button.textContent = SG.t('app.copy'); }, 2000);
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
    $('price-note').textContent = SG.t('app.price.done');
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
