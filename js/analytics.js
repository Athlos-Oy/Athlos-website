/**
 * Athlos Oy — commercial analytics layer
 * --------------------------------------
 * Pushes lead-intent events into the GTM dataLayer. Google Tag Manager
 * (container GTM-KQXNG6H3) forwards them to GA4.
 *
 * The site already loads GTM + Google Consent Mode v2, so this file only
 * needs to describe *what happened* — consent and cookie behaviour are
 * handled upstream by Consent Mode. Events are pushed regardless of consent;
 * when analytics consent is denied, GA4 receives cookieless, aggregated
 * pings only. That is the GDPR-safe design.
 *
 * PRIVACY: never push personal data (names, emails, phone numbers, message
 * text, company names). Only page context, link metadata and product
 * categories are sent.
 *
 * To track a custom event from inline page code:
 *   window.athlosAnalytics.track('event_name', { param: 'value' });
 */
(function () {
  'use strict';

  var dataLayer = (window.dataLayer = window.dataLayer || []);

  /* ------------------------------------------------------------------ *
   * Page context — added automatically to every event
   * ------------------------------------------------------------------ */

  function pageLanguage() {
    return (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
  }

  function pagePath() {
    return window.location.pathname + window.location.search;
  }

  /** Maps the current URL to a business "product area". */
  function productArea() {
    var p = window.location.pathname.toLowerCase();
    if (/\/products\/wios\.html$/.test(p))          return 'dc-air';
    if (/\/products\/ufs-ip67\.html$/.test(p))      return 'ufs-ip67';
    if (/\/products\/ufs\.html$/.test(p))           return 'ufs';
    if (/\/products\/software\.html$/.test(p))      return 'software';
    if (/\/products\/manufacturing\.html$/.test(p)) return 'manufacturing';
    if (/\/products\/(index\.html)?$/.test(p))      return 'products-overview';
    if (/\/applications\.html$/.test(p))            return 'applications';
    if (/\/contact\.html$/.test(p))                 return 'contact';
    if (/\/about\.html$/.test(p))                   return 'about';
    if (/\/cefla(\.html)?$/.test(p))                return 'cefla';
    if (/\/privacy\.html$/.test(p))                 return 'privacy';
    if (p === '/' || /\/index\.html$/.test(p))      return 'home';
    return 'other';
  }

  /** Product-detail pages that count as genuine product interest. */
  var PRODUCT_PAGES = {
    'dc-air': 1, 'ufs': 1, 'ufs-ip67': 1,
    'software': 1, 'manufacturing': 1, 'products-overview': 1
  };

  /* ------------------------------------------------------------------ *
   * Core push
   * ------------------------------------------------------------------ */

  function track(eventName, params) {
    var payload = {
      event: eventName,
      page_path: pagePath(),
      page_title: document.title,
      language: pageLanguage(),
      product_area: productArea()
    };
    if (params) {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
      }
    }
    dataLayer.push(payload);
  }

  // Public helper — used by inline page scripts (e.g. the contact form).
  window.athlosAnalytics = { track: track };

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  function cleanText(el) {
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return t.length > 100 ? t.slice(0, 100) : t;
  }

  function fileNameFromHref(href) {
    try {
      var u = new URL(href, window.location.href);
      return decodeURIComponent((u.pathname.split('/').pop() || ''));
    } catch (e) {
      return (href.split('/').pop() || '').split('?')[0];
    }
  }

  /** Which product a brochure / PDF is about, from its file name. */
  function fileProductArea(name) {
    var n = name.toLowerCase();
    if (n.indexOf('wios') > -1 || n.indexOf('dc-air') > -1) return 'dc-air';
    if (n.indexOf('ip67') > -1)         return 'ufs-ip67';
    if (n.indexOf('ufs') > -1)          return 'ufs';
    if (n.indexOf('software') > -1)     return 'software';
    if (n.indexOf('manufactur') > -1)   return 'manufacturing';
    return productArea();
  }

  /** Classifies a PDF. Today every PDF on the site is a brochure. */
  function fileType(name) {
    var n = name.toLowerCase();
    if (n.indexOf('brochure') > -1) return 'brochure';
    if (n.indexOf('datasheet') > -1 || n.indexOf('data-sheet') > -1) return 'datasheet';
    if (n.indexOf('manual') > -1 || n.indexOf('guide') > -1) return 'manual';
    if (n.indexOf('report') > -1) return 'report';
    return 'brochure';
  }

  /* ------------------------------------------------------------------ *
   * Session-scoped lead-intent flags (funnel signals)
   * ------------------------------------------------------------------ */

  function flag(key) {
    try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; }
  }
  function setFlag(key) {
    try { sessionStorage.setItem(key, '1'); } catch (e) {}
  }

  /** Records a step and fires high_intent_session once all three are done. */
  function markIntent(kind) {
    if (kind === 'product')  setFlag('ath_product');
    if (kind === 'brochure') setFlag('ath_brochure');
    if (kind === 'contact')  setFlag('ath_contact');
    if (flag('ath_high_intent')) return;
    if (flag('ath_product') && flag('ath_brochure') && flag('ath_contact')) {
      setFlag('ath_high_intent');
      track('high_intent_session', {});
    }
  }

  /* ------------------------------------------------------------------ *
   * Click tracking — single delegated listener (capture phase, so it
   * runs before any handler that might stop propagation)
   * ------------------------------------------------------------------ */

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var link = t.closest('a[href]');
    if (!link) return;

    var rawHref = link.getAttribute('href') || '';
    if (!rawHref || rawHref === '#') return;

    var href  = link.href;                 // absolute, browser-resolved
    var lower = rawHref.toLowerCase();
    var text  = cleanText(link) || link.getAttribute('aria-label') || '';

    /* --- Brochure / PDF -------------------------------------------- */
    if (/\.pdf(\?|#|$)/i.test(href)) {
      var fname = fileNameFromHref(href);
      track('brochure_open', {
        file_name: fname,
        file_type: fileType(fname),
        file_product_area: fileProductArea(fname),
        button_text: text,
        link_url: href,
        opened_in_new_tab: (link.target === '_blank')
      });
      markIntent('brochure');
      return;
    }

    /* --- Email link ------------------------------------------------ */
    if (lower.indexOf('mailto:') === 0) {
      track('contact_cta_click', {
        cta_text: text,
        cta_type: 'email',
        destination: 'mailto'
      });
      markIntent('contact');
      return;
    }

    /* --- Phone link ------------------------------------------------ */
    if (lower.indexOf('tel:') === 0) {
      track('contact_cta_click', {
        cta_text: text,
        cta_type: 'phone',
        destination: 'tel'
      });
      markIntent('contact');
      return;
    }

    /* --- Language switch ------------------------------------------- */
    if (link.classList.contains('lang-switcher-link')) {
      var toLang = (link.getAttribute('hreflang') || '').toLowerCase();
      if (toLang && toLang !== pageLanguage()) {
        track('language_switch', {
          from_language: pageLanguage(),
          to_language: toLang
        });
      }
      return;
    }

    /* --- Outbound / partner / social ------------------------------- */
    if (/^https?:/i.test(href) && link.hostname &&
        link.hostname !== window.location.hostname) {
      track('outbound_link_click', {
        destination_url: href,
        link_domain: link.hostname,
        link_text: text
      });
      return;
    }

    /* --- Contact CTA (internal link or in-page #contact) ----------- */
    if (/(^|\/)contact\.html(\?|#|$)/i.test(rawHref) || /#contact$/.test(rawHref)) {
      track('contact_cta_click', {
        cta_text: text,
        cta_type: 'link',
        destination: 'contact-page'
      });
      markIntent('contact');
      return;
    }

    /* --- Product sub-navigation ------------------------------------ */
    if (link.classList.contains('subnav-link')) {
      track('product_section_click', {
        section_name: text,
        nav_type: 'product-subnav'
      });
      return;
    }
  }, true);

  /* ------------------------------------------------------------------ *
   * Contact form — first interaction
   * (submit / error events are fired by the form's own inline script)
   * ------------------------------------------------------------------ */

  (function () {
    var started = false;
    document.addEventListener('focusin', function (e) {
      if (started || !e.target || !e.target.closest) return;
      if (!e.target.closest('#contactForm')) return;
      started = true;
      track('contact_form_start', { form_name: 'contact' });
    });
  })();

  /* ------------------------------------------------------------------ *
   * Product page view + multi-product comparison interest
   * ------------------------------------------------------------------ */

  (function () {
    var area = productArea();
    if (!PRODUCT_PAGES[area]) return;

    track('product_page_view', {});
    markIntent('product');

    try {
      var seen = JSON.parse(sessionStorage.getItem('ath_products_seen') || '[]');
      if (seen.indexOf(area) === -1) {
        seen.push(area);
        sessionStorage.setItem('ath_products_seen', JSON.stringify(seen));
      }
      if (seen.length >= 2 && !flag('ath_comparison')) {
        setFlag('ath_comparison');
        track('product_comparison_interest', {
          products_viewed: seen.length,
          products_list: seen.join(',')
        });
      }
    } catch (e) {}
  })();

  /* ------------------------------------------------------------------ *
   * Scroll depth — 50 / 75 / 90 % on content-heavy pages
   * ------------------------------------------------------------------ */

  (function () {
    var TRACKED = {
      home: 1, applications: 1, 'dc-air': 1, ufs: 1, 'ufs-ip67': 1,
      software: 1, manufacturing: 1, 'products-overview': 1
    };
    if (!TRACKED[productArea()]) return;

    var thresholds = [50, 75, 90];
    var fired = {};
    var ticking = false;

    function check() {
      ticking = false;
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var pct = (window.scrollY || window.pageYOffset) / scrollable * 100;
      for (var i = 0; i < thresholds.length; i++) {
        var th = thresholds[i];
        if (pct >= th && !fired[th]) {
          fired[th] = true;
          track('scroll_depth', { scroll_percent: th });
        }
      }
      if (fired[90]) window.removeEventListener('scroll', onScroll);
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(check); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
  })();

})();
