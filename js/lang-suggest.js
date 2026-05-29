/* SEO-safe language suggestion banner.
   -------------------------------------------------------------------
   This is a CLIENT-SIDE SUGGESTION ONLY. It never redirects, never
   touches the URL, and never runs for anything but a real browser with
   a supported non-current UI language. Crawlers are unaffected: the
   banner is injected after load and only appends a dismissible bar —
   it changes no SEO-critical content, canonicals, or hreflang.

   Behavior (all conditions must hold to show the banner):
     - the visitor is on a homepage / root language experience
       ("/", "/de/", "/fr/", "/it/", "/es/");
     - no language preference or prior dismissal is stored;
     - navigator language resolves to a SUPPORTED non-English locale
       (de | fr | it | es) that differs from the current page locale.
   Unsupported browser languages (fi, ar, ja, …) do nothing — the
   visitor stays on English, which remains the default.

   The banner only SUGGESTS: a link to the matching localized homepage
   and a dismiss button. The choice/dismissal is stored in localStorage
   so it never reappears. */
(function () {
  'use strict';

  var SUPPORTED = ['de', 'fr', 'it', 'es'];
  var PREF_KEY = 'athlosLangPref';
  var DISMISS_KEY = 'athlosLangBannerDismissed';

  // Localized banner copy, keyed by the TARGET (suggested) language.
  var COPY = {
    de: { msg: 'Ihre Browsersprache ist Deutsch. Diese Website auf Deutsch ansehen?', go: 'Auf Deutsch', stay: 'Schließen', label: 'Sprachvorschlag' },
    fr: { msg: 'La langue de votre navigateur est le français. Afficher ce site en français ?', go: 'En français', stay: 'Fermer', label: 'Suggestion de langue' },
    it: { msg: "La lingua del tuo browser è l'italiano. Vuoi vedere questo sito in italiano?", go: 'In italiano', stay: 'Chiudi', label: 'Suggerimento lingua' },
    es: { msg: 'El idioma de tu navegador es español. ¿Ver este sitio en español?', go: 'En español', stay: 'Cerrar', label: 'Sugerencia de idioma' }
  };

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) { /* private mode — fail quietly */ }
  }

  // Current page locale, derived from the path. "/" → en; "/de/..." → de.
  function currentLocale() {
    var m = window.location.pathname.match(/^\/(de|fr|it|es)(?:\/|$)/);
    return m ? m[1] : 'en';
  }

  // Are we on a homepage / root language experience?
  function isHomepage() {
    var p = window.location.pathname;
    return p === '/' || /^\/(de|fr|it|es)\/$/.test(p);
  }

  // First supported locale among the browser's preferred languages.
  function preferredSupported() {
    var langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      var base = String(langs[i]).toLowerCase().split('-')[0];
      if (base === 'en') return 'en'; // English preference wins → no suggestion
      if (SUPPORTED.indexOf(base) !== -1) return base;
    }
    return null;
  }

  function targetHome(loc) {
    return '/' + loc + '/';
  }

  function build(target) {
    var c = COPY[target];
    var bar = document.createElement('div');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', c.label);
    bar.style.cssText = [
      'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:9999',
      'background:#152028', 'color:#fff', 'padding:0.85rem 1rem',
      'display:flex', 'flex-wrap:wrap', 'align-items:center', 'justify-content:center',
      'gap:0.75rem 1rem', 'font-size:0.9rem', 'line-height:1.4',
      'box-shadow:0 -2px 12px rgba(0,0,0,0.18)'
    ].join(';');

    var msg = document.createElement('span');
    msg.textContent = c.msg;
    msg.style.cssText = 'max-width:42rem;';

    var go = document.createElement('a');
    go.href = targetHome(target);
    go.textContent = c.go;
    go.style.cssText = [
      'background:#19b6c9', 'color:#04141a', 'font-weight:600',
      'padding:0.45rem 1.1rem', 'border-radius:6px', 'text-decoration:none',
      'white-space:nowrap'
    ].join(';');
    // Honoring the suggestion is an explicit choice — remember it.
    go.addEventListener('click', function () { safeSet(PREF_KEY, target); });

    var stay = document.createElement('button');
    stay.type = 'button';
    stay.textContent = c.stay;
    stay.style.cssText = [
      'background:transparent', 'color:rgba(255,255,255,0.85)',
      'border:1px solid rgba(255,255,255,0.35)', 'padding:0.45rem 1.1rem',
      'border-radius:6px', 'cursor:pointer', 'white-space:nowrap'
    ].join(';');
    stay.addEventListener('click', function () {
      safeSet(DISMISS_KEY, '1');
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    });

    bar.appendChild(msg);
    bar.appendChild(go);
    bar.appendChild(stay);
    return bar;
  }

  function init() {
    if (!isHomepage()) return;
    if (safeGet(PREF_KEY) || safeGet(DISMISS_KEY)) return;
    var target = preferredSupported();
    if (!target || target === 'en') return;
    if (target === currentLocale()) return; // already viewing it
    document.body.appendChild(build(target));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
