(function () {
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
})();
