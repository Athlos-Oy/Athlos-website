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

  function withDownloadParam(url) {
    if (!url) return '#';
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'download=1';
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

    titleEl.textContent = v.title;
    descEl.textContent = v.description || '';
    catEl.textContent = catLabel(v.category);
    durEl.textContent = v.duration || '';
    noteEl.hidden = !v.positioningOnly;
    dlCap.href = withDownloadParam(v.downloadCaptionedUrl);
    dlNoCap.href = withDownloadParam(v.downloadNoCaptionsUrl);
    dlCap.setAttribute('data-tc-title', v.title);
    dlNoCap.setAttribute('data-tc-title', v.title);
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
      var v = videos[current];
      if (v) track('training_video_start', { video_title: v.title, video_category: v.category });
    });
    video.addEventListener('ended', function () {
      var v = videos[current];
      if (v && !completedTracked) {
        completedTracked = true;
        track('training_video_complete', { video_title: v.title, video_category: v.category });
      }
    });
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
