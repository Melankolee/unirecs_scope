/* The strings the scripts build at runtime.
 *
 * Everything the visitor reads on arrival lives in the HTML, so the pages read
 * correctly before this file runs and without JavaScript at all. What is here
 * is only what no markup can hold: text assembled from numbers, the verdict
 * labels that depend on an answer, and the errors for things that have not
 * happened yet.
 *
 * This used to be a two-language dictionary with an EN/RU switch in the header.
 * The RU half is gone, and with it the machinery that overwrote the markup on a
 * language change — for an English visitor that pass never ran anyway, so every
 * `data-i18n` attribute in the HTML existed purely to serve the switch. They
 * went too. Bringing a second language back means bringing both back; the git
 * history has them.
 *
 * `{name}` placeholders are filled from the second argument. */

window.SG = window.SG || {};

(function () {
  var STRINGS = {
    'verdict.in_scope': 'In scope',
    'verdict.unclear': 'Unclear',
    'verdict.out_of_scope': 'Out of scope',
    'verdict.lowConfidence': 'Low confidence — the terms genuinely read more than one way here. Treat this as a starting point for the conversation, not a settled answer.',

    'app.copy': 'Copy reply',
    'app.copied': 'Copied',

    'app.price.title': 'One check is on us',
    'app.price.sub': 'The next ones are part of the full version.',
    'app.price.titleLimited': 'You’ve used your free check',
    'app.price.subLimited': 'Further checks are part of the full version.',
    'app.price.done': 'You’re on the list — we’ll email you when it opens.',

    'app.attach.reading': 'Reading {name}…',
    'app.attach.added': 'Text from {name}',
    'app.attach.err.type': 'That format can’t be read here — attach a .docx, .txt or .md, or paste the text.',
    'app.attach.err.legacy': 'Old .doc files can’t be read here. Save it as .docx, or paste the text.',
    'app.attach.err.big': 'That file is over {n} MB. Paste the part that matters instead.',
    'app.attach.err.empty': 'No text came out of that file. If it’s a scan or a set of images, paste the text instead.',
    'app.attach.err.read': 'That file wouldn’t open. Paste the text instead.',
    'app.attach.err.browser': 'This browser can’t unpack a .docx. Paste the text instead.',

    'app.what.scope': 'agreement',
    'app.what.request': 'client’s message',
    'app.err.empty': 'Paste the {what} first.',
    'app.err.short': 'Add a bit more — at least {n} characters.',
    'app.err.long': 'That’s over the {n} character limit.',

    'loss.rateChip': '${n}/hr',
    'loss.hoursChip': '~{n} hrs',
    'loss.days.one': '{n} unpaid work day this year',
    'loss.days.few': '{n} unpaid work days this year',
    'loss.thousands': 'k',
    'loss.monthly': '${n} a month',
    'loss.weeks': '{n} work weeks a year, unbilled',
    'loss.projWord.one': 'proj',
    'loss.projWord.few': 'proj',
    'loss.formula': '~{hours} hrs × {proj} {projWord}/mo × 12 × ${rate}/hr',
  };

  SG.t = function (key, vars) {
    var value = STRINGS[key];
    // A missing key returns the key itself: visible in testing, and never a
    // blank where a sentence belongs.
    if (value === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        value = value.split('{' + name + '}').join(vars[name]);
      });
    }
    return value;
  };

  /* Callers ask for a stem and get the right leaf back. Two forms is all
     English needs; the three-form Russian rule left with the RU dictionary. */
  SG.plural = function (stem, n) {
    return stem + (n === 1 ? '.one' : '.few');
  };
})();
