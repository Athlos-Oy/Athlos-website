/* =====================================================
   ATHLOS — "PHOTON FLIGHT" CINEMATIC DETECTOR EXPERIENCE
   ---------------------------------------------------------------
   A ~16s looping WebGL film for the homepage Technology section,
   built around ONE clear physical story the viewer can follow:

     BEAT 1 (0.0–1.8s)  A single hero X-ray photon enters; the two
                        detector stacks are established.
     BEAT 2 (1.8–4.8s)  INDIRECT — the photon strikes a scintillator;
                        X-rays become WARM visible light that BLOOMS
                        and SPREADS sideways before reaching the
                        photodiode (a softer, wider signal).
     BEAT 3 (4.8–8.0s)  DIRECT — the photon strikes CdTe/Si; energy
                        becomes a COLD, tight vertical CHARGE column,
                        collected locally.
     BEAT 4 (8.0–11.5s) READOUT — camera zooms into the pixel/CMOS
                        layer: pixel electrodes collect the charge,
                        pulses travel through readout channels into the
                        CMOS/ASIC electronics, resolving into a clean
                        DIGITAL image signal (line profile + pixel
                        grid).
     BEAT 5 (11.5–16s)  COMPARISON — the same test pattern on both
                        outputs: indirect softer/wider, direct
                        sharper/localized. Summary, hold, dip reset.

   Camera grammar stays restrained: push-in onto indirect, clean
   transition to direct, zoom into the readout, pull-back for the
   comparison. Layer labels are HTML tags projected from 3D anchors,
   faded in exactly when their physical event happens.

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
    const LOOP = 16.0;
    const DPR_CAP = window.matchMedia('(max-width: 768px)').matches ? 1.3 : 1.75;

    const COL = {
      bg:       0x070d12,
      slab:     0x33424b,
      scint:    0x4a4030,
      cdte:     0x2f4a5a,
      edge:     0x8fd2f5,
      edgeWarm: 0xffcf8a,
      photon:   0xeaf4ff,
      warm:     0xffb24a,
      warmHi:   0xffe6b0,
      cold:     0x6cc8ff,
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

    slab(gI, 2.6, 0.7, { color: COL.scint, edge: COL.edgeWarm, emissive: 0x241a0c, opacity: 0.30 });
    slab(gI, 0.6, 0.5, {});
    slab(gI, -1.4, 0.5, { opacity: 0.22 });
    slab(gD, 2.6, 1.0, { color: COL.cdte, edge: COL.edge, emissive: 0x0a2230, opacity: 0.32 });
    const cmosSlab = slab(gD, -0.4, 0.7, {});

    // CMOS "microchip city" trace plane on the direct readout top.
    const CMOS_TOP = -0.04;
    const cmos = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 5.0),
      new THREE.MeshBasicMaterial({
        map: makeTraceTexture(THREE), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    cmos.rotation.x = -Math.PI / 2;
    cmos.position.set(0, CMOS_TOP, 0);
    gD.add(cmos);

    /* ---- Output comparison planes (same pattern, soft vs sharp) ---- */
    const outI = outputPlane(THREE, true);  outI.position.set(0, -3.7, 1.4); gI.add(outI);
    const outD = outputPlane(THREE, false); outD.position.set(0, -3.7, 1.4); gD.add(outD);

    /* ---- Digital "image data" payoff panel (readout result) ------ */
    const dataPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.0),
      new THREE.MeshBasicMaterial({ map: makeDataTexture(THREE), transparent: true, opacity: 0, depthWrite: false })
    );
    dataPanel.position.set(0, 0.5, 3.4);
    gD.add(dataPanel);

    /* ---- Hero photon (head sprite + streak) ---------------------- */
    function makeHero() {
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

    /* ---- Glow sprites -------------------------------------------- */
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
    const bloomI = glow(gI, COL.warm, 6, 0, 2.6, 0.4);
    const fieldI = glow(gI, COL.warm, 4.4, 0, 0.6, 0.4);
    const sparkD = glow(gD, COL.coldHi, 2.6, 0, 2.6, 0.4);
    const pixelD = glow(gD, COL.cold, 1.1, 0, -0.4, 0.3);

    /* ---- Particle systems ---------------------------------------- */
    function points(parent, count, color, size, vcolor) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      if (vcolor) geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      const mat = new THREE.PointsMaterial({
        size, map: sprite, transparent: true, opacity: vcolor ? 1 : 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
        vertexColors: !!vcolor, color: vcolor ? 0xffffff : color
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
    const lightP = points(gI, LIGHT_N, COL.warm, 1.0);
    const CHARGE_N = 64;
    const chargeP = points(gD, CHARGE_N, COL.cold, 0.55);

    /* ---- Readout: pixel electrodes (vertex-colour sweep) --------- */
    // A grid of electrodes on the CMOS surface that light up as the
    // rolling readout scan passes — local charge collection.
    const EC = [];                        // electrode anchor z values
    const cols = 6, rows = 4;
    const exs = [], ezs = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        exs.push(-2.2 + c * (4.4 / (cols - 1)));
        ezs.push(-1.65 + r * (3.3 / (rows - 1)));
      }
    }
    const EN = exs.length;
    const electrodes = points(gD, EN, COL.cold, 0.42, true);
    {
      const ap = electrodes.geometry.attributes.position.array;
      for (let i = 0; i < EN; i++) { ap[i * 3] = exs[i]; ap[i * 3 + 1] = CMOS_TOP + 0.02; ap[i * 3 + 2] = ezs[i]; EC.push(ezs[i]); }
      electrodes.geometry.attributes.position.needsUpdate = true;
    }
    const ecCol = electrodes.geometry.attributes.color.array;
    const COLD_RGB = new THREE.Color(COL.cold);

    // Readout scan bar (rolling shutter sweeping in z over the CMOS).
    const scanBar = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.22),
      new THREE.MeshBasicMaterial({ color: COL.coldHi, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    scanBar.rotation.x = -Math.PI / 2;
    scanBar.position.set(0, CMOS_TOP + 0.03, 0);
    gD.add(scanBar);

    // Channel pulses travelling toward the ASIC/bus edge (+z front).
    const PULSE_N = 12;
    const pulses = [];
    for (let i = 0; i < PULSE_N; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite, color: COL.coldHi, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      s.scale.set(0.34, 0.34, 1);
      gD.add(s);
      pulses.push({ s, lane: exs[i % cols] + (rng(i, 11) - 0.5) * 0.2, off: rng(i, 12) });
    }

    /* ---- Camera: push-in / transition / zoom / pull-back --------- */
    const KEYS = [
      { u: 0.00, p: [-2.2, 5.6, 18], t: [-3.0, 2.4, 0] },
      { u: 0.11, p: [-6.0, 3.5, 9.6], t: [-6.0, 2.5, 0] },  // BEAT2 scintillator
      { u: 0.24, p: [-6.0, 2.2, 9.4], t: [-6.0, 1.0, 0] },  // spread + photodiode
      { u: 0.31, p: [-3.0, 3.0, 10], t: [0.0, 1.6, 0] },    // transition
      { u: 0.40, p: [6.0, 3.4, 9.6], t: [6.0, 2.5, 0] },    // BEAT3 CdTe impact
      { u: 0.46, p: [6.0, 1.6, 9.0], t: [6.0, 0.2, 0] },    // follow charge down
      { u: 0.54, p: [6.0, 1.5, 6.0], t: [6.0, -0.2, 0] },   // BEAT4 zoom into CMOS
      { u: 0.62, p: [6.8, 0.9, 5.3], t: [6.2, -0.2, 0.7] }, // channels / readout scan
      { u: 0.71, p: [6.0, 0.7, 7.4], t: [6.0, 0.3, 2.2] },  // digital payoff (data panel)
      { u: 0.80, p: [3.0, -0.6, 13], t: [0.0, -2.6, 0] },   // pull back
      { u: 0.88, p: [0.0, -1.4, 19], t: [0.0, -3.4, 0] },   // BEAT5 comparison
      { u: 0.96, p: [0.0, -1.5, 18], t: [0.0, -3.4, 0] },   // hold
      { u: 1.00, p: [-2.2, 5.6, 18], t: [-3.0, 2.4, 0] }
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

    /* ---- HTML labels --------------------------------------------- */
    const capEls = {};
    root.querySelectorAll('.dce-line').forEach((el) => { capEls[el.dataset.cap] = el; });
    const CAPS = [
      ['enter',    0.015, 0.095],
      ['spread',   0.135, 0.29],
      ['charge',   0.40, 0.47],
      ['localize', 0.475, 0.525],
      ['readout',  0.55, 0.66],
      ['digital',  0.67, 0.79],
      ['summary',  0.83, 0.965]
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
    const TAGS = [
      { key: 'scintillator', pos: [-SX, 3.0, 2.7], a: 0.12, b: 0.29 },
      { key: 'photodiode',   pos: [-SX, 0.6, 2.7], a: 0.21, b: 0.29 },
      { key: 'cdte',         pos: [ SX, 3.1, 2.7], a: 0.40, b: 0.52 },
      { key: 'electrodes',   pos: [ SX, 0.0, 2.4], a: 0.53, b: 0.65 },
      { key: 'cmos',         pos: [ SX, -0.4, 2.7], a: 0.56, b: 0.66 },
      { key: 'softer',       pos: [-SX, -2.0, 1.4], a: 0.85, b: 0.99 },
      { key: 'sharper',      pos: [ SX, -2.0, 1.4], a: 0.85, b: 0.99 }
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
      if (u > 0.97) o = (u - 0.97) / 0.03;
      else if (u < 0.03) o = 1 - u / 0.03;
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
      for (let i = 0; i < CHARGE_N; i++) {
        const life = (time * 0.9 + rng(i, 8)) % 1;
        const lane = (i % 7 - 3) * 0.32;
        posC[i * 3]     = lane + (rng(i, 9) - 0.5) * 0.12;
        posC[i * 3 + 1] = 2.6 - life * 3.0;
        posC[i * 3 + 2] = (rng(i, 10) - 0.5) * 0.4;
      }
      chargeP.geometry.attributes.position.needsUpdate = true;
    }

    function setHero(hero, prog) { hero.position.y = 7.2 - prog * 4.25; }

    // Readout: scan position sweeps z across the CMOS during the beat.
    function updateReadout(u, time, env) {
      const scanProg = clamp01((u - 0.52) / 0.13);   // 0→1 across readout
      const scanZ = -2.4 + scanProg * 5.0;
      scanBar.position.z = scanZ;
      scanBar.material.opacity = 0.85 * env;

      // electrodes light as the scan passes (collected stays dim-lit).
      for (let i = 0; i < EN; i++) {
        const dz = EC[i] - scanZ;
        const flash = Math.exp(-(dz * dz) / 0.18);
        const collected = EC[i] < scanZ ? 0.32 : 0.04;
        const b = env * Math.min(1, collected + flash);
        ecCol[i * 3] = COLD_RGB.r * b;
        ecCol[i * 3 + 1] = COLD_RGB.g * b;
        ecCol[i * 3 + 2] = COLD_RGB.b * b;
      }
      electrodes.geometry.attributes.color.needsUpdate = true;

      // channel pulses travel from grid toward the ASIC bus (+z), then
      // the signal "enters" the electronics.
      for (let i = 0; i < PULSE_N; i++) {
        const pu = pulses[i];
        const life = (time * 0.65 + pu.off) % 1;
        pu.s.position.set(SX + pu.lane, CMOS_TOP + 0.04, -1.8 + life * 4.6);
        pu.s.material.opacity = env * (0.5 + 0.5 * Math.sin(life * Math.PI)) * 0.9;
      }
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

      amb.material.opacity = 0.5 * (1 - clamp01((u - 0.05) / 0.07)) + 0.12;

      // Hero photons (indirect descends 0→0.11; direct 0.31→0.40).
      setHero(heroI, clamp01(u / 0.11));
      heroI.userData.head.material.opacity = u < 0.125 ? 1 : Math.max(0, 1 - (u - 0.125) / 0.02);
      heroI.userData.streak.material.opacity = heroI.userData.head.material.opacity * 0.8;
      setHero(heroD, clamp01((u - 0.31) / 0.09));
      heroD.userData.head.material.opacity = (u > 0.31 && u < 0.415) ? 1 : Math.max(0, 1 - Math.abs(u - 0.40) / 0.02) * (u > 0.30 ? 1 : 0);
      heroD.userData.streak.material.opacity = heroD.userData.head.material.opacity * 0.8;

      // INDIRECT
      bloomI.material.opacity = 0.9 * windowed(u, 0.115, 0.27, 0.04);
      bloomI.scale.setScalar(4 + 5 * windowed(u, 0.115, 0.29, 0.10));
      lightP.material.opacity = 0.95 * windowed(u, 0.13, 0.30, 0.05);
      fieldI.material.opacity = 0.7 * windowed(u, 0.22, 0.30, 0.04);

      // DIRECT
      sparkD.material.opacity = 0.95 * windowed(u, 0.40, 0.475, 0.03);
      chargeP.material.opacity = 0.98 * windowed(u, 0.41, 0.53, 0.04);
      pixelD.material.opacity = 0.9 * windowed(u, 0.475, 0.55, 0.03);
      pixelD.scale.setScalar(0.7 + 0.6 * windowed(u, 0.475, 0.55, 0.04));

      // READOUT
      const readEnv = windowed(u, 0.50, 0.70, 0.04);
      cmos.material.opacity = 0.78 * windowed(u, 0.48, 0.72, 0.05);
      electrodes.material.opacity = readEnv > 0 ? 1 : 0;
      updateReadout(u, clock, readEnv);

      // DIGITAL payoff panel (line profile + pixel grid) — peaks then
      // lingers briefly before the pull-back.
      dataPanel.material.opacity = 0.96 * windowed(u, 0.63, 0.80, 0.04);

      // COMPARISON outputs.
      const ow = windowed(u, 0.80, 1.0, 0.04);
      outI.material.opacity = 0.95 * ow;
      outD.material.opacity = 0.98 * ow;

      renderer.render(scene3, camera);
      updateCaptions(u);
      updateTags(u);
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

  // Same resolution-target pattern; `soft` pre-blurs and widens the
  // spots (indirect), else crisp line pairs + pixel grid (direct).
  // Both carry a line-profile curve: sharp narrow peak vs broad bump.
  function outputPlane(THREE, soft) {
    const w = 256, h = 168, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a141b';
    ctx.fillRect(0, 0, w, h);
    if (soft) ctx.filter = 'blur(2.6px)';
    ctx.fillStyle = soft ? '#ffd9a0' : '#cdecff';
    const groups = [[22, 9], [82, 6], [132, 3.6], [176, 2.2], [214, 1.4]];
    groups.forEach(([x0, bw]) => {
      for (let i = 0; i < 4; i++) ctx.fillRect(x0 + i * bw * 2, 18, bw, 70);
    });
    ctx.filter = 'none';
    // line profile across the bottom: sharp peak (direct) vs broad bump
    ctx.strokeStyle = soft ? '#ffcf8a' : '#9fe0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const base = 150, cx = 128;
    for (let x = 0; x <= w; x += 2) {
      const sd = soft ? 34 : 11;
      const amp = soft ? 28 : 44;
      const yv = base - amp * Math.exp(-((x - cx) * (x - cx)) / (2 * sd * sd));
      x === 0 ? ctx.moveTo(x, yv) : ctx.lineTo(x, yv);
    }
    ctx.stroke();
    if (!soft) {
      ctx.strokeStyle = 'rgba(120,200,255,0.16)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 96); ctx.stroke(); }
      for (let y = 0; y <= 96; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
    return new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.0), mat);
  }

  // Digital "image data" payoff: framed panel with a pixel grid that
  // resolves into a sharp localized line-profile peak.
  function makeDataTexture(THREE) {
    const w = 320, h = 188, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#081019';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(120,200,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    // faint pixel grid
    ctx.strokeStyle = 'rgba(95,182,230,0.14)';
    ctx.lineWidth = 1;
    for (let x = 20; x < w - 12; x += 18) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 96); ctx.stroke(); }
    for (let y = 20; y < 100; y += 18) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(w - 12, y); ctx.stroke(); }
    // a single bright localized pixel (the detected event)
    ctx.fillStyle = 'rgba(170,225,255,0.95)';
    ctx.fillRect(20 + 6 * 18, 20 + 2 * 18, 17, 17);
    ctx.shadowColor = 'rgba(120,200,255,0.9)';
    ctx.shadowBlur = 14;
    ctx.fillRect(20 + 6 * 18, 20 + 2 * 18, 17, 17);
    ctx.shadowBlur = 0;
    // sharp line-profile readout under the grid
    ctx.strokeStyle = '#bfe9ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const base = 168, cx = 20 + 6 * 18 + 8;
    for (let x = 12; x <= w - 12; x += 2) {
      const yv = base - 52 * Math.exp(-((x - cx) * (x - cx)) / (2 * 10 * 10));
      x === 12 ? ctx.moveTo(x, yv) : ctx.lineTo(x, yv);
    }
    ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
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
