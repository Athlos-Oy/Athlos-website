/* =====================================================
   ATHLOS — DIRECT vs INDIRECT CONVERSION: LAYER DEMONSTRATION FILM
   ---------------------------------------------------------------
   A ~13s looping WebGL film for the homepage Technology section.
   The camera establishes the real Athlos module, then holds a calm,
   stable layer-level view while the physics is demonstrated slowly,
   step by step — a layer-by-layer explanation, not a camera dive.

     SHOT 1 (0.0–2.0s)   WIDE — the engineered module; X-ray photons
                         fall STRAIGHT DOWN, normal to the surface.
     SHOT 2 (2.0–3.0s)   ZOOM to a clean layer-level view; the section
                         cut opens the housing and reveals two
                         magnified cross-section stages side by side.
     SHOT 3 (3.0–6.5s)   INDIRECT stage (left), camera nearly static:
                         photon hits the SCINTILLATOR → converts to
                         visible light → DEFINED RAYS spread laterally
                         → several PHOTODIODE PIXELS activate over a
                         WIDE readout footprint.
     SHOT 4 (6.5–10.0s)  Calm glide to the DIRECT stage (right), same
                         layer layout: photon hits the CdTe/Si layer →
                         localized charge → NARROW vertical signal
                         path → ONE CMOS pixel activates. The indirect
                         stage's wide footprint stays lit for contrast.
     SHOT 5 (10.0–15s)   Pull out: the INDIRECT output graph reveals
                         first and holds alone (softer), then the
                         DIRECT graph beside it (sharper); both hold
                         ~2s extra (slow drift) before the loop seam.
                         "Direct conversion removes the scintillator
                         light-spread stage."

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
    const LOOP = 18.3;
    const DPR_CAP = window.matchMedia('(max-width: 768px)').matches ? 1.3 : 1.75;

    const COL = {
      bg:      0x05090d,
      body:    0x161b21,
      photon:  0xeaf4ff,
      warm:    0xffb24a,
      warmHi:  0xffe6b0,
      cold:    0x6cc8ff,
      coldHi:  0xd6f1ff,
      edge:    0x8fd2f5,
      amberEdge: 0xd9b073
    };

    // Story geography (world units ~ cm).
    const HX = -1.2;      // wide-shot hero photon x (hits the window)
    const HZ = 0.95;      // entrance-window strip z
    const IX = -2.4;      // INDIRECT demonstration stage center x
    const DX = 2.4;       // DIRECT demonstration stage center x
    const SZ = 0.3;       // stage center z (inside the opened housing)

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    renderer.setClearColor(COL.bg, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.localClippingEnabled = true;

    const scene3 = new THREE.Scene();
    scene3.background = new THREE.Color(COL.bg);
    scene3.fog = new THREE.Fog(COL.bg, 18, 52);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 120);

    scene3.add(new THREE.AmbientLight(0x2e4356, 0.85));
    const key = new THREE.DirectionalLight(0xcfe8ff, 1.15);
    key.position.set(6, 11, 7);
    scene3.add(key);
    const rim = new THREE.DirectionalLight(0x6fb7e0, 0.55);
    rim.position.set(-8, 4, -7);
    scene3.add(rim);

    const sprite = makeDiscTexture(THREE);

    /* ---- Stage: ground, engineering grid, contact shadow --------- */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({ color: 0x0a0e12, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.36;
    scene3.add(ground);

    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 64),
      new THREE.MeshBasicMaterial({
        map: makeGridTexture(THREE), transparent: true, opacity: 0.16,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -1.35;
    scene3.add(grid);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(14.5, 9),
      new THREE.MeshBasicMaterial({
        map: makeShadowTexture(THREE), transparent: true, opacity: 0.55, depthWrite: false
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.345;
    scene3.add(shadow);

    /* ==============================================================
       THE DETECTOR MODULE — housing (clipped by the section plane)
       Black machined body, carbon window strip, fins, connector,
       lugs, screws. All housing materials share one clip plane so
       the section cut sweeps the near half away as one gesture.
    ============================================================== */
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 3.6);
    const HOUSE_MATS = [];
    function houseMat(opt) {
      const m = new THREE.MeshStandardMaterial(Object.assign({
        color: COL.body, metalness: 0.72, roughness: 0.42,
        transparent: true, opacity: 1,
        clippingPlanes: [clipPlane]
      }, opt || {}));
      HOUSE_MATS.push(m);
      return m;
    }

    const bodyMat = houseMat({});
    // Rounded-rect extruded body with chamfered (bevelled) edges.
    {
      const w = 10, d = 5.6, r = 0.35;
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2 + r, -d / 2);
      shape.lineTo(w / 2 - r, -d / 2);
      shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
      shape.lineTo(w / 2, d / 2 - r);
      shape.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
      shape.lineTo(-w / 2 + r, d / 2);
      shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
      shape.lineTo(-w / 2, -d / 2 + r);
      shape.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.96, bevelEnabled: true, bevelThickness: 0.07,
        bevelSize: 0.07, bevelSegments: 2, curveSegments: 6
      });
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, -1.03, 0);
      scene3.add(new THREE.Mesh(geo, bodyMat));
    }

    // Carbon-fibre entrance window strip (recessed, near long edge).
    const carbonMat = houseMat({
      map: makeCarbonTexture(THREE), color: 0xffffff,
      metalness: 0.35, roughness: 0.5
    });
    const winGeo = new THREE.BoxGeometry(8.4, 0.05, 1.5);
    const winMesh = new THREE.Mesh(winGeo, carbonMat);
    winMesh.position.set(0, -0.015, HZ);
    scene3.add(winMesh);
    const winFrameMat = new THREE.LineBasicMaterial({
      color: 0x51707f, transparent: true, opacity: 0.4, clippingPlanes: [clipPlane]
    });
    HOUSE_MATS.push(winFrameMat);
    const winFrame = new THREE.LineSegments(new THREE.EdgesGeometry(winGeo), winFrameMat);
    winFrame.position.copy(winMesh.position);
    scene3.add(winFrame);

    // Heatsink fins along the back edge.
    {
      const finGeo = new THREE.BoxGeometry(0.34, 0.66, 0.46);
      const fins = new THREE.InstancedMesh(finGeo, bodyMat, 16);
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < 16; i++) {
        m4.setPosition(-4.5 + i * (9.0 / 15), -0.62, -3.02);
        fins.setMatrixAt(i, m4);
      }
      scene3.add(fins);
    }
    // Mounting lugs at the corners.
    {
      const lugGeo = new THREE.BoxGeometry(0.55, 0.28, 0.6);
      const lugs = new THREE.InstancedMesh(lugGeo, bodyMat, 4);
      const m4 = new THREE.Matrix4();
      [[-4.0, -3.05], [4.0, -3.05], [-4.0, 3.05], [4.0, 3.05]].forEach((p, i) => {
        m4.setPosition(p[0], -0.98, p[1]);
        lugs.setMatrixAt(i, m4);
      });
      scene3.add(lugs);
    }
    // Top-face screws.
    {
      const screwMat = houseMat({ color: 0x2a3138, metalness: 0.85, roughness: 0.3 });
      const screwGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 10);
      const screws = new THREE.InstancedMesh(screwGeo, screwMat, 6);
      const m4 = new THREE.Matrix4();
      [[-4.5, -2.4], [-4.5, 2.4], [4.5, -2.4], [4.5, 2.4], [0, -2.4], [0, 2.4]].forEach((p, i) => {
        m4.setPosition(p[0], 0.008, p[1]);
        screws.setMatrixAt(i, m4);
      });
      scene3.add(screws);
    }
    // M12-style connector on the end face.
    {
      const connMat = houseMat({ color: 0x22282e, metalness: 0.85, roughness: 0.35 });
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.52, 16), connMat);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(5.2, -0.55, -1.5);
      scene3.add(barrel);
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 12), connMat);
      tip.rotation.z = Math.PI / 2;
      tip.position.set(5.52, -0.55, -1.5);
      scene3.add(tip);
    }

    // The glowing SECTION-CUT light (the cutaway gesture itself).
    const cutLight = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 1.22, 0.03),
      new THREE.MeshBasicMaterial({
        color: 0x7fd0f7, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    cutLight.position.set(0, -0.55, 3.6);
    scene3.add(cutLight);

    // Interior base board the stages sit above.
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.09, 4.9),
      new THREE.MeshStandardMaterial({ color: 0x0f151a, metalness: 0.3, roughness: 0.7 })
    );
    pcb.position.set(0, -1.18, 0);
    scene3.add(pcb);

    /* ==============================================================
       SHARED ACTOR HELPERS
    ============================================================== */
    function glowSprite(color, size, x, y, z) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite, color, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      s.scale.set(size, size, 1);
      s.position.set(x, y, z);
      scene3.add(s);
      return s;
    }

    // A vertical X-ray photon: bright head + short streak trailing up.
    function photonActor(x, z) {
      const g = new THREE.Group();
      const head = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite, color: COL.photon, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      head.scale.set(0.34, 0.34, 1);
      const streak = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.9, 0.035),
        new THREE.MeshBasicMaterial({
          color: COL.photon, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      streak.position.y = 0.55;
      g.add(streak, head);
      g.position.set(x, 10, z);
      scene3.add(g);
      return { g, head, streak };
    }

    function points(count, color, size) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      const p = new THREE.Points(geo, new THREE.PointsMaterial({
        size, map: sprite, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, color
      }));
      p.frustumCulled = false;
      scene3.add(p);
      return p;
    }
    function rng(i, salt) {
      const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
      return s - Math.floor(s);
    }

    /* ==============================================================
       DEMONSTRATION STAGES — two magnified cross-sections, side by
       side inside the opened housing. Identical layer layout so the
       comparison is direct: conversion layer on top, an 11-pixel
       readout row below it, substrate at the bottom.
    ============================================================== */
    const PIX_N = 11, PIX_PITCH = 0.31, PIX_W = 0.27, PIX_H = 0.16;
    // A clear air gap between the conversion slab and the readout row
    // so the two layers read as distinct.
    const SLAB_TOP = -0.12, SLAB_BOT = -0.54, PIX_TOP = -0.76, PIX_CY = -0.84;

    function buildStage(x, warm) {
      const grp = new THREE.Group();
      grp.position.set(x, 0, SZ);
      scene3.add(grp);

      // Conversion layer slab (scintillator: warm; CdTe/Si: cool slate).
      const slabMat = new THREE.MeshStandardMaterial({
        color: warm ? 0x6b5c3a : 0x274150,
        emissive: warm ? 0x2a2010 : 0x0b2130, emissiveIntensity: 0.8,
        transparent: true, opacity: 0, roughness: 0.3, metalness: 0.12,
        depthWrite: false
      });
      const slab = new THREE.Mesh(new THREE.BoxGeometry(3.4, SLAB_TOP - SLAB_BOT, 1.1), slabMat);
      slab.position.y = (SLAB_TOP + SLAB_BOT) / 2;
      grp.add(slab);
      const edgeMat = new THREE.LineBasicMaterial({
        color: warm ? COL.amberEdge : COL.edge, transparent: true, opacity: 0
      });
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), edgeMat);
      edges.position.copy(slab.position);
      grp.add(edges);

      // Readout pixel row — 11 individually lightable cells.
      const pixGeo = new THREE.BoxGeometry(PIX_W, PIX_H, 1.1);
      const pixMats = [], pixGlows = [];
      for (let i = 0; i < PIX_N; i++) {
        const m = new THREE.MeshStandardMaterial({
          color: 0x151c23, metalness: 0.6, roughness: 0.4,
          emissive: warm ? COL.warm : COL.cold, emissiveIntensity: 0.02,
          transparent: true, opacity: 0
        });
        const px = new THREE.Mesh(pixGeo, m);
        px.position.set((i - (PIX_N - 1) / 2) * PIX_PITCH, PIX_CY, 0);
        grp.add(px);
        pixMats.push(m);
        const gl = glowSprite(warm ? COL.warm : COL.cold, 0.42,
          x + (i - (PIX_N - 1) / 2) * PIX_PITCH, PIX_CY + 0.04, SZ + 0.6);
        pixGlows.push(gl);
      }

      // Substrate under the pixel row.
      const subMat = new THREE.MeshStandardMaterial({
        color: 0x11181e, metalness: 0.55, roughness: 0.5,
        transparent: true, opacity: 0
      });
      const sub = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.10, 1.1), subMat);
      sub.position.y = -1.0;
      grp.add(sub);

      // Signal-footprint underline beneath the pixel row.
      const foot = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.07),
        new THREE.MeshBasicMaterial({
          color: warm ? COL.warm : COL.cold, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      foot.position.set(x, -1.085, SZ + 0.58);
      scene3.add(foot);

      // Photon + impact flash for this stage.
      const photon = photonActor(x, SZ + 0.2);
      const flash = glowSprite(COL.coldHi, 1.1, x, 0, SZ + 0.25);

      return { grp, slabMat, edgeMat, pixMats, pixGlows, subMat, foot, photon, flash };
    }

    const stageI = buildStage(IX, true);
    const stageD = buildStage(DX, false);

    /* ---- INDIRECT-only actors: conversion glow, wavefront, rays --- */
    const I_ABS = { x: IX, y: -0.24 };            // absorption point (world)
    const convGlow = glowSprite(COL.warm, 0.9, I_ABS.x, I_ABS.y, SZ + 0.22);

    // Expanding wavefront arc — the "controlled spread" made visible.
    const arc = (function () {
      const n = 40, geo = new THREE.BufferGeometry();
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const th = Math.PI + (i / (n - 1)) * Math.PI;   // lower semicircle
        arr[i * 3] = Math.cos(th); arr[i * 3 + 1] = Math.sin(th); arr[i * 3 + 2] = 0;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const l = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: COL.warmHi, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      l.position.set(I_ABS.x, I_ABS.y, SZ + 0.2);
      scene3.add(l);
      return l;
    })();

    // Defined light rays: one per target pixel (indices 1..9), fanning
    // out from the conversion point to the photodiode row — sharp
    // glowing paths, not a cloud. Plus a few short upward scatter rays.
    const _down = new THREE.Vector3(0, -1, 0);
    function makeRay(fromX, fromY, toX, toY, width, warmHue) {
      const geo = new THREE.PlaneGeometry(width, 1);
      geo.translate(0, -0.5, 0);                 // origin at the ray start
      const mat = new THREE.MeshBasicMaterial({
        color: warmHue ? COL.warmHi : COL.coldHi, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(fromX, fromY, SZ + 0.24);
      const dir = new THREE.Vector3(toX - fromX, toY - fromY, 0);
      const len = dir.length();
      dir.normalize();
      mesh.quaternion.setFromUnitVectors(_down, dir);
      scene3.add(mesh);
      return { mesh, mat, len, ox: fromX, oy: fromY, dx: dir.x, dy: dir.y };
    }

    const RAYS = [];
    for (let i = 1; i <= 9; i++) {
      const d = Math.abs(i - 5);
      const tx = IX + (i - (PIX_N - 1) / 2) * PIX_PITCH;
      const r = makeRay(I_ABS.x, I_ABS.y, tx, PIX_TOP, 0.05 - d * 0.006, true);
      r.d = d;
      r.tip = glowSprite(COL.warmHi, 0.26 - d * 0.03, I_ABS.x, I_ABS.y, SZ + 0.26);
      RAYS.push(r);
    }
    // Short upward scatter rays (light goes everywhere; readout is below).
    const SCATTER = [];
    [[-0.5, 0.85], [-0.2, 0.98], [0.25, 0.97], [0.55, 0.83]].forEach(([sx, sy]) => {
      const s = makeRay(I_ABS.x, I_ABS.y, I_ABS.x + sx * 0.18, I_ABS.y + sy * 0.18, 0.03, true);
      SCATTER.push(s);
    });

    /* ---- DIRECT-only actors: charge cluster, narrow signal beam --- */
    const D_ABS = { x: DX, y: -0.30 };
    const CHARGE_N = 42;
    const chargeP = points(CHARGE_N, COL.cold, 0.16);
    const posC = chargeP.geometry.attributes.position.array;

    const beam = (function () {
      const geo = new THREE.PlaneGeometry(0.07, 1);
      geo.translate(0, -0.5, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: COL.coldHi, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      }));
      m.position.set(D_ABS.x, D_ABS.y, SZ + 0.24);
      scene3.add(m);
      return m;
    })();
    const beamPulse = glowSprite(COL.coldHi, 0.3, D_ABS.x, D_ABS.y, SZ + 0.26);
    const hitGlow = glowSprite(COL.cold, 0.55, DX, PIX_TOP + 0.02, SZ + 0.3);

    /* ---- Wide-shot beam actors ------------------------------------ */
    const wideHero = photonActor(HX, HZ);
    const winRipple = glowSprite(COL.coldHi, 0.7, HX, 0.05, HZ);
    const SIDEKICKS = [];
    [[-3.2, 0.0], [0.6, 0.018], [2.4, 0.036]].forEach(([sx, off]) => {
      SIDEKICKS.push({ s: glowSprite(COL.photon, 0.3, sx, 7, HZ), off });
    });

    /* ---- FINAL COMPARISON — sequential scan-line reveal ----------- */
    function outputPanel(soft, x) {
      const tex = makeOutputTexture(THREE, soft);
      const geo = new THREE.PlaneGeometry(3.3, 2.2);
      geo.translate(0, -1.1, 0);           // origin at the top edge (scan reveal)
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0, depthWrite: false
      }));
      mesh.position.set(x, 3.15, 0.4);
      scene3.add(mesh);
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(3.3, 0.06),
        new THREE.MeshBasicMaterial({
          color: soft ? COL.warmHi : COL.coldHi, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      bar.position.set(x, 3.15, 0.42);
      scene3.add(bar);
      return { mesh, bar, tex };
    }
    const panelI = outputPanel(true, -1.85);
    const panelD = outputPanel(false, 1.85);

    /* ==============================================================
       CAMERA — wide establish, then STABLE per-stage views with only
       micro-drift; one calm glide between them; pull out at the end.
    ============================================================== */
    const KEYS = [
      { u: 0.000, p: [7.0, 8.0, 12.0],   t: [-0.2, 3.0, 0.0] },   // WIDE: module + falling beam
      { u: 0.140, p: [5.0, 6.0, 10.0],   t: [-0.4, 1.6, 0.6] },   // slow push-in
      { u: 0.188, p: [0.8, 3.6, 9.0],    t: [-1.6, 0.1, 0.3] },   // swing out front as the cut opens
      { u: 0.231, p: [-2.4, 0.38, 5.75], t: [-2.4, -0.38, 0.3] }, // INDIRECT stage, face-on, static
      { u: 0.480, p: [-2.26, 0.33, 5.5], t: [-2.38, -0.41, 0.3] },// micro drift only
      { u: 0.545, p: [2.3, 0.38, 5.75],  t: [2.36, -0.38, 0.3] }, // calm glide to the DIRECT stage
      { u: 0.755, p: [2.48, 0.33, 5.5],  t: [2.42, -0.41, 0.3] }, // micro drift only
      { u: 0.805, p: [0.7, 3.3, 9.9],    t: [0.0, 1.4, 0.3] },    // pull out to the outputs
      { u: 0.970, p: [0.2, 3.5, 10.2],   t: [0.0, 1.45, 0.3] },   // long hold, drift
      { u: 1.000, p: [7.0, 8.0, 12.0],   t: [-0.2, 3.0, 0.0] }    // loop (in fade)
    ];
    function smooth(t) { return t * t * (3 - 2 * t); }
    // Wall-clock → story position. All animation windows are fractions
    // of the original 13s film: entry and zoom play at that pace, the
    // two layer demonstrations run ~16% slower (calmer), and the final
    // graph comparison holds ~4s in slow drift before the loop seam.
    const TIME_MAP = [
      [0, 0], [3.0, 0.2308],     // wide shot + zoom, original pace
      [11.3, 0.7692],            // both layer demos, slowed
      [13.6, 0.946],             // pull-out + graph reveals, original pace
      [17.6, 0.975],             // long hold on the comparison
      [18.3, 1.0]                // fade through the seam
    ];
    function storyU(t) {
      for (let i = 0; i < TIME_MAP.length - 1; i++) {
        const a = TIME_MAP[i], b = TIME_MAP[i + 1];
        if (t <= b[0]) return a[1] + (b[1] - a[1]) * ((t - a[0]) / (b[0] - a[0]));
      }
      return 1;
    }
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

    /* ---- HTML captions & 3D-anchored tags ------------------------- */
    const capEls = {};
    root.querySelectorAll('.dce-line').forEach((el) => { capEls[el.dataset.cap] = el; });
    const CAPS = [
      ['enter',    0.02, 0.135],
      ['indirect', 0.245, 0.485],
      ['direct',   0.555, 0.755],
      ['payoff',   0.885, 0.985]
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
    // sh: vertical shift — '-150%' floats the label above its anchor,
    // '55%' hangs it below (used for the readout-row labels).
    const TAGS = [
      // indirect stage: persistent layer labels + sequential step labels
      { key: 'scintillator', pos: [IX - 1.15, -0.06, SZ + 0.6],  a: 0.240, b: 0.475 },
      { key: 'photodiode',   pos: [IX - 1.30, -0.96, SZ + 0.6],  a: 0.250, b: 0.475, sh: '55%' },
      { key: 'becomeLight',  pos: [IX + 0.45, 0.06, SZ + 0.3],   a: 0.274, b: 0.355 },
      { key: 'spreads',      pos: [IX + 1.30, -0.10, SZ + 0.3],  a: 0.318, b: 0.428 },
      { key: 'footWide',     pos: [IX + 0.55, -1.08, SZ + 0.6],  a: 0.402, b: 0.478, sh: '55%' },
      // direct stage: same layout
      { key: 'cdte',         pos: [DX - 1.15, -0.06, SZ + 0.6],  a: 0.552, b: 0.748 },
      { key: 'cmos',         pos: [DX - 1.30, -0.96, SZ + 0.6],  a: 0.560, b: 0.748, sh: '55%' },
      { key: 'chargeGen',    pos: [DX + 0.45, 0.02, SZ + 0.3],   a: 0.592, b: 0.662 },
      { key: 'path',         pos: [DX + 0.85, -0.30, SZ + 0.3],  a: 0.636, b: 0.712 },
      { key: 'footNarrow',   pos: [DX + 0.55, -1.08, SZ + 0.6],  a: 0.686, b: 0.752, sh: '55%' },
      // payoff: graph titles above, localization verdicts below
      { key: 'graphI',       pos: [-1.85, 3.34, 0.4],  a: 0.800, b: 0.985 },
      { key: 'graphD',       pos: [1.85, 3.34, 0.4],   a: 0.880, b: 0.985 },
      { key: 'softer',       pos: [-1.85, 0.72, 0.42], a: 0.815, b: 0.985 },
      { key: 'sharper',      pos: [1.85, 0.72, 0.42],  a: 0.895, b: 0.985 }
    ];
    const _v = new THREE.Vector3();
    function updateTags(u) {
      const W = root.clientWidth, H = root.clientHeight;
      for (let i = 0; i < TAGS.length; i++) {
        const t = TAGS[i], el = tagEls[t.key];
        if (!el) continue;
        const o = windowed(u, t.a, t.b, 0.03);
        if (o <= 0.001) { el.style.opacity = '0'; continue; }
        _v.set(t.pos[0], t.pos[1], t.pos[2]).project(camera);
        if (_v.z > 1) { el.style.opacity = '0'; continue; }
        const x = (_v.x * 0.5 + 0.5) * W;
        const y = (-_v.y * 0.5 + 0.5) * H;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) +
          'px) translate(-50%,' + (t.sh || '-150%') + ')';
        el.style.opacity = o.toFixed(3);
      }
    }

    const fadeEl = root.querySelector('.dce-fade');
    function updateFade(u) {
      let o = 0;
      if (u > 0.975) o = (u - 0.975) / 0.025;
      else if (u < 0.025) o = 1 - u / 0.025;
      if (fadeEl) fadeEl.style.opacity = o.toFixed(3);
    }

    function windowed(u, a, b, f) {
      if (u <= a || u >= b) return 0;
      f = f || 0.06;
      return Math.min(1, Math.min((u - a) / f, (b - u) / f));
    }
    function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function lerp(a, b, t) { return a + (b - a) * t; }

    /* ==============================================================
       PER-FRAME STORY LOGIC
    ============================================================== */
    // Per-pixel activation profile for the INDIRECT footprint: a wide
    // gaussian — 9 of 11 pixels receive light, brightest at center.
    const G_WIDE = [1.0, 0.82, 0.55, 0.30, 0.14];

    function setPhoton(actor, x, z, yFrom, yTo, u, a, b) {
      const e = clamp01((u - a) / (b - a));
      actor.g.position.set(x, lerp(yFrom, yTo, smooth(e)), z);
      const op = (u > a && u < b + 0.006) ? Math.min(1, (u - a) / 0.012, (b + 0.006 - u) / 0.008) : 0;
      actor.head.material.opacity = op;
      actor.streak.material.opacity = op * 0.7;
      return e;
    }

    // The whole demonstration (both stages) fades in with the cutaway
    // and out again just before the pull-out to the output graphs.
    function stagePresence(u) { return windowed(u, 0.205, 0.788, 0.05); }

    function updateIndirect(u, clock, env) {
      const st = stageI;
      st.slabMat.opacity = 0.32 * env;
      st.edgeMat.opacity = 0.65 * env;
      st.subMat.opacity = 0.9 * env;

      // STEP A — the X-ray photon drops straight down into the slab.
      setPhoton(st.photon, IX, SZ + 0.2, 1.5, I_ABS.y, u, 0.238, 0.272);

      // STEP B — conversion flash: X-rays become visible light.
      st.flash.position.set(I_ABS.x, I_ABS.y, SZ + 0.25);
      st.flash.material.opacity = 0.95 * windowed(u, 0.269, 0.31, 0.008) * env;
      st.flash.scale.setScalar(0.35 + 0.75 * clamp01((u - 0.269) / 0.035));
      convGlow.material.opacity = 0.85 * windowed(u, 0.272, 0.492, 0.02) * env;
      convGlow.scale.setScalar(0.4 + 0.3 * clamp01((u - 0.272) / 0.06) +
        0.04 * Math.sin(clock * 5));

      // STEP C — defined rays fan out laterally to the photodiode row,
      // led by an expanding wavefront arc.
      const wf = smooth(clamp01((u - 0.302) / 0.115));
      const wr = 0.15 + 1.5 * wf;
      arc.scale.set(wr, wr * 0.42, 1);
      arc.material.opacity = 0.55 * windowed(u, 0.302, 0.445, 0.02) * env;

      for (let i = 0; i < RAYS.length; i++) {
        const r = RAYS[i];
        const sk = 0.305 + 0.018 * r.d;
        const prog = smooth(clamp01((u - sk) / 0.045));
        r.mesh.scale.y = Math.max(r.len * prog, 0.001);
        const op = (0.9 - 0.09 * r.d) * windowed(u, sk, 0.492, 0.022) * env;
        r.mat.opacity = op;
        r.tip.position.set(r.ox + r.dx * r.len * prog, r.oy + r.dy * r.len * prog, SZ + 0.26);
        r.tip.material.opacity = op * (prog < 0.99 ? 0.85 : 0.4);
      }
      for (let i = 0; i < SCATTER.length; i++) {
        const s = SCATTER[i];
        const prog = smooth(clamp01((u - 0.305) / 0.05));
        s.mesh.scale.y = Math.max(s.len * prog, 0.001);
        s.mat.opacity = 0.4 * windowed(u, 0.305, 0.46, 0.025) * env;
      }

      // STEP D — the spread light arrives: SEVERAL pixels activate,
      // wider area = wider signal footprint. They stay lit through the
      // direct demo so the contrast is side by side.
      for (let i = 0; i < PIX_N; i++) {
        const d = Math.abs(i - 5);
        const g = (i >= 1 && i <= 9) ? G_WIDE[d] : 0;
        const amt = g * smooth(clamp01((u - (0.335 + 0.02 * d)) / 0.05));
        st.pixMats[i].opacity = env;
        st.pixMats[i].emissiveIntensity = 0.02 + 3.2 * amt * Math.min(1, env * 2);
        st.pixGlows[i].material.opacity = 0.5 * amt * env;
      }
      const fw = smooth(clamp01((u - 0.345) / 0.10));
      st.foot.scale.x = 0.4 + 2.35 * fw;
      st.foot.material.opacity = 0.55 * windowed(u, 0.355, 0.782, 0.03);
    }

    function updateDirect(u, clock, env) {
      const st = stageD;
      st.slabMat.opacity = 0.4 * env;
      st.edgeMat.opacity = 0.65 * env;
      st.subMat.opacity = 0.9 * env;

      // STEP A — same vertical photon, now into the CdTe/Si layer.
      setPhoton(st.photon, DX, SZ + 0.2, 1.5, D_ABS.y, u, 0.552, 0.588);

      // STEP B — localized charge at the absorption point.
      st.flash.position.set(D_ABS.x, D_ABS.y, SZ + 0.25);
      st.flash.material.opacity = 0.95 * windowed(u, 0.585, 0.625, 0.008) * env;
      st.flash.scale.setScalar(0.35 + 0.65 * clamp01((u - 0.585) / 0.035));
      const drop = smooth(clamp01((u - 0.632) / 0.05));
      const cy = lerp(D_ABS.y, -0.72, drop);
      const r0 = 0.085 * (1 - 0.35 * drop);
      for (let i = 0; i < CHARGE_N; i++) {
        const ang = rng(i, 8) * Math.PI * 2 + clock * 0.7;
        const rad = r0 * (0.25 + rng(i, 9));
        posC[i * 3]     = D_ABS.x + Math.cos(ang) * rad;
        posC[i * 3 + 1] = cy + (rng(i, 10) - 0.5) * 0.09 * (1 - 0.4 * drop);
        posC[i * 3 + 2] = SZ + 0.2 + Math.sin(ang) * rad * 0.5;
      }
      chargeP.geometry.attributes.position.needsUpdate = true;
      chargeP.material.opacity = 0.95 * windowed(u, 0.59, 0.71, 0.02) * env;

      // STEP C — the signal travels DOWN a narrow, targeted path.
      const bp = smooth(clamp01((u - 0.630) / 0.04));
      beam.scale.y = Math.max((D_ABS.y - PIX_TOP) * bp, 0.001);
      beam.material.opacity = 0.9 * windowed(u, 0.630, 0.758, 0.02) * env;
      const pp1 = clamp01((u - 0.636) / 0.04), pp2 = clamp01((u - 0.688) / 0.04);
      const pp = pp1 < 1 ? pp1 : pp2;
      beamPulse.position.set(D_ABS.x, lerp(D_ABS.y, PIX_TOP, pp), SZ + 0.26);
      beamPulse.material.opacity = (pp > 0 && pp < 1 ? 0.9 : 0) * windowed(u, 0.632, 0.74, 0.02) * env;

      // STEP D — ONE pixel receives it (faint neighbours only): a much
      // more localized readout area.
      const hit = smooth(clamp01((u - 0.662) / 0.045));
      for (let i = 0; i < PIX_N; i++) {
        const d = Math.abs(i - 5);
        const g = d === 0 ? 1 : d === 1 ? 0.12 : 0;
        st.pixMats[i].opacity = env;
        st.pixMats[i].emissiveIntensity = 0.02 + 4.5 * g * hit * Math.min(1, env * 2);
        st.pixGlows[i].material.opacity = 0.55 * g * hit * env;
      }
      hitGlow.material.opacity = 0.8 * hit * windowed(u, 0.662, 0.765, 0.03) *
        (0.8 + 0.2 * Math.sin(clock * 6));
      st.foot.scale.x = 0.45;
      st.foot.material.opacity = 0.6 * hit * windowed(u, 0.668, 0.782, 0.03);
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
      const u = storyU(phaseT % LOOP);

      sampleCamera(u);
      // Portrait / narrow viewports: dolly back during the stage shots
      // so the full layer stack stays in frame.
      if (camera.aspect < 1.05) {
        const bo = 1 + 0.32 * windowed(u, 0.19, 0.79, 0.04);
        _p.sub(_t).multiplyScalar(bo).add(_t);
      }
      camera.position.copy(_p);
      camera.position.x += px * 0.3;
      camera.position.y += -py * 0.22;
      camera.lookAt(_t);

      /* --- housing: section cut sweep + glass fade --- */
      const openAmt = smooth(clamp01((u - 0.155) / 0.07)) *
                      (1 - smooth(clamp01((u - 0.762) / 0.05)));
      clipPlane.constant = 3.6 - 3.25 * openAmt;
      const glassAmt = smooth(clamp01((u - 0.168) / 0.08)) *
                       (1 - smooth(clamp01((u - 0.772) / 0.05)));
      const bodyOp = 1 - 0.85 * glassAmt;
      for (let i = 0; i < HOUSE_MATS.length; i++) {
        HOUSE_MATS[i].opacity = HOUSE_MATS[i] === winFrameMat ? bodyOp * 0.4 : bodyOp;
        HOUSE_MATS[i].depthWrite = bodyOp > 0.7;
      }
      cutLight.position.z = clipPlane.constant;
      cutLight.material.opacity =
        0.5 * windowed(u, 0.155, 0.24, 0.03) +
        0.45 * windowed(u, 0.75, 0.84, 0.03) +
        0.06 * windowed(u, 0.23, 0.755, 0.02);

      /* --- wide shot: the vertical X-ray beam --- */
      setPhoton(wideHero, HX, HZ, 6.5, 0.03, u, 0.015, 0.13);
      wideHero.streak.scale.y = 1.9;
      wideHero.streak.position.y = 1.15;
      winRipple.material.opacity = 0.8 * windowed(u, 0.125, 0.18, 0.015);
      winRipple.scale.setScalar(0.5 + 1.4 * clamp01((u - 0.125) / 0.05));
      for (let i = 0; i < SIDEKICKS.length; i++) {
        const k = SIDEKICKS[i];
        const e = clamp01((u - 0.02 - k.off) / 0.10);
        k.s.position.y = lerp(7.0, 0.05, smooth(e));
        k.s.material.opacity = (e > 0.01 && e < 0.99) ? 0.5 * Math.min(1, (1 - e) / 0.12) : 0;
      }

      /* --- the two layer demonstrations --- */
      const env = stagePresence(u);
      updateIndirect(u, clock, env);
      updateDirect(u, clock, env);

      /* --- pull-out climax: SEQUENTIAL scan-line reveal — indirect
             graph first, alone; then the direct graph beside it. --- */
      const panels = [
        { pn: panelI, rev: smooth(clamp01((u - 0.798) / 0.06)), vis: windowed(u, 0.795, 0.995, 0.02) },
        { pn: panelD, rev: smooth(clamp01((u - 0.878) / 0.06)), vis: windowed(u, 0.875, 0.995, 0.02) }
      ];
      for (let i = 0; i < 2; i++) {
        const pn = panels[i].pn, rev = panels[i].rev;
        const f = Math.max(rev, 0.001);
        pn.mesh.scale.y = f;
        pn.tex.repeat.y = f;
        pn.tex.offset.y = 1 - f;
        pn.mesh.material.opacity = 0.97 * panels[i].vis;
        pn.bar.position.y = 3.15 - 2.2 * rev;
        pn.bar.material.opacity = (rev > 0.02 && rev < 0.99) ? 0.9 * panels[i].vis : 0;
      }
      grid.material.opacity = 0.16 - 0.08 * clamp01((u - 0.25) / 0.2) + 0.08 * clamp01((u - 0.79) / 0.08);

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

  // Engineering grid for the stage floor.
  function makeGridTexture(THREE) {
    const s = 512, c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    ctx.strokeStyle = 'rgba(110,170,210,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= s; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(s, i); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.needsUpdate = true;
    return tex;
  }

  // Soft contact shadow under the module.
  function makeShadowTexture(THREE) {
    const w = 256, h = 160, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // Carbon-fibre weave for the entrance window strip.
  function makeCarbonTexture(THREE) {
    const s = 128, c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#101418';
    ctx.fillRect(0, 0, s, s);
    ctx.save();
    ctx.translate(s / 2, s / 2);
    ctx.rotate(Math.PI / 4);
    for (let i = -12; i <= 12; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(46,56,66,0.9)' : 'rgba(24,30,36,0.9)';
      ctx.fillRect(-s, i * 9, s * 2, 6);
    }
    ctx.restore();
    // faint sheen
    const g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, 'rgba(120,160,190,0.10)');
    g.addColorStop(0.5, 'rgba(120,160,190,0)');
    g.addColorStop(1, 'rgba(120,160,190,0.07)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 1);
    tex.needsUpdate = true;
    return tex;
  }

  // Output comparison panel: the SAME line-pair test pattern in both,
  // plus a line-profile curve. soft (indirect) = blurred bars, broad
  // warm bump. sharp (direct) = crisp bars, narrow cool peak + grid.
  function makeOutputTexture(THREE, soft) {
    const w = 360, h = 240, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#081019';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = soft ? 'rgba(255,198,128,0.5)' : 'rgba(120,205,255,0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, w - 10, h - 10);

    // identical line-pair groups (blur is the only difference)
    if (soft) ctx.filter = 'blur(2.6px)';
    ctx.fillStyle = soft ? '#ffd9a0' : '#d5efff';
    const groups = [[28, 12], [110, 8], [186, 5], [252, 3.2], [310, 2]];
    groups.forEach(([x0, bw]) => {
      for (let i = 0; i < 4; i++) ctx.fillRect(x0 + i * bw * 2, 22, bw, 92);
    });
    ctx.filter = 'none';
    if (!soft) {
      ctx.strokeStyle = 'rgba(120,200,255,0.13)';
      ctx.lineWidth = 1;
      for (let x = 20; x <= w - 20; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 116); ctx.stroke();
      }
    }

    // line profile: broad low bump (indirect) vs tall narrow peak (direct)
    ctx.strokeStyle = soft ? '#ffcf8a' : '#9fe0ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const base = 212, cx = w / 2, sd = soft ? 46 : 8, amp = soft ? 38 : 78;
    for (let x = 14; x <= w - 14; x += 2) {
      const yv = base - amp * Math.exp(-((x - cx) * (x - cx)) / (2 * sd * sd));
      x === 14 ? ctx.moveTo(x, yv) : ctx.lineTo(x, yv);
    }
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

})();
