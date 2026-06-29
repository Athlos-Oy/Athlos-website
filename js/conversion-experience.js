/* =====================================================
   ATHLOS — "PHOTON FLIGHT" CINEMATIC DETECTOR EXPERIENCE
   ---------------------------------------------------------------
   A short (≈9.5s) looping WebGL film for the homepage Technology
   section. A virtual camera flies through two detector stacks:

     • Indirect — X-rays strike a scintillator, light blooms and
       SPREADS laterally before a softer signal reaches readout.
     • Direct  — X-ray energy becomes LOCALISED charge in CdTe/Si
       and is collected straight down into the CMOS readout.

   Design constraints (homepage-grade):
     • Three.js is lazy-loaded (dynamic import of a vendored, pinned
       ESM build) only when the section nears the viewport — zero
       bytes on initial page load.
     • Three independent guards fall back to the static SVG poster
       and never touch WebGL: prefers-reduced-motion, no WebGL
       context, and navigator.webdriver (keeps visual-regression
       snapshots deterministic).
     • DPR is capped, the render loop pauses when off-screen or when
       the tab is hidden, particle counts are small.
     • The loop seam is hidden by a brief dip-to-black so the camera
       reset is never visible.

   No build step / bundler — this file is a native ES module loaded
   with <script type="module"> and imports Three with import().
   ===================================================== */

(function () {
  'use strict';

  const root = document.querySelector('[data-dce]');
  if (!root) return;

  const canvas = root.querySelector('.dce-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL availability probe (cheap, disposed immediately).
  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (_) { return false; }
  }

  // Guards → keep the static poster, never load Three.
  // navigator.webdriver: automated screenshot runs (Playwright) get the
  // deterministic poster so layout baselines stay stable.
  if (reduceMotion || navigator.webdriver || !hasWebGL()) {
    root.classList.add('dce-static');
    return;
  }

  let started = false;
  let scene = null; // populated after Three loads

  // Lazy-load + boot the first time the panel scrolls near the viewport.
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
    // Switch the frame to the cinematic (aspect-boxed) dark screen while
    // Three loads. If anything fails we revert to the static poster.
    root.classList.add('dce-booting');
    let THREE;
    try {
      THREE = await import('./vendor/three.module.min.js');
    } catch (err) {
      // Network / parse failure → graceful static fallback.
      root.classList.remove('dce-booting');
      root.classList.add('dce-static');
      return;
    }
    try {
      scene = buildScene(THREE);
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
    const LOOP = 9.5;                    // seconds, full cinematic cycle
    const DPR_CAP = window.matchMedia('(max-width: 768px)').matches ? 1.3 : 1.75;

    // Palette --------------------------------------------------------
    const COL = {
      bg:       0x070d12,
      slab:     0x33424b,
      slabConv: 0x3a5260,
      edge:     0x8fd2f5,
      photon:   0xdff1ff,
      light:    0xffd271,   // warm scintillator light (spreads)
      lightHi:  0xfff2cf,
      charge:   0x73ccff,   // cool localised charge
      trace:    0x5fb6e6
    };

    // Renderer -------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    renderer.setClearColor(COL.bg, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));

    const scene3 = new THREE.Scene();
    scene3.background = new THREE.Color(COL.bg);
    scene3.fog = new THREE.Fog(COL.bg, 12, 34);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    // Lights — soft key + cool fill so the glass slabs read as form.
    scene3.add(new THREE.AmbientLight(0x33506a, 0.9));
    const key = new THREE.DirectionalLight(0xbfe4ff, 1.1);
    key.position.set(-6, 12, 10);
    scene3.add(key);
    const rim = new THREE.PointLight(0x4aa6e0, 30, 40);
    rim.position.set(8, 2, 6);
    scene3.add(rim);

    // Soft radial sprite texture, shared by all additive particles ---
    const sprite = makeDiscTexture(THREE);

    /* ---- Detector slabs (glass-like box + glowing wire edges) ---- */
    const STACK_X = 7;          // indirect at -X, direct at +X
    const gIndirect = new THREE.Group(); gIndirect.position.x = -STACK_X;
    const gDirect   = new THREE.Group(); gDirect.position.x =  STACK_X;
    scene3.add(gIndirect, gDirect);

    function slab(group, y, h, conv) {
      const w = 6, d = 6;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({
        color: conv ? COL.slabConv : COL.slab,
        metalness: 0.55, roughness: 0.35,
        transparent: true, opacity: conv ? 0.34 : 0.24,
        emissive: 0x0a1a24, emissiveIntensity: 0.6
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = y;
      group.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: COL.edge, transparent: true, opacity: 0.55 })
      );
      edges.position.y = y;
      group.add(edges);
      return mesh;
    }

    // Indirect stack: scintillator → photodiode → readout
    slab(gIndirect, 2.4, 0.6, false);
    slab(gIndirect, 0.4, 0.5, false);
    slab(gIndirect, -1.6, 0.5, false);
    // Direct stack: CdTe/Si (thicker) → CMOS
    slab(gDirect, 2.4, 0.95, true);
    slab(gDirect, -1.1, 0.6, false);

    // CMOS trace plane on the direct readout — "microchip city".
    const cmos = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 5.6),
      new THREE.MeshBasicMaterial({
        map: makeTraceTexture(THREE), transparent: true, opacity: 0.0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    cmos.rotation.x = -Math.PI / 2;
    cmos.position.set(0, -0.78, 0);
    gDirect.add(cmos);

    /* ---- Output image planes (soft vs sharp resolution targets) ---- */
    const outIndirect = outputPlane(THREE, true);
    outIndirect.position.set(0, -3.7, 1.2);
    gIndirect.add(outIndirect);
    const outDirect = outputPlane(THREE, false);
    outDirect.position.set(0, -3.7, 1.2);
    gDirect.add(outDirect);

    // Scan bar that sweeps the direct output during readout.
    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 0.18),
      new THREE.MeshBasicMaterial({
        color: 0xd6f1ff, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    scan.position.set(0, -3.7, 1.26);
    gDirect.add(scan);

    /* ---- Particle systems ---------------------------------------- */
    // Generic soft-point system.
    function points(count, color, size) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      const mat = new THREE.PointsMaterial({
        size, map: sprite, color, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      });
      const p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      return p;
    }

    // Deterministic pseudo-random so the loop is identical every cycle.
    function rng(i, salt) {
      const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
      return s - Math.floor(s);
    }

    // Photons raining onto both stacks.
    const PHOTON_N = 16;
    const photons = points(PHOTON_N, COL.photon, 0.5);
    scene3.add(photons);

    // Indirect lateral light spread.
    const LIGHT_N = 150;
    const lightP = points(LIGHT_N, COL.light, 0.95);
    gIndirect.add(lightP);

    // Direct localised charge column.
    const CHARGE_N = 70;
    const chargeP = points(CHARGE_N, COL.charge, 0.6);
    gDirect.add(chargeP);

    // Impact glow sprites at each conversion surface + hero glow.
    function glow(color, size) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite, color, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      s.scale.set(size, size, 1);
      return s;
    }
    const glowI = glow(COL.lightHi, 5); glowI.position.set(0, 2.4, 0); gIndirect.add(glowI);
    const glowD = glow(COL.charge, 3.4); glowD.position.set(0, 2.4, 0); gDirect.add(glowD);
    const glowHero = glow(COL.charge, 9); glowHero.position.set(0, 0.4, 0); gDirect.add(glowHero);

    /* ---- Camera choreography ------------------------------------- */
    // Keyframes: u in [0,1]; pos/target in world space. A dip-to-black
    // at the seam hides the wrap, so endpoints need not match exactly.
    const KEYS = [
      { u: 0.00, p: [-7, 7.5, 13],  t: [-7, 3.2, 0] }, // SHOT 1 — beam descends
      { u: 0.13, p: [-7, 4.6, 9.5], t: [-7, 2.7, 0] },
      { u: 0.30, p: [-5.2, 2.7, 7.6], t: [-7, 1.4, 0] }, // SHOT 2 — light spreads
      { u: 0.40, p: [-2, 3.4, 9],   t: [0, 1.4, 0] },   // sweep across
      { u: 0.52, p: [7, 3.3, 8.6],  t: [7, 1.6, 0] },   // SHOT 3 — direct top
      { u: 0.63, p: [6.4, 0.7, 7.0], t: [7, -1.0, 0] }, // follow charge down
      { u: 0.78, p: [0, 0.2, 17],   t: [0, -3.2, 0] },  // SHOT 4 — pull back, outputs
      { u: 0.90, p: [7, -1.6, 8.6], t: [7, -2.4, 0] },  // SHOT 5 — direct hero
      { u: 1.00, p: [-7, 7.5, 13],  t: [-7, 3.2, 0] }   // = K0 (seam covered by dip)
    ];
    function smooth(t) { return t * t * (3 - 2 * t); }
    const _p = new THREE.Vector3(), _t = new THREE.Vector3();
    function sampleCamera(u) {
      let a = KEYS[0], b = KEYS[KEYS.length - 1];
      for (let i = 0; i < KEYS.length - 1; i++) {
        if (u >= KEYS[i].u && u <= KEYS[i + 1].u) { a = KEYS[i]; b = KEYS[i + 1]; break; }
      }
      const span = (b.u - a.u) || 1;
      const e = smooth((u - a.u) / span);
      _p.set(
        a.p[0] + (b.p[0] - a.p[0]) * e,
        a.p[1] + (b.p[1] - a.p[1]) * e,
        a.p[2] + (b.p[2] - a.p[2]) * e
      );
      _t.set(
        a.t[0] + (b.t[0] - a.t[0]) * e,
        a.t[1] + (b.t[1] - a.t[1]) * e,
        a.t[2] + (b.t[2] - a.t[2]) * e
      );
    }

    /* ---- Captions (one cinematic line per shot) ------------------ */
    const lines = Array.from(root.querySelectorAll('.dce-line'));
    // [shotIndex(1-5), uStart, uEnd]
    const CAPTIONS = [
      [1, 0.02, 0.13],
      [2, 0.17, 0.33],
      [3, 0.43, 0.61],
      [4, 0.66, 0.77],
      [5, 0.82, 0.96]
    ];
    let activeLine = -1;
    function updateCaptions(u) {
      let want = -1;
      for (let i = 0; i < CAPTIONS.length; i++) {
        if (u >= CAPTIONS[i][1] && u <= CAPTIONS[i][2]) { want = i; break; }
      }
      if (want === activeLine) return;
      activeLine = want;
      lines.forEach((el, i) => el.classList.toggle('is-on', i === want));
    }

    // Dip-to-black overlay at the loop seam.
    const fade = root.querySelector('.dce-fade');
    function updateFade(u) {
      let o = 0;
      if (u > 0.965) o = (u - 0.965) / 0.035;
      else if (u < 0.035) o = 1 - u / 0.035;
      if (fade) fade.style.opacity = o.toFixed(3);
    }

    // Window helper: smooth 0→1→0 ramp across [a,b] with edge feather.
    function windowed(u, a, b, feather) {
      if (u <= a || u >= b) return 0;
      const f = feather || 0.06;
      const up = Math.min(1, (u - a) / f);
      const dn = Math.min(1, (b - u) / f);
      return Math.min(up, dn);
    }

    /* ---- Per-frame particle updates ------------------------------ */
    const pos = {
      photon: photons.geometry.attributes.position.array,
      light: lightP.geometry.attributes.position.array,
      charge: chargeP.geometry.attributes.position.array
    };

    function updatePhotons(time) {
      const arr = pos.photon;
      for (let i = 0; i < PHOTON_N; i++) {
        const col = i < PHOTON_N / 2 ? -STACK_X : STACK_X;
        const lane = i % (PHOTON_N / 2);
        const x = col + (rng(i, 1) - 0.5) * 4.4;
        const z = (rng(i, 2) - 0.5) * 4.4;
        const speed = 2.2 + rng(i, 3) * 1.2;
        const phase = (time * speed + lane * 1.3 + rng(i, 4) * 6) % 7;
        const y = 6.2 - phase;            // fall from above to ~ -0.8
        arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
      }
      photons.geometry.attributes.position.needsUpdate = true;
    }

    function updateLight(time) {
      // Particles born at the scintillator surface, drifting laterally
      // (wide in X/Z) and slowly sinking — the light "spreads".
      const arr = pos.light;
      for (let i = 0; i < LIGHT_N; i++) {
        const life = (time * 0.5 + rng(i, 5)) % 1;
        const ang = rng(i, 6) * Math.PI * 2;
        const rad = (0.3 + rng(i, 7) * 2.6) * life;
        arr[i * 3]     = Math.cos(ang) * rad * 1.15;
        arr[i * 3 + 1] = 2.4 - life * 1.7 + Math.sin(ang) * 0.15;
        arr[i * 3 + 2] = Math.sin(ang) * rad * 1.15;
      }
      lightP.geometry.attributes.position.needsUpdate = true;
    }

    function updateCharge(time) {
      // Tight vertical column: born at CdTe surface, collected straight
      // down to the CMOS — minimal lateral drift.
      const arr = pos.charge;
      for (let i = 0; i < CHARGE_N; i++) {
        const life = (time * 0.85 + rng(i, 8)) % 1;
        const lane = (i % 9 - 4) * 0.42;
        arr[i * 3]     = lane + (rng(i, 9) - 0.5) * 0.18;
        arr[i * 3 + 1] = 2.3 - life * 3.1;
        arr[i * 3 + 2] = (rng(i, 10) - 0.5) * 0.5;
      }
      chargeP.geometry.attributes.position.needsUpdate = true;
    }

    /* ---- Render loop --------------------------------------------- */
    // `clock` drives particle motion; `phaseT` drives the cinematic
    // timeline. Both are accumulators, so they freeze on pause and the
    // loop resumes exactly where it left off (no phase jump).
    let running = false, rafId = 0, tPrev = 0, clock = 0, phaseT = 0;
    let px = 0, py = 0; // pointer parallax

    function frame(now) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      if (!tPrev) tPrev = now;
      const dt = Math.min(0.05, (now - tPrev) / 1000);
      tPrev = now;
      clock += dt;
      phaseT += dt;
      const u = (phaseT % LOOP) / LOOP;

      // Camera + subtle pointer parallax.
      sampleCamera(u);
      camera.position.copy(_p);
      camera.position.x += px * 0.9;
      camera.position.y += -py * 0.5;
      camera.lookAt(_t);

      updatePhotons(clock);
      updateLight(clock);
      updateCharge(clock);

      // Phase-gated opacities.
      photons.material.opacity = 0.85;
      const lw = windowed(u, 0.14, 0.40, 0.07);
      lightP.material.opacity = 0.9 * lw;
      glowI.material.opacity = 0.85 * windowed(u, 0.15, 0.36, 0.05);
      glowI.scale.setScalar(4 + 3 * windowed(u, 0.15, 0.40, 0.1));

      const cw = windowed(u, 0.42, 0.66, 0.06);
      chargeP.material.opacity = 0.95 * cw;
      glowD.material.opacity = 0.8 * windowed(u, 0.43, 0.6, 0.05);
      cmos.material.opacity = 0.7 * windowed(u, 0.5, 0.7, 0.08);

      // Output reveal + scan sweep (shot 4) and hero glow (shot 5).
      const ow = windowed(u, 0.64, 0.82, 0.05);
      // Indirect output only during the comparison shot; the direct
      // output lingers into the hero hold.
      outIndirect.material.opacity = 0.95 * ow;
      outDirect.material.opacity = 0.98 * Math.max(ow, windowed(u, 0.8, 0.97, 0.06));
      const sweep = windowed(u, 0.66, 0.78, 0.02);
      scan.material.opacity = 0.9 * sweep;
      scan.position.y = -3.7 + 1.5 - (u - 0.66) / 0.12 * 3.0;
      glowHero.material.opacity = 0.55 * windowed(u, 0.82, 0.97, 0.06);

      updateCaptions(u);
      updateFade(u);

      renderer.render(scene3, camera);
    }

    /* ---- Sizing -------------------------------------------------- */
    function resize() {
      const w = root.clientWidth || 1;
      const h = root.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(root);
    else window.addEventListener('resize', resize);
    resize();

    /* ---- Pointer parallax (desktop fine-pointer only) ------------ */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      root.addEventListener('pointermove', (e) => {
        const r = root.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width - 0.5) * 2;
        py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      root.addEventListener('pointerleave', () => { px = 0; py = 0; });
    }

    /* ---- Run/pause gating ---------------------------------------- */
    function play() {
      if (running) return;
      running = true;
      tPrev = 0;                 // re-baseline dt on the next frame
      rafId = requestAnimationFrame(frame);
    }
    function pause() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    }

    // Visibility: pause when scrolled away or tab hidden.
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

  // Resolution-target line pairs; `soft` pre-blurs to read as the
  // indirect (less localised) output.
  function outputPlane(THREE, soft) {
    const w = 256, h = 160, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a141b';
    ctx.fillRect(0, 0, w, h);
    if (soft) ctx.filter = 'blur(2.2px)';
    ctx.fillStyle = '#bfe6ff';
    // groups of vertical bars at increasing frequency (line pairs)
    const groups = [[24, 8], [86, 5], [134, 3.2], [176, 2], [212, 1.3]];
    groups.forEach(([x0, bw]) => {
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x0 + i * bw * 2, 28, bw, 104);
      }
    });
    ctx.filter = 'none';
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    const geo = new THREE.PlaneGeometry(4.8, 3);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0, depthWrite: false
    });
    return new THREE.Mesh(geo, mat);
  }

  // "Microchip city" — thin emissive traces + pads.
  function makeTraceTexture(THREE) {
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(8,18,26,0)';
    ctx.fillRect(0, 0, s, s);
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
