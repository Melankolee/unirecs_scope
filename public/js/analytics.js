/* Analytics, in two channels that answer to different rules.
 *
 * The first-party channel goes to `/api/track` and runs for everyone, always.
 * Nothing is stored on the visitor's device to make it work — the row is
 * written on our server, from a request the browser was making anyway — so the
 * cookie banner has nothing to say about it. This is the channel the funnel is
 * read from: it loses nobody to a blocker, an unanswered banner or a click that
 * leaves the page.
 *
 * GA4 is the second channel and the one the banner governs, because it writes
 * `_ga` to the device and hands the data to Google. Where the law requires
 * asking, we ask; elsewhere `consentRequired` comes back false and it simply
 * runs. Either way a stored answer wins: someone who pressed Decline has said
 * something, and being abroad does not un-say it.
 *
 * Every event carries product: "scopeguard" — the product is now called
 * Mailtrick, but this string is an analytics key, and renaming it would split
 * every report at the rename date for no gain. */

window.SG = window.SG || {};

(function () {
  var CONSENT_KEY = 'sg_consent';
  var MARKS_KEY = 'sg_marks';
  var MARK_KEYS = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term'];

  var measurementId = '';
  var loaded = false;
  var queue = [];

  /* Whether to ask before loading GA4. True until the server says otherwise, so
     a failed config request asks rather than assumes. */
  var askFirst = true;

  function stored() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* private mode */ }
  }

  /* An answer that was actually given beats the default in both directions.
     Automatic consent is deliberately not written to storage: a visitor who is
     asked later should be asked, not found to have agreed while they travelled. */
  function consent() {
    var answer = stored();
    if (answer) return answer;
    return askFirst ? null : 'granted';
  }

  /* gclid and utm_* are read once on entry and kept for the session, so they
     still travel with the email several screens later. */
  function captureMarks() {
    var stash = {};
    try { stash = JSON.parse(sessionStorage.getItem(MARKS_KEY) || '{}'); } catch (e) { stash = {}; }

    var params = new URLSearchParams(window.location.search);
    var changed = false;
    MARK_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value && !stash[key]) { stash[key] = value.slice(0, 255); changed = true; }
    });

    if (changed) {
      try { sessionStorage.setItem(MARKS_KEY, JSON.stringify(stash)); } catch (e) { /* ignore */ }
    }
    return stash;
  }

  /* `sendBeacon` is what makes this survive the click that leaves the page. The
     old in-memory queue lost every pending event on a navigation — which is
     precisely where one funnel step becomes the next, so the events worth most
     were the ones most likely to be dropped. */
  function record(name, params) {
    var body = JSON.stringify({
      name: name,
      params: params || {},
      path: window.location.pathname,
    });

    try {
      if (navigator.sendBeacon
        && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))) {
        return;
      }
    } catch (e) { /* fall through to fetch */ }

    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
      }).catch(function () { /* a lost event is not worth a broken page */ });
    } catch (e) { /* nothing else to try */ }
  }

  function loadGtag() {
    if (loaded || !measurementId) return;
    loaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(s);
  }

  function flush() {
    if (!loaded) return;
    while (queue.length) {
      var item = queue.shift();
      window.gtag('event', item.name, item.params);
    }
  }

  SG.marks = captureMarks;

  SG.track = function (name, params) {
    // First-party first, and unconditionally. Whatever happens with GA4 below,
    // this event is already ours.
    record(name, params);

    // `product` belongs to GA4, where one property can hold several products.
    // Our own table is named after this one, so repeating it in every row would
    // be noise.
    var payload = Object.assign({ product: 'scopeguard' }, params || {});
    var answer = consent();

    if (answer === 'granted' && measurementId) {
      loadGtag();
      window.gtag('event', name, payload);
      return;
    }
    if (answer === 'denied') return;
    queue.push({ name: name, params: payload });
  };

  SG.grantConsent = function () {
    setConsent('granted');
    loadGtag();
    flush();
  };

  SG.denyConsent = function () {
    setConsent('denied');
    queue.length = 0;
  };

  SG.initAnalytics = function (cfg) {
    var settings = cfg || {};
    measurementId = settings.ga4MeasurementId || '';
    askFirst = settings.consentRequired !== false;

    captureMarks();
    if (consent() === 'granted') { loadGtag(); flush(); }
    if (askFirst) SG.mountCookieBar();
  };

  SG.mountCookieBar = function () {
    // `stored`, not `consent`: where consent is automatic there is no bar to
    // mount, and where it is not, only a real answer should dismiss it.
    if (stored() !== null) return;

    // The bar has no markup to fall back on — it only exists when consent is
    // still unanswered — so its copy is written here rather than in strings.js,
    // where a key would just point back at this one caller.
    var bar = document.createElement('div');
    bar.className = 'cookie';
    bar.innerHTML =
      '<div class="cookie__inner">' +
      '<span>We use analytics cookies to see how many people finish a check. </span>' +
      '<div class="cookie__actions">' +
      '<button class="btn-ghost" data-cookie="deny">Decline</button>' +
      '<button class="btn-primary btn-primary--sm" data-cookie="accept">Accept</button>' +
      '</div></div>';

    var link = document.createElement('a');
    link.href = '/privacy.html';
    link.textContent = 'Privacy';
    bar.querySelector('span').appendChild(link);

    bar.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-cookie');
      if (!action) return;
      if (action === 'accept') SG.grantConsent(); else SG.denyConsent();
      bar.remove();
    });

    document.body.appendChild(bar);
  };

  SG.config = function () {
    return fetch('/api/config').then(function (r) { return r.json(); });
  };
})();
