/* =====================================================
   DC-AIR® TRAINING CENTER — page behaviour
   - Category filters (no reload)
   - Portrait video player modal (dialog): prev/next,
     Escape/close stops playback, focus handled natively
   - Lazy YouTube (nocookie) modal — no player loads
     until a card is activated
   - Consent-gated analytics events via dataLayer
     (GTM only loads after cookie accept — see head)
   ===================================================== */
(function () {
  'use strict';

  var dl = (window.dataLayer = window.dataLayer || []);
  function track(event, params) {
    var payload = { event: event };
    if (params) for (var k in params) payload[k] = params[k];
    dl.push(payload);
  }

  var videos = window.tcVideos || [];
  var categories = window.tcCategories || [];
  function catLabel(key) {
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].key === key) return categories[i].label;
    }
    return key;
  }

  /* ---- category filters ------------------------------------------------ */
  var filters = document.querySelectorAll('.tc-filter');
  var cards = document.querySelectorAll('.tc-video-card');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      cards.forEach(function (card) {
        var show = key === 'all' || card.getAttribute('data-category') === key;
        card.classList.toggle('is-hidden', !show);
      });
      track('training_filter', { filter_category: key });
    });
  });

  /* ---- portrait video player modal ------------------------------------- */
  var player = document.getElementById('tcPlayer');
  var video = document.getElementById('tcPlayerVideo');
  var titleEl = document.getElementById('tcPlayerTitle');
  var descEl = document.getElementById('tcPlayerDesc');
  var catEl = document.getElementById('tcPlayerCat');
  var durEl = document.getElementById('tcPlayerDur');
  var noteEl = document.getElementById('tcPlayerNote');
  var dlCap = document.getElementById('tcPlayerDlCap');
  var dlNoCap = document.getElementById('tcPlayerDlNoCap');
  var prevBtn = document.getElementById('tcPlayerPrev');
  var nextBtn = document.getElementById('tcPlayerNext');
  var closeBtn = document.getElementById('tcPlayerClose');

  var current = -1;
  var completedTracked = false;
  var spinner = document.getElementById('tcSpinner');
  var upnext = document.getElementById('tcUpnext');
  var upnextBtn = document.getElementById('tcUpnextBtn');
  var upnextTitle = document.getElementById('tcUpnextTitle');
  var unavailable = document.getElementById('tcUnavailable');

  // Download URLs are served with Content-Disposition: attachment
  // (set at upload time), so plain hrefs trigger a save dialog.
  function downloadHref(url) {
    return url || '#';
  }

  /* ---- "available soon" state for unconfigured media links ------------- */
  // Until the media store env vars are set, blob-backed hrefs render as
  // "" or "#page=N". Mark those links disabled instead of dead clicks.
  function isDeadHref(h) {
    return !h || h === '#' || h.indexOf('#page=') === 0;
  }

  function markSoon(el) {
    el.classList.add('is-soon');
    el.setAttribute('aria-disabled', 'true');
    el.setAttribute('title', 'Available soon');
  }

  function refreshSoon(el) {
    if (isDeadHref(el.getAttribute('href'))) markSoon(el);
    else {
      el.classList.remove('is-soon');
      el.removeAttribute('aria-disabled');
      if (el.getAttribute('title') === 'Available soon') el.removeAttribute('title');
    }
  }

  document.querySelectorAll('a[data-tc-event]').forEach(refreshSoon);
  document.addEventListener('click', function (e) {
    var dead = e.target.closest('.is-soon');
    if (dead) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ---- scroll-spy: highlight the section in view in the local nav ------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.tc-nav-link'));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  function loadVideo(index) {
    var v = videos[index];
    if (!v) return;
    current = index;
    completedTracked = false;

    video.pause();
    video.removeAttribute('src');
    video.load();
    video.poster = v.poster || '';
    if (v.watchUrl) video.src = v.watchUrl;
    if (upnext) upnext.hidden = true;
    if (spinner) spinner.hidden = true;
    if (unavailable) unavailable.hidden = !!v.watchUrl;

    titleEl.textContent = v.title;
    descEl.textContent = v.description || '';
    catEl.textContent = catLabel(v.category);
    durEl.textContent = v.duration || '';
    noteEl.hidden = !v.positioningOnly;
    dlCap.href = downloadHref(v.downloadCaptionedUrl);
    dlNoCap.href = downloadHref(v.downloadNoCaptionsUrl);
    dlCap.setAttribute('data-tc-title', v.title);
    dlNoCap.setAttribute('data-tc-title', v.title);
    refreshSoon(dlCap);
    refreshSoon(dlNoCap);
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === videos.length - 1;
  }

  function openPlayer(index) {
    loadVideo(index);
    if (typeof player.showModal === 'function') player.showModal();
    document.body.style.overflow = 'hidden';
  }

  function stopPlayback() {
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.body.style.overflow = '';
  }

  cards.forEach(function (card) {
    var thumb = card.querySelector('.tc-video-thumb');
    if (!thumb) return;
    thumb.addEventListener('click', function () {
      openPlayer(Number(card.getAttribute('data-index')));
    });
  });

  if (player) {
    player.addEventListener('close', stopPlayback);
    // Click on the backdrop closes the dialog.
    player.addEventListener('click', function (e) {
      if (e.target === player) player.close();
    });
    closeBtn.addEventListener('click', function () { player.close(); });
    prevBtn.addEventListener('click', function () {
      if (current > 0) { loadVideo(current - 1); video.play(); }
    });
    nextBtn.addEventListener('click', function () {
      if (current < videos.length - 1) { loadVideo(current + 1); video.play(); }
    });

    video.addEventListener('play', function () {
      if (upnext) upnext.hidden = true;
      var v = videos[current];
      if (v) track('training_video_start', { video_title: v.title, video_category: v.category });
    });
    video.addEventListener('ended', function () {
      var v = videos[current];
      if (v && !completedTracked) {
        completedTracked = true;
        track('training_video_complete', { video_title: v.title, video_category: v.category });
      }
      // Offer the next video when one exists.
      if (upnext && current < videos.length - 1) {
        upnextTitle.textContent = videos[current + 1].title;
        upnext.hidden = false;
      }
    });

    // Buffering indicator — only meaningful once a source is set.
    ['waiting', 'stalled', 'seeking'].forEach(function (ev) {
      video.addEventListener(ev, function () {
        if (spinner && video.getAttribute('src')) spinner.hidden = false;
      });
    });
    ['playing', 'canplay', 'seeked', 'pause', 'error', 'emptied'].forEach(function (ev) {
      video.addEventListener(ev, function () {
        if (spinner) spinner.hidden = true;
      });
    });

    if (upnextBtn) {
      upnextBtn.addEventListener('click', function () {
        if (current < videos.length - 1) {
          loadVideo(current + 1);
          video.play();
        }
      });
    }
  }

  /* ---- Quick Support summary modal ------------------------------------- */
  var guide = document.getElementById('tcGuide');
  var guideBody = document.getElementById('tcGuideBody');
  var guideTitle = document.getElementById('tcGuideTitle');
  var guidePdf = document.getElementById('tcGuidePdf');
  var guidePdfPage = document.getElementById('tcGuidePdfPage');
  var guideClose = document.getElementById('tcGuideClose');
  var guideContents = document.getElementById('tcGuideContents');
  var guidePdfBase = (guideContents && guideContents.getAttribute('data-pdf-base')) || '';

  function openGuide(key, title, page) {
    var src = guideContents && guideContents.querySelector('[data-guide-content="' + key + '"]');
    if (!src || !guide) return;
    guideBody.innerHTML = '';
    guideBody.appendChild(src.cloneNode(true));
    guideTitle.textContent = title;
    guidePdfPage.textContent = 'p. ' + page;
    guidePdf.href = guidePdfBase ? guidePdfBase + '#page=' + page : '#page=' + page;
    guidePdf.setAttribute('data-tc-section', title);
    refreshSoon(guidePdf);
    if (typeof guide.showModal === 'function') guide.showModal();
    document.body.style.overflow = 'hidden';
    track('training_guide_open', { guide_section: title });
  }

  document.querySelectorAll('.tc-support-card').forEach(function (card) {
    var btn = card.querySelector('.tc-support-open');
    if (!btn) return;
    btn.addEventListener('click', function () {
      openGuide(
        card.getAttribute('data-guide-card'),
        card.getAttribute('data-guide-title'),
        card.getAttribute('data-guide-page')
      );
    });
  });

  if (guide) {
    guide.addEventListener('close', function () { document.body.style.overflow = ''; });
    guide.addEventListener('click', function (e) { if (e.target === guide) guide.close(); });
    guideClose.addEventListener('click', function () { guide.close(); });
  }

  /* ---- lazy YouTube modal (privacy-enhanced nocookie embed) ------------ */
  var ytModal = document.getElementById('tcYtModal');
  var ytFrame = document.getElementById('tcYtFrame');
  var ytClose = document.getElementById('tcYtClose');

  function openYt(id, title, category) {
    ytFrame.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    iframe.title = title || 'DC-Air video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    ytFrame.appendChild(iframe);
    if (typeof ytModal.showModal === 'function') ytModal.showModal();
    document.body.style.overflow = 'hidden';
    track('training_video_start', { video_title: title || id, video_category: category });
  }

  document.querySelectorAll('.tc-feature-card').forEach(function (card) {
    var thumb = card.querySelector('.tc-feature-thumb');
    if (!thumb) return;
    thumb.addEventListener('click', function () {
      var title = card.querySelector('.tc-feature-title');
      openYt(card.getAttribute('data-yt-id'), title ? title.textContent.trim() : '', 'start_here');
    });
  });

  document.querySelectorAll('.tc-int-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var name = chip.getAttribute('data-int-name') || '';
      openYt(chip.getAttribute('data-yt-id'), name + ' — DC-Air Acquisition', 'integration');
      track('training_integration_open', { integration_software: name });
    });
  });

  if (ytModal) {
    ytModal.addEventListener('close', function () {
      ytFrame.innerHTML = '';
      document.body.style.overflow = '';
    });
    ytModal.addEventListener('click', function (e) {
      if (e.target === ytModal) ytModal.close();
    });
    ytClose.addEventListener('click', function () { ytModal.close(); });
  }

  /* ---- declarative event tracking -------------------------------------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-tc-event]');
    if (!el) return;
    var type = el.getAttribute('data-tc-event');
    if (type === 'download') {
      track('training_download', {
        download_type: el.getAttribute('data-tc-type') || '',
        video_title: el.getAttribute('data-tc-title') || ''
      });
    } else if (type === 'guide_open') {
      track('training_guide_open', { guide_section: el.getAttribute('data-tc-section') || '' });
    } else if (type === 'ifu_open') {
      track('training_ifu_open', {});
    } else if (type === 'support_click') {
      track('training_support_click', { support_contact: el.getAttribute('data-tc-contact') || '' });
    } else if (type === 'chairside_open') {
      track('training_chairside_open', { open_section: el.getAttribute('data-tc-section') || '' });
    }
  });

  /* ---- sample radiograph lightbox -------------------------------------- */
  var imgModal = document.getElementById('tcImgModal');
  var imgFull = document.getElementById('tcImgFull');
  var imgLabel = document.getElementById('tcImgLabel');
  var imgClose = document.getElementById('tcImgClose');

  document.querySelectorAll('.tc-gallery-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!imgModal) return;
      imgFull.src = btn.getAttribute('data-img');
      imgFull.alt = 'Sample DC-Air radiograph — ' + (btn.getAttribute('data-label') || '');
      imgLabel.textContent = btn.getAttribute('data-label') || '';
      if (typeof imgModal.showModal === 'function') imgModal.showModal();
      document.body.style.overflow = 'hidden';
      track('training_gallery_open', { gallery_label: btn.getAttribute('data-label') || '' });
    });
  });

  if (imgModal) {
    imgModal.addEventListener('close', function () {
      imgFull.src = '';
      document.body.style.overflow = '';
    });
    imgModal.addEventListener('click', function (e) { if (e.target === imgModal) imgModal.close(); });
    imgClose.addEventListener('click', function () { imgModal.close(); });
  }


  /* ---- Find an Answer: fuzzy FAQ search + topic browser ----------------- */
  // Forgiving by design: tolerates typos (edit distance), partial words
  // (prefix match) and non-native phrasings (synonym groups), so "blutooth
  // conection lost" still lands on the BLE answer.
  var faqIndex = window.tcFaqIndex || [];
  var faqSearch = document.getElementById('tcFaqSearch');
  var faqClear = document.getElementById('tcFaqClear');
  var faqStatus = document.getElementById('tcFaqStatus');
  var faqEmpty = document.getElementById('tcFaqEmpty');
  var faqList = document.getElementById('tcFaqList');
  var faqCats = Array.prototype.slice.call(document.querySelectorAll('.tc-help-cat'));
  var faqItems = {};
  Array.prototype.forEach.call(document.querySelectorAll('.tc-faq'), function (el) {
    faqItems[el.getAttribute('data-faq-id')] = el;
  });

  var SYNONYMS = [
    ['bluetooth', 'blutooth', 'bluethooth', 'ble', 'wireless', 'wireles', 'wifi', 'radio', 'signal'],
    ['battery', 'batery', 'battary', 'power', 'charge', 'charging', 'recharge'],
    ['image', 'picture', 'photo', 'xray', 'radiograph', 'scan'],
    ['connect', 'connection', 'conection', 'pair', 'pairing', 'link', 'sync'],
    ['disconnect', 'drop', 'cut', 'lost', 'lose', 'interrupt'],
    ['clean', 'disinfect', 'disinfection', 'desinfect', 'sterilize', 'sterilise', 'sanitize', 'wipe', 'wash', 'hygiene'],
    ['light', 'led', 'lamp', 'indicator', 'blink', 'flash'],
    ['dock', 'docking', 'station', 'cradle', 'base', 'charger'],
    ['sheath', 'sheat', 'barrier', 'cover', 'sleeve', 'bag'],
    ['broken', 'break', 'broke', 'damage', 'crack', 'fault', 'faulty'],
    ['slow', 'lag', 'delay'],
    ['freeze', 'frozen', 'stuck', 'hang', 'crash'],
    ['yellow', 'yelow', 'orange', 'amber'],
    ['child', 'kid', 'pediatric', 'paediatric', 'baby'],
    ['noise', 'noisy', 'grainy', 'grain', 'blurry', 'unclear', 'fuzzy', 'unsharp'],
    ['install', 'installation', 'instal', 'setup'],
    ['software', 'twain', 'program', 'app', 'application'],
    ['empty', 'dead', 'died', 'flat']
  ];
  var STOPWORDS = {};
  ('the a an is are was my i it its this that to do does how what when where why of in on at and or for with can '
    + 'cant wont dont doesnt isnt im not no me we you your there very please sensor dcair dc air device my '
    + 'problem issue help me working work fix').split(' ').forEach(function (w) { STOPWORDS[w] = 1; });

  function stem(t) {
    if (t.length > 5 && /ing$/.test(t)) t = t.slice(0, -3);
    else if (t.length > 4 && /(ed|es)$/.test(t)) t = t.slice(0, -2);
    else if (t.length > 3 && /s$/.test(t) && !/ss$/.test(t)) t = t.slice(0, -1);
    return t;
  }

  function tokenize(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(function (t) { return t.length > 1; })
      .map(stem);
  }

  // Edit distance capped at `max` — small inputs only, early exit per row.
  function editDist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1;
      prev = cur.slice();
    }
    return prev[b.length];
  }

  function tokenScore(qt, dt) {
    if (qt === dt) return 3;
    if (dt.length >= 3 && qt.length >= 3 && (dt.indexOf(qt) === 0 || qt.indexOf(dt) === 0)) return 2;
    if (qt.length >= 4) {
      var max = qt.length >= 7 ? 2 : 1;
      if (editDist(qt, dt, max) <= max) return 1.5;
    }
    return 0;
  }

  function expandQuery(tokens) {
    var out = {};
    tokens.forEach(function (t) {
      if (STOPWORDS[t]) return;
      out[t] = 1;
      SYNONYMS.forEach(function (group) {
        for (var i = 0; i < group.length; i++) {
          var g = stem(group[i]);
          if (tokenScore(t, g) >= 1.5) {
            group.forEach(function (w) { out[stem(w)] = 1; });
            return;
          }
        }
      });
    });
    return Object.keys(out);
  }

  // Precompute document tokens (question tokens weighted via bonus).
  var faqDocs = faqIndex.map(function (item) {
    return {
      id: item.id,
      cat: item.cat,
      qTokens: tokenize(item.q),
      allTokens: tokenize(item.q + ' ' + item.kw)
    };
  });

  function searchFaq(query) {
    var qTokens = expandQuery(tokenize(query));
    if (!qTokens.length) return null; // nothing but stopwords — not a real query
    var results = [];
    faqDocs.forEach(function (doc) {
      var score = 0;
      var matched = 0;
      qTokens.forEach(function (qt) {
        var best = 0;
        doc.allTokens.forEach(function (dt) {
          var s = tokenScore(qt, dt);
          if (s > best) best = s;
        });
        if (best > 0) {
          matched++;
          score += best;
          doc.qTokens.forEach(function (dt) {
            if (tokenScore(qt, dt) >= 2) { score += 0.75; }
          });
        }
      });
      if (matched > 0 && score >= 2) results.push({ id: doc.id, score: score });
    });
    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, 6);
  }

  function hideAllFaq() {
    Object.keys(faqItems).forEach(function (id) {
      var el = faqItems[id];
      el.hidden = true;
      el.open = false;
      el.classList.remove('is-best');
      var badge = el.querySelector('.tc-faq-badge');
      if (badge) badge.hidden = true;
    });
    if (faqEmpty) faqEmpty.hidden = true;
  }

  function markBest(el) {
    el.classList.add('is-best');
    var badge = el.querySelector('.tc-faq-badge');
    if (badge) badge.hidden = false;
  }

  function clearCats() {
    faqCats.forEach(function (b) {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });
  }

  function setStatus(text) {
    if (faqStatus) faqStatus.textContent = text || '';
  }

  var searchDebounce = null;
  var trackDebounce = null;

  function runSearch() {
    var query = faqSearch.value.trim();
    if (faqClear) faqClear.hidden = !query;
    clearCats();
    hideAllFaq();
    if (!query) { setStatus(''); return; }

    var results = searchFaq(query);
    if (results === null) { setStatus(''); return; }

    if (results.length) {
      results.forEach(function (r) {
        var el = faqItems[r.id];
        if (!el) return;
        el.hidden = false;
        faqList.appendChild(el); // reorder: best match first
      });
      var top = faqItems[results[0].id];
      if (results.length === 1) {
        // Single hit — open it right away, nothing else competes for attention.
        if (top) top.open = true;
        setStatus('Found 1 answer:');
      } else {
        // Several hits — keep them all closed and equally visible; flag the
        // likely winner instead of opening it over the others.
        if (top) markBest(top);
        setStatus('Found ' + results.length + ' answers — tap one to open it:');
      }
    } else {
      if (faqEmpty) faqEmpty.hidden = false;
      setStatus('');
    }

    clearTimeout(trackDebounce);
    trackDebounce = setTimeout(function () {
      track(results.length ? 'training_search' : 'training_search_zero', {
        search_query: query.toLowerCase().slice(0, 80),
        search_results: results.length
      });
    }, 1200);
  }

  if (faqSearch) {
    faqSearch.addEventListener('input', function () {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(runSearch, 250);
    });
    faqSearch.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(searchDebounce); runSearch(); }
    });
  }

  if (faqClear) {
    faqClear.addEventListener('click', function () {
      faqSearch.value = '';
      faqClear.hidden = true;
      clearCats();
      hideAllFaq();
      setStatus('');
      faqSearch.focus();
    });
  }

  faqCats.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-cat');
      var wasActive = btn.classList.contains('is-active');
      if (faqSearch) faqSearch.value = '';
      if (faqClear) faqClear.hidden = true;
      clearCats();
      hideAllFaq();
      if (wasActive) { setStatus(''); return; }
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      var count = 0;
      faqIndex.forEach(function (item) {
        var el = faqItems[item.id];
        if (el && item.cat === key) {
          el.hidden = false;
          faqList.appendChild(el); // restore data-file order within the topic
          count++;
        }
      });
      setStatus(count + ' answers about ' + btn.textContent.trim().toLowerCase() + ' — tap one to open it:');
      track('training_faq_category', { faq_category: key });
    });
  });

  if (faqList) {
    faqList.addEventListener('toggle', function (e) {
      var el = e.target;
      if (el.classList && el.classList.contains('tc-faq') && el.open) {
        track('training_faq_open', { faq_id: el.getAttribute('data-faq-id') || '' });
      }
    }, true);
  }

  /* ---- FAQ deep links + copy-link buttons ------------------------------- */
  // #faq-<id> in the URL opens that answer directly — used by the QR card,
  // WhatsApp saved replies and the per-answer "Copy link" buttons.
  function openFaqFromHash() {
    var m = location.hash.match(/^#faq-([\w-]+)$/);
    if (!m) return;
    var el = faqItems[m[1]];
    if (!el) return;
    hideAllFaq();
    clearCats();
    if (faqSearch) faqSearch.value = '';
    el.hidden = false;
    el.open = true;
    setStatus('');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    track('training_faq_open', { faq_id: m[1], faq_via: 'deep_link' });
  }
  window.addEventListener('hashchange', openFaqFromHash);
  openFaqFromHash();

  document.querySelectorAll('.tc-faq-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-faq-copy');
      var url = location.origin + location.pathname.replace(/\/$/, '') + '#faq-' + id;
      var done = function () {
        var label = btn.querySelector('span');
        if (label) {
          label.textContent = 'Copied ✓';
          setTimeout(function () { label.textContent = 'Copy link'; }, 1600);
        }
        track('training_faq_share', { faq_id: id });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---- logout ----------------------------------------------------------- */
  var logout = document.getElementById('tcLogout');
  if (logout) {
    logout.addEventListener('click', function () {
      track('training_logout', {});
    });
  }
})();
