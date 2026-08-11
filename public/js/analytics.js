/* GA4 wrapper. Every event carries product: "scopeguard" — the product is now
 * called Signalens, but this string is an analytics key, and renaming it would
 * split every report at the rename date for no gain.
 *
 * Analytics cookies are not set until the visitor accepts. Events fired before
 * a decision are queued and flushed on accept; if the visitor declines, they are
 * dropped. That costs us some conversion data from decliners — which is the
 * honest price of the banner, not a bug to work around. */

window.SG = window.SG || {};

(function () {
  var CONSENT_KEY = 'sg_consent';
  var MARKS_KEY = 'sg_marks';
  var MARK_KEYS = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term'];

  var measurementId = '';
  var loaded = false;
  var queue = [];

  function consent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* private mode */ }
  }

  /* gclid and utm_* are read once on entry and kept for the session, so they
     still travel with the email several screens later. */
  function captureMarks() {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(MARKS_KEY) || '{}'); } catch (e) { stored = {}; }

    var params = new URLSearchParams(window.location.search);
    var changed = false;
    MARK_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value && !stored[key]) { stored[key] = value.slice(0, 255); changed = true; }
    });

    if (changed) {
      try { sessionStorage.setItem(MARKS_KEY, JSON.stringify(stored)); } catch (e) { /* ignore */ }
    }
    return stored;
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
    var payload = Object.assign({ product: 'scopeguard' }, params || {});
    if (consent() === 'granted' && measurementId) {
      loadGtag();
      window.gtag('event', name, payload);
      return;
    }
    if (consent() === 'denied') return;
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

  SG.initAnalytics = function (id) {
    measurementId = id || '';
    captureMarks();
    if (consent() === 'granted') { loadGtag(); flush(); }
    SG.mountCookieBar();
  };

  SG.mountCookieBar = function () {
    if (consent() !== null) return;

    var bar = document.createElement('div');
    bar.className = 'cookie';
    bar.innerHTML =
      '<div class="cookie__inner">' +
      '<span data-i18n="cookie.text"></span>' +
      '<div class="cookie__actions">' +
      '<button class="btn-ghost" data-cookie="deny" data-i18n="cookie.decline"></button>' +
      '<button class="btn-primary btn-primary--sm" data-cookie="accept" data-i18n="cookie.accept"></button>' +
      '</div></div>';

    var link = document.createElement('a');
    link.href = '/privacy.html';

    // The bar is built after i18n has already walked the document, so it fills
    // itself in — and re-fills if the visitor switches language while it is up.
    SG.onLang(function () {
      bar.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = SG.t(el.getAttribute('data-i18n'));
      });
      link.textContent = SG.t('nav.privacy');
      var text = bar.querySelector('span');
      text.appendChild(document.createTextNode(' '));
      text.appendChild(link);
    });

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
