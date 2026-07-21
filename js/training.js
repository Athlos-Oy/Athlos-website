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
      el.removeAttribute('title');
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

  document.querySelectorAll('.tc-feature-card').forEach(function (card) {
    var thumb = card.querySelector('.tc-feature-thumb');
    if (!thumb) return;
    thumb.addEventListener('click', function () {
      var id = card.getAttribute('data-yt-id');
      var title = card.querySelector('.tc-feature-title');
      ytFrame.innerHTML = '';
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      iframe.title = title ? title.textContent : 'DC-Air video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      ytFrame.appendChild(iframe);
      if (typeof ytModal.showModal === 'function') ytModal.showModal();
      document.body.style.overflow = 'hidden';
      track('training_video_start', { video_title: title ? title.textContent.trim() : id, video_category: 'start_here' });
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
    }
  });

  /* ---- logout ----------------------------------------------------------- */
  var logout = document.getElementById('tcLogout');
  if (logout) {
    logout.addEventListener('click', function () {
      track('training_logout', {});
    });
  }
})();
