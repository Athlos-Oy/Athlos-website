/* =====================================================
   ATHLOS — "PHOTON FLIGHT" CINEMATIC DETECTOR EXPERIENCE
   ---------------------------------------------------------------
   A ~13s looping WebGL film for the homepage Technology section,
   built around ONE clear physical story the viewer can follow:

     BEAT 1 (0.0–1.8s)  A single hero X-ray photon enters; the two
                        detector stacks are established.
     BEAT 2 (1.8–4.8s)  INDIRECT — the photon strikes a scintillator;
                        X-rays become WARM visible light that BLOOMS
                        and SPREADS sideways before reaching the
                        photodiode (a softer, wider signal).
     BEAT 3 (4.8–8.0s)  DIRECT — the photon strikes CdTe/Si; energy
                        becomes a COLD, tight vertical CHARGE column
                        collected straight into the CMOS readout
                        (a localized signal).
     BEAT 4 (8.0–13s)   COMPARISON — the same test pattern on both
                        outputs: indirect softer/wider, direct
                        sharper/localized. Summary line, brief hold,
                        dip-to-black reset.

   Camera grammar is deliberately restrained: one slow push-in onto
   the indirect stack, one clean lateral transition to the direct
   stack, one pull-back for the comparison. Layer labels are HTML
   tags projected from 3D anchors and faded in exactly when their
   physical event happens.

   Constraints: Three.js lazy-loaded (vendored, pinned ESM) only when
   the section nears the viewport; DPR-capped; render loop pauses
   off-screen / when hidden; three guards fall back to the static SVG
   poster (prefers-reduced-motion, no WebGL, navigator.webdriver).
   ===================================================== */

(function () {
  'use strict';

  const root = document.querySelector('[data-dce]');
  if (!root) return;
  const canvas = root.querySelector('.dce-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (_) { return false; }
  }

  if (reduceMotion || navigator.webdriver || !hasWebGL()) {
    root.classList.add('dce-static');
    return;
  }

  let started = false;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          io.disconnect();
          boot();
        }
      });
    }, { rootMargin: '200px 0px' });
    io.observe(root);
  } else {
    boot();
  }

  async function boot() {
    root.classList.add('dce-booting');
    let THREE;
    try {
      THREE = await import('./vendor/three.module.min.js');
    } catch (err) {
      root.classList.remove('dce-booting');
      root.classList.add('dce-static');
      return;
    }
    try {
      const scene = buildScene(THREE);
      root.classList.add('dce-live');
      scene.start();
    } catch (err) {
      root.classList.remove('dce-booting');
      root.classList.add('dce-static');
    }
  }

  /* ===================================================
     SCENE
  =================================================== */
  function buildScene(THREE) {
    const LOOP = 13.0;
    const DPR_CAP = window.matchMedia('(max-width: 768px)').matches ? 1.3 : 1.75;

    const COL = {
      bg:       0x070d12,
      slab:     0x33424b,
      scint:    0x4a4030,   // warm-leaning scintillator
      cdte:     0x2f4a5a,   // cool-leaning CdTe/Si
      edge:     0x8fd2f5,
      edgeWarm: 0xffcf8a,
      photon:   0xeaf4ff,
      warm:     0xffb24a,   // indirect light (spreads)
      warmHi:   0xffe6b0,
      cold:     0x6cc8ff,   // direct charge (localized)
      coldHi:   0xd6f1ff
    };

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    renderer.setClearColor(COL.bg, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));

    const scene3 = new THREE.Scene();
    scene3.background = new THREE.Color(COL.bg);
    scene3.fog = new THREE.Fog(COL.bg, 14, 40);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

    scene3.add(new THREE.AmbientLight(0x33506a, 0.9));
    const key = new THREE.DirectionalLight(0xbfe4ff, 1.05);
    key.position.set(0, 12, 12);
    scene3.add(key);

    const sprite = makeDiscTexture(THREE);

    // Two stacks, fixed side by side: indirect (-X), direct (+X).
    const SX = 6;
    const gI = new THREE.Group(); gI.position.x = -SX; scene3.add(gI);
    const gD = new THREE.Group(); gD.position.x =  SX; scene3.add(gD);

    function slab(group, y, h, opt) {
      opt = opt || {};
      const w = 5.4, d = 5.4;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({
        color: opt.color || COL.slab,
        metalness: 0.5, roughness: 0.38,
        transparent: true, opacity: opt.opacity || 0.26,
        emissive: opt.emissive || 0x0a1a24, emissiveIntensity: 0.55
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = y;
      group.add(mesh);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: opt.edge || COL.edge, transparent: true, opacity: 0.6 })
      );
      edges.position.y = y;
      group.add(edges);
      return mesh;
    }

    // Indirect: scintillator (warm) → photodiode → readout base
    slab(gI, 2.6, 0.7, { color: COL.scint, edge: COL.edgeWarm, emissive: 0x241a0c, opacity: 0.30 });
    slab(gI, 0.6, 0.5, {});
    slab(gI, -1.4, 0.5, { opacity: 0.22 });
    // Direct: CdTe/Si (cool, thicker) → CMOS
    slab(gD, 2.6, 1.0, { color: COL.cdte, edge: COL.edge, emissive: 0x0a2230, opacity: 0.32 });
    slab(gD, -0.4, 0.7, {});

    // CMOS "microchip city" trace plane on the direct readout.
    const cmos = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 5.0),
      new THREE.MeshBasicMaterial({
        map: makeTraceTexture(THREE), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    cmos.rotation.x = -Math.PI / 2;
    cmos.position.set(0, -0.04, 0);
    gD.add(cmos);

    /* ---- Output comparison planes (same pattern, soft vs sharp) ---- */
    const outI = outputPlane(THREE, true);  outI.position.set(0, -3.7, 1.4); gI.add(outI);
    const outD = outputPlane(THREE, false); outD.position.set(0, -3.7, 1.4); gD.add(outD);

    /* ---- Hero photon (head sprite + streak) ---------------------- */
    function makeHero(streakColor) {
      const g = new THREE.Group();
      const head = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite, color: COL.photon, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      head.scale.set(0.95, 0.95, 1);
      const streak = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 1.6, 0.05),
        new THREE.MeshBasicMaterial({
          color: COL.photon, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      streak.position.y = 1.05;
      g.add(streak, head);
      g.userData = { head, streak };
      return g;
    }
    const heroI = makeHero(); heroI.position.x = -SX; scene3.add(heroI);
    const heroD = makeHero(); heroD.position.x =  SX; scene3.add(heroD);

    /* ---- Glow sprites (impact blooms, soft fields, pixel pulse) --- */
    function glow(parent, color, size, x, y, z) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite, color, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      s.scale.set(size, size, 1);
      s.position.set(x || 0, y || 0, z || 0);
      parent.add(s);
      return s;
    }
    const bloomI = glow(gI, COL.warm, 6, 0, 2.6, 0.4);     // scintillator bloom
    const fieldI = glow(gI, COL.warm, 4.4, 0, 0.6, 0.4);   // softened light at photodiode
    const sparkD = glow(gD, COL.coldHi, 2.6, 0, 2.6, 0.4); // direct impact
    const pixelD = glow(gD, COL.cold, 1.1, 0, -0.4, 0.3);  // localized pixel pulse
    const heroEnd = glow(gD, COL.cold, 7, 0, 0.4, 0);      // subtle hero glow

    /* ---- Particle systems ---------------------------------------- */
    function points(parent, count, color, size) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      const mat = new THREE.PointsMaterial({
        size, map: sprite, color, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      });
      const p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      parent.add(p);
      return p;
    }
    function rng(i, salt) {
      const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
      return s - Math.floor(s);
    }

    const AMB_N = 10;
    const amb = points(scene3, AMB_N, COL.photon, 0.32);
    const LIGHT_N = 160;
    const lightP = points(gI, LIGHT_N, COL.warm, 1.0);     // lateral warm spread
    const CHARGE_N = 64;
    const chargeP = points(gD, CHARGE_N, COL.cold, 0.55);  // tight cold column

    /* ---- Camera: 3 deliberate moves ------------------------------ */
    const KEYS = [
      { u: 0.00, p: [-2.2, 5.6, 18], t: [-3.0, 2.4, 0] }, // establish (slight indirect bias)
      { u: 0.14, p: [-6.0, 3.5, 9.6], t: [-6.0, 2.5, 0] }, // BEAT2 push-in: scintillator
      { u: 0.32, p: [-6.0, 2.2, 9.4], t: [-6.0, 1.0, 0] }, // settle: spread + photodiode
      { u: 0.40, p: [-3.0, 3.0, 10], t: [0.0, 1.6, 0] },   // clean lateral transition →
      { u: 0.50, p: [6.0, 3.4, 9.6], t: [6.0, 2.5, 0] },   // BEAT3: CdTe impact
      { u: 0.60, p: [6.0, 1.8, 9.2], t: [6.0, 0.2, 0] },   // follow charge to CMOS
      { u: 0.70, p: [3.0, 0.4, 13], t: [0.0, -1.8, 0] },   // begin pull-back
      { u: 0.82, p: [0.0, -1.2, 19], t: [0.0, -3.4, 0] },  // BEAT4: comparison wide
      { u: 0.96, p: [0.0, -1.3, 18], t: [0.0, -3.4, 0] },  // hold
      { u: 1.00, p: [-2.2, 5.6, 18], t: [-3.0, 2.4, 0] }   // = K0 (seam under dip)
    ];
    function smooth(t) { return t * t * (3 - 2 * t); }
    const _p = new THREE.Vector3(), _t = new THREE.Vector3();
    function sampleCamera(u) {
      let a = KEYS[0], b = KEYS[KEYS.length - 1];
      for (let i = 0; i < KEYS.length - 1; i++) {
        if (u >= KEYS[i].u && u <= KEYS[i + 1].u) { a = KEYS[i]; b = KEYS[i + 1]; break; }
      }
      const e = smooth((u - a.u) / ((b.u - a.u) || 1));
      _p.set(a.p[0] + (b.p[0] - a.p[0]) * e, a.p[1] + (b.p[1] - a.p[1]) * e, a.p[2] + (b.p[2] - a.p[2]) * e);
      _t.set(a.t[0] + (b.t[0] - a.t[0]) * e, a.t[1] + (b.t[1] - a.t[1]) * e, a.t[2] + (b.t[2] - a.t[2]) * e);
    }

    /* ---- HTML labels: bottom captions + projected layer tags ----- */
    const capEls = {};
    root.querySelectorAll('.dce-line').forEach((el) => { capEls[el.dataset.cap] = el; });
    const CAPS = [
      ['enter',    0.02, 0.12],
      ['spread',   0.19, 0.36],
      ['charge',   0.41, 0.55],
      ['localize', 0.56, 0.66],
      ['summary',  0.71, 0.97]
    ];
    let activeCap = '';
    function updateCaptions(u) {
      let want = '';
      for (let i = 0; i < CAPS.length; i++) {
        if (u >= CAPS[i][1] && u <= CAPS[i][2]) { want = CAPS[i][0]; break; }
      }
      if (want === activeCap) return;
      activeCap = want;
      Object.keys(capEls).forEach((k) => capEls[k].classList.toggle('is-on', k === want));
    }

    const tagEls = {};
    root.querySelectorAll('.dce-tag').forEach((el) => { tagEls[el.dataset.tag] = el; });
    // anchor = world position (group x + local); z toward front face.
    const TAGS = [
      { key: 'scintillator', pos: [-SX, 3.0, 2.7], a: 0.15, b: 0.39 },
      { key: 'photodiode',   pos: [-SX, 0.6, 2.7], a: 0.27, b: 0.39 },
      { key: 'cdte',         pos: [ SX, 3.1, 2.7], a: 0.50, b: 0.67 },
      { key: 'cmos',         pos: [ SX, -0.4, 2.7], a: 0.60, b: 0.69 },
      { key: 'softer',       pos: [-SX, -2.0, 1.4], a: 0.76, b: 0.99 },
      { key: 'sharper',      pos: [ SX, -2.0, 1.4], a: 0.76, b: 0.99 }
    ];
    const _v = new THREE.Vector3();
    function updateTags(u) {
      const W = root.clientWidth, H = root.clientHeight;
      for (let i = 0; i < TAGS.length; i++) {
        const t = TAGS[i], el = tagEls[t.key];
        if (!el) continue;
        const o = windowed(u, t.a, t.b, 0.04);
        if (o <= 0.001) { el.style.opacity = '0'; continue; }
        _v.set(t.pos[0], t.pos[1], t.pos[2]).project(camera);
        if (_v.z > 1) { el.style.opacity = '0'; continue; }
        const x = (_v.x * 0.5 + 0.5) * W;
        const y = (-_v.y * 0.5 + 0.5) * H;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-150%)';
        el.style.opacity = o.toFixed(3);
      }
    }

    const fadeEl = root.querySelector('.dce-fade');
    function updateFade(u) {
      let o = 0;
      if (u > 0.965) o = (u - 0.965) / 0.035;
      else if (u < 0.035) o = 1 - u / 0.035;
      if (fadeEl) fadeEl.style.opacity = o.toFixed(3);
    }

    function windowed(u, a, b, f) {
      if (u <= a || u >= b) return 0;
      f = f || 0.06;
      return Math.min(1, Math.min((u - a) / f, (b - u) / f));
    }
    function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

    /* ---- Particle updates ---------------------------------------- */
    const posAmb = amb.geometry.attributes.position.array;
    const posL = lightP.geometry.attributes.position.array;
    const posC = chargeP.geometry.attributes.position.array;

    function updateAmbient(time) {
      for (let i = 0; i < AMB_N; i++) {
        const col = i < AMB_N / 2 ? -SX : SX;
        const x = col + (rng(i, 1) - 0.5) * 4.2;
        const z = (rng(i, 2) - 0.5) * 4.2;
        const ph = (time * 1.8 + rng(i, 3) * 8) % 9;
        posAmb[i * 3] = x; posAmb[i * 3 + 1] = 6.5 - ph; posAmb[i * 3 + 2] = z;
      }
      amb.geometry.attributes.position.needsUpdate = true;
    }
    function updateLight(time) {
      // warm light born at scintillator, spreading wide laterally then sinking
      for (let i = 0; i < LIGHT_N; i++) {
        const life = (time * 0.42 + rng(i, 5)) % 1;
        const ang = rng(i, 6) * Math.PI * 2;
        const rad = (0.3 + rng(i, 7) * 2.8) * life;
        posL[i * 3]     = Math.cos(ang) * rad * 1.2;
        posL[i * 3 + 1] = 2.6 - life * 2.0 + Math.sin(ang) * 0.12;
        posL[i * 3 + 2] = Math.sin(ang) * rad * 1.2;
      }
      lightP.geometry.attributes.position.needsUpdate = true;
    }
    function updateCharge(time) {
      // cold charge: tight vertical column CdTe(2.6) → CMOS(-0.4)
      for (let i = 0; i < CHARGE_N; i++) {
        const life = (time * 0.9 + rng(i, 8)) % 1;
        const lane = (i % 7 - 3) * 0.32;
        posC[i * 3]     = lane + (rng(i, 9) - 0.5) * 0.12;
        posC[i * 3 + 1] = 2.6 - life * 3.0;
        posC[i * 3 + 2] = (rng(i, 10) - 0.5) * 0.4;
      }
      chargeP.geometry.attributes.position.needsUpdate = true;
    }

    function setHero(hero, prog, vis) {
      const y = 7.2 - prog * 4.25;          // 7.2 → ~2.95 (slab top)
      hero.position.y = y;
      hero.userData.head.material.opacity = vis;
      hero.userData.streak.material.opacity = vis * 0.8;
    }

    /* ---- Render loop --------------------------------------------- */
    let running = false, rafId = 0, tPrev = 0, clock = 0, phaseT = 0;
    let px = 0, py = 0;

    function frame(now) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      if (!tPrev) tPrev = now;
      const dt = Math.min(0.05, (now - tPrev) / 1000);
      tPrev = now; clock += dt; phaseT += dt;
      const u = (phaseT % LOOP) / LOOP;

      sampleCamera(u);
      camera.position.copy(_p);
      camera.position.x += px * 0.7;
      camera.position.y += -py * 0.4;
      camera.lookAt(_t);

      updateAmbient(clock);
      updateLight(clock);
      updateCharge(clock);

      // Ambient photons fade out once we focus on a stack.
      amb.material.opacity = 0.5 * (1 - clamp01((u - 0.06) / 0.08)) + 0.12;

      // Hero photons.
      setHero(heroI, clamp01(u / 0.14), windowed(u, -0.02, 0.17, 0.03) || (u < 0.14 ? 1 : 0));
      heroI.userData.head.material.opacity = u < 0.155 ? 1 : Math.max(0, 1 - (u - 0.155) / 0.02);
      heroI.userData.streak.material.opacity = heroI.userData.head.material.opacity * 0.8;
      setHero(heroD, clamp01((u - 0.40) / 0.10), 0);
      const hdVis = (u > 0.40 && u < 0.515) ? 1 : Math.max(0, 1 - Math.abs(u - 0.50) / 0.02);
      heroD.userData.head.material.opacity = (u > 0.40 && u < 0.52) ? hdVis : 0;
      heroD.userData.streak.material.opacity = heroD.userData.head.material.opacity * 0.8;

      // INDIRECT: warm bloom + lateral spread + softened field at photodiode
      bloomI.material.opacity = 0.9 * windowed(u, 0.14, 0.34, 0.04);
      bloomI.scale.setScalar(4 + 5 * windowed(u, 0.14, 0.39, 0.12));
      lightP.material.opacity = 0.95 * windowed(u, 0.15, 0.40, 0.06);
      fieldI.material.opacity = 0.7 * windowed(u, 0.29, 0.40, 0.04);

      // DIRECT: cold impact + tight charge column + localized pixel
      sparkD.material.opacity = 0.95 * windowed(u, 0.50, 0.60, 0.03);
      chargeP.material.opacity = 0.98 * windowed(u, 0.51, 0.67, 0.05);
      pixelD.material.opacity = 0.95 * windowed(u, 0.60, 0.69, 0.03);
      pixelD.scale.setScalar(0.7 + 0.6 * windowed(u, 0.60, 0.69, 0.05));
      cmos.material.opacity = 0.7 * windowed(u, 0.55, 0.70, 0.05);
      heroEnd.material.opacity = 0.4 * windowed(u, 0.60, 0.70, 0.05);

      // COMPARISON outputs (same pattern; soft vs sharp).
      const ow = windowed(u, 0.71, 1.0, 0.05);
      outI.material.opacity = 0.95 * ow;
      outD.material.opacity = 0.98 * ow;

      renderer.render(scene3, camera);
      updateCaptions(u);
      updateTags(u);   // after render: camera matrices are current
      updateFade(u);
    }

    function resize() {
      const w = root.clientWidth || 1, h = root.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(root);
    else window.addEventListener('resize', resize);
    resize();

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      root.addEventListener('pointermove', (e) => {
        const r = root.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width - 0.5) * 2;
        py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      root.addEventListener('pointerleave', () => { px = 0; py = 0; });
    }

    function play() { if (running) return; running = true; tPrev = 0; rafId = requestAnimationFrame(frame); }
    function pause() { if (!running) return; running = false; cancelAnimationFrame(rafId); }

    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { e.isIntersecting ? play() : pause(); });
      }, { threshold: 0.15 });
      vio.observe(root);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else if (isOnScreen()) play();
    });
    function isOnScreen() {
      const r = root.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }

    return { start: () => { resize(); play(); } };
  }

  /* ===================================================
     TEXTURE HELPERS
  =================================================== */
  function makeDiscTexture(THREE) {
    const s = 64, c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // Identical resolution-target pattern; `soft` pre-blurs and widens
  // the spots (indirect), else crisp line pairs + pixel grid (direct).
  function outputPlane(THREE, soft) {
    const w = 256, h = 168, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a141b';
    ctx.fillRect(0, 0, w, h);
    if (soft) ctx.filter = 'blur(2.6px)';
    ctx.fillStyle = soft ? '#ffd9a0' : '#cdecff';
    // identical line-pair groups (increasing frequency)
    const groups = [[22, 9], [82, 6], [132, 3.6], [176, 2.2], [214, 1.4]];
    groups.forEach(([x0, bw]) => {
      for (let i = 0; i < 4; i++) ctx.fillRect(x0 + i * bw * 2, 24, bw, 86);
    });
    // identical dot row (resolution spots)
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(30 + i * 32, 138, soft ? 7 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = 'none';
    // direct gets a faint crisp pixel grid to read as "localized"
    if (!soft) {
      ctx.strokeStyle = 'rgba(120,200,255,0.18)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y <= h; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
    return new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.0), mat);
  }

  function makeTraceTexture(THREE) {
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    ctx.strokeStyle = 'rgba(95,182,230,0.85)';
    ctx.lineWidth = 1.4;
    for (let i = 1; i < 8; i++) {
      const y = i * s / 8;
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(s * (0.4 + 0.5 * ((i * 37) % 7) / 7), y);
      ctx.lineTo(s * (0.4 + 0.5 * ((i * 37) % 7) / 7), y + s / 8 - 8);
      ctx.stroke();
    }
    for (let i = 1; i < 8; i++) {
      const x = i * s / 8;
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, s * (0.3 + 0.5 * ((i * 53) % 5) / 5));
      ctx.stroke();
      ctx.fillStyle = 'rgba(150,220,255,0.9)';
      ctx.fillRect(x - 2.5, 10, 5, 5);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

})();
