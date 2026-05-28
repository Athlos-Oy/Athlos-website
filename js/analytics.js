/* =====================================================
   ATHLOS — ANALYTICS EVENT TRACKING
   Pushes custom events to the GTM dataLayer so the
   "GA4 Event - All Athlos events" tag can forward them
   to GA4. Loaded on every page via layouts/base.njk.

   Events emitted (12):
     brochure_open, contact_cta_click, contact_form_start,
     contact_form_submit, contact_form_error, language_switch,
     outbound_link_click, product_page_view,
     product_section_click, scroll_depth, high_intent_session,
     product_comparison_interest

   contact_form_submit / contact_form_error are pushed by the
   contact page's own inline script — their success/failure
   state is only known there.
===================================================== */
(function () {
  'use strict';

  var dl = (window.dataLayer = window.dataLayer || []);
  function push(obj) { dl.push(obj); }

  /* ---- helpers --------------------------------------------------------- */

  // Product detail pages, keyed by their filename slug.
  var PRODUCT_SLUGS = ['wios', 'ufs', 'ufs-ip67', 'manufacturing', 'software'];

  // Product-area slug for the current page, or '' if not a product page.
  function currentProductArea() {
    var m = location.pathname.match(/\/products\/([a-z0-9-]+)\.html$/i);
    return (m && PRODUCT_SLUGS.indexOf(m[1]) !== -1) ? m[1] : '';
  }

  // Derives a product-area slug from a brochure filename.
  function productAreaFromFile(name) {
    var f = name.toLowerCase();
    if (f.indexOf('ufs-ip67') !== -1) return 'ufs-ip67';
    if (f.indexOf('wios') !== -1 || f.indexOf('dc-air') !== -1) return 'wios';
    if (f.indexOf('ufs') !== -1) return 'ufs';
    return '';
  }

  function fileNameFromUrl(url) {
    return decodeURIComponent((url.pathname.split('/').pop() || ''));
  }

  function text(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // Classifies where a contact CTA sits, for the cta_type parameter.
  function ctaLocation(el) {
    if (el.closest('.nav')) return 'nav';
    if (el.closest('.footer')) return 'footer';
    if (el.closest('.product-cta')) return 'product_cta';
    if (el.closest('.product-hero, .page-hero, .hero')) return 'hero';
    return 'inline';
  }

  // sessionStorage can throw (private mode / disabled) — fail soft.
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* ---- high_intent_session -------------------------------------------- */
  // A running per-session score. When engagement signals accumulate past
  // the threshold, fire high_intent_session once.
  function bumpIntent(weight) {
    if (ssGet('athlos_high_intent') === '1') return;
    var score = parseInt(ssGet('athlos_intent_score') || '0', 10) + weight;
    ssSet('athlos_intent_score', String(score));
    if (score >= 4) {
      ssSet('athlos_high_intent', '1');
      push({ event: 'high_intent_session', intent_score: score });
    }
  }

  /* ---- product_page_view + product_comparison_interest ---------------- */
  function registerProductView(area) {
    push({ event: 'product_page_view', product_area: area });
    bumpIntent(1);

    var seen = (ssGet('athlos_products_seen') || '').split(',').filter(Boolean);
    if (seen.indexOf(area) === -1) seen.push(area);
    ssSet('athlos_products_seen', seen.join(','));

    // Two or more distinct product pages in one session => comparing.
    if (seen.length >= 2 && ssGet('athlos_comparison') !== '1') {
      ssSet('athlos_comparison', '1');
      push({ event: 'product_comparison_interest', product_area: seen.join(',') });
    }
  }

  var area = currentProductArea();
  if (area) registerProductView(area);

  /* ---- delegated click handling --------------------------------------- */
  document.addEventListener('click', function (e) {
    var tab = e.target.closest && e.target.closest('.gallery-tab');
    if (tab) {
      push({
        event: 'product_section_click',
        section_name: text(tab) || tab.getAttribute('data-tab') || '',
        product_area: currentProductArea()
      });
    }

    var a = e.target.closest && e.target.closest('a');
    if (a) handleLinkClick(a);
  }, true);

  function handleLinkClick(a) {
    var href = a.getAttribute('href') || '';
    if (!href || href.indexOf('javascript:') === 0) return;

    // In-page anchor jump on a product page => section interaction.
    if (href.charAt(0) === '#') {
      if (href.length > 1 && currentProductArea()) {
        push({
          event: 'product_section_click',
          section_name: href.slice(1),
          product_area: currentProductArea()
        });
      }
      return;
    }

    var url;
    try { url = new URL(href, location.href); } catch (e) { return; }

    // brochure_open — any PDF link.
    if (/\.pdf($|\?)/i.test(url.pathname)) {
      var fileName = fileNameFromUrl(url);
      push({
        event: 'brochure_open',
        file_name: fileName,
        file_type: 'pdf',
        file_product_area: currentProductArea() || productAreaFromFile(fileName)
      });
      bumpIntent(2);
      return;
    }

    // contact_cta_click — links to the contact page (ignore self-links
    // from the nav while already on the contact page).
    if (/\/contact\.html$/i.test(url.pathname) &&
        url.hostname === location.hostname &&
        !/\/contact\.html$/i.test(location.pathname)) {
      push({
        event: 'contact_cta_click',
        cta_text: text(a) || a.getAttribute('aria-label') || '',
        cta_type: ctaLocation(a)
      });
      bumpIntent(2);
      return;
    }

    // language_switch — locale switcher links.
    if (a.classList.contains('lang-switcher-link')) {
      if (!a.classList.contains('active')) {
        push({ event: 'language_switch', language: a.getAttribute('hreflang') || '' });
      }
      return;
    }

    // outbound_link_click — http(s) link to a different host.
    if (/^https?:$/.test(url.protocol) && url.hostname &&
        url.hostname !== location.hostname) {
      push({
        event: 'outbound_link_click',
        link_url: url.href,
        link_domain: url.hostname,
        link_text: text(a) || a.getAttribute('aria-label') || ''
      });
    }
  }

  /* ---- contact_form_start --------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var formStarted = false;
    form.addEventListener('focusin', function () {
      if (formStarted) return;
      formStarted = true;
      var sel = document.getElementById('cf-topic');
      push({
        event: 'contact_form_start',
        form_topic: (sel && sel.value) ? sel.value : 'general_enquiry'
      });
      bumpIntent(3);
    });
  }

  /* ---- scroll_depth --------------------------------------------------- */
  var marks = [25, 50, 75, 90];
  var hit = {};
  function checkScroll() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var pct = (window.scrollY || doc.scrollTop || 0) / scrollable * 100;
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      if (pct >= m && !hit[m]) {
        hit[m] = true;
        push({ event: 'scroll_depth', scroll_percent: m });
        if (m >= 75) bumpIntent(1);
      }
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { checkScroll(); ticking = false; });
  }, { passive: true });
  checkScroll();
})();
