/* =====================================================
   ATHLOS — "PHOTON ODYSSEY" CINEMATIC DETECTOR FILM
   ---------------------------------------------------------------
   A ~13s looping WebGL product film for the homepage Technology
   section. One continuous camera move follows a single hero X-ray
   photon into a real-looking Athlos detector module (grounded in
   the Industrial IP67 TDI design language: black machined body,
   carbon-fibre entrance window, heatsink fins, M12 connector):

     SHOT 1 (0.0–2.0s)   X-RAYS ENTER — high camera above the module;
                         the hero photon (plus a few secondary photons)
                         falls STRAIGHT DOWN, normal to the detector
                         plane (physically correct imaging geometry).
     SHOT 2 (2.0–3.5s)   Macro dive to the sensor window; a glowing
                         SECTION CUT sweeps the housing open and the
                         body fades to glass — a cutaway of a real
                         engineered device.
     SHOT 3 (3.5–6.8s)   INDIRECT, SLOWED — a ghost photon drops
                         vertically (same beam direction) into the
                         translucent scintillator: warm light blooms
                         and SPREADS sideways across several pixel
                         regions of the photodiode. Held long.
     SHOT 4 (6.8–10.3s)  DIRECT, SLOWED — the hero photon is absorbed
                         in CdTe/Si: one precise localized event,
                         charge drawn straight down to ONE pixel
                         electrode, then out through CMOS traces to
                         the ASIC. Same vertical beam, same geometry.
     SHOT 5 (10.3–13s)   CLIMAX — the housing re-solidifies and TWO
                         identical test patterns scan-line-reveal side
                         by side: indirect softer/wider, direct crisp/
                         localized. Held long enough to actually read.
                         "Direct conversion. Direct advantage."

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
      bg:      0x05090d,
      body:    0x161b21,
      photon:  0xeaf4ff,
      warm:    0xffb24a,
      warmHi:  0xffe6b0,
      cold:    0x6cc8ff,
      coldHi:  0xd6f1ff,
      edge:    0x8fd2f5,
      gold:    0xc9a04e
    };

    // Story geography (world units ~ cm).
    const HX = -1.2;               // hero photon x
    const HZ = 0.95;               // hero (direct) stack z — the open cutaway side
    const GZ = -1.15;              // ghost (indirect) stack z — behind the glass half
    const A  = { x: HX, y: -0.42, z: HZ };   // absorption point in CdTe
    const E  = { x: HX, y: -0.815, z: HZ };  // pixel electrode (CdTe underside)
    const ASIC_X = 3.55;

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

    /* ==============================================================
       INTERIOR — the sensor stack under the window (open cutaway
       side) and the ghosted indirect stack behind the glass half.
    ============================================================== */
    // CdTe / Si conversion crystal.
    const cdteGeo = new THREE.BoxGeometry(7.6, 0.6, 1.3);
    const cdteMat = new THREE.MeshStandardMaterial({
      color: 0x274150, transparent: true, opacity: 0.5,
      emissive: 0x0b2130, emissiveIntensity: 0.7,
      roughness: 0.22, metalness: 0.15, depthWrite: false
    });
    const cdte = new THREE.Mesh(cdteGeo, cdteMat);
    cdte.position.set(0, -0.5, HZ);
    scene3.add(cdte);
    const cdteEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cdteGeo),
      new THREE.LineBasicMaterial({ color: COL.edge, transparent: true, opacity: 0.5 })
    );
    cdteEdges.position.copy(cdte.position);
    scene3.add(cdteEdges);

    // Faint crystal lattice inside the CdTe.
    const lattice = (function () {
      const nx = 14, ny = 3, nz = 4, n = nx * ny * nz;
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(n * 3);
      let k = 0;
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let l = 0; l < nz; l++) {
        arr[k++] = -3.5 + i * (7.0 / (nx - 1));
        arr[k++] = -0.72 + j * 0.22;
        arr[k++] = HZ - 0.5 + l * (1.0 / (nz - 1));
      }
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const p = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.045, map: sprite, color: COL.cold, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      }));
      p.frustumCulled = false;
      scene3.add(p);
      return p;
    })();

    // Bump-bond plaza (flip-chip interconnects) — the "pixel city".
    const bumpMat = new THREE.MeshStandardMaterial({
      color: COL.gold, metalness: 0.95, roughness: 0.35,
      emissive: 0x1a1206, emissiveIntensity: 0.4
    });
    {
      const cols = 44, rows = 7;
      const bumps = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.045, 6, 5), bumpMat, cols * rows
      );
      const m4 = new THREE.Matrix4();
      let i = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        m4.setPosition(-3.55 + c * (7.1 / (cols - 1)), -0.85, HZ - 0.51 + r * (1.02 / (rows - 1)));
        bumps.setMatrixAt(i++, m4);
      }
      scene3.add(bumps);
    }

    // CMOS die + circuit-trace surface + ASIC block + PCB.
    const cmosDie = new THREE.Mesh(
      new THREE.BoxGeometry(8.0, 0.14, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x11181e, metalness: 0.6, roughness: 0.45 })
    );
    cmosDie.position.set(0, -0.95, HZ);
    scene3.add(cmosDie);

    const traces = new THREE.Mesh(
      new THREE.PlaneGeometry(7.9, 1.55),
      new THREE.MeshBasicMaterial({
        map: makeTraceTexture(THREE), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    traces.rotation.x = -Math.PI / 2;
    traces.position.set(0, -0.877, HZ);
    scene3.add(traces);

    const asicGeo = new THREE.BoxGeometry(1.1, 0.2, 1.3);
    const asic = new THREE.Mesh(asicGeo, new THREE.MeshStandardMaterial({
      color: 0x0d1319, metalness: 0.65, roughness: 0.4
    }));
    asic.position.set(ASIC_X, -0.78, HZ);
    scene3.add(asic);
    const asicEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(asicGeo),
      new THREE.LineBasicMaterial({ color: COL.edge, transparent: true, opacity: 0.35 })
    );
    asicEdges.position.copy(asic.position);
    scene3.add(asicEdges);

    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.09, 4.9),
      new THREE.MeshStandardMaterial({ color: 0x0f151a, metalness: 0.3, roughness: 0.7 })
    );
    pcb.position.set(0, -1.18, 0);
    scene3.add(pcb);

    /* ---- Ghost stack (indirect) behind the glass half ------------ */
    const ghostScintMat = new THREE.MeshStandardMaterial({
      color: 0x46402e, transparent: true, opacity: 0,
      emissive: 0x1c1408, emissiveIntensity: 0.8, roughness: 0.4, depthWrite: false
    });
    const ghostScint = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.5, 1.25), ghostScintMat);
    ghostScint.position.set(0, -0.45, GZ);
    scene3.add(ghostScint);
    const ghostScintEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(ghostScint.geometry),
      new THREE.LineBasicMaterial({ color: 0xd9b073, transparent: true, opacity: 0 })
    );
    ghostScintEdges.position.copy(ghostScint.position);
    scene3.add(ghostScintEdges);

    const ghostDiodeMat = new THREE.MeshStandardMaterial({
      color: 0x333d45, transparent: true, opacity: 0,
      emissive: 0x0a1218, emissiveIntensity: 0.7, roughness: 0.4, depthWrite: false
    });
    const ghostDiode = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.12, 1.25), ghostDiodeMat);
    ghostDiode.position.set(0, -0.78, GZ);
    scene3.add(ghostDiode);

    /* ==============================================================
       ACTORS — hero photon, ghost photon, glows, particles
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

    // Hero photon: head + vertical streak (streak shortens in slow-mo).
    const hero = new THREE.Group();
    const heroHead = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sprite, color: COL.photon, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    heroHead.scale.set(0.6, 0.6, 1);
    const heroStreak = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1, 0.04),
      new THREE.MeshBasicMaterial({
        color: COL.photon, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    hero.add(heroStreak, heroHead);
    hero.position.set(HX, 13.5, HZ);
    scene3.add(hero);

    // Ghost photon — drops STRAIGHT DOWN (same beam direction as the
    // hero) into the scintillator lane.
    const ghostPhoton = glowSprite(0xffe9c4, 0.44, HX, 2.6, GZ);

    // Secondary photons in the entry shot — the beam, not one stray.
    const SIDEKICKS = [];
    [[-3.2, 0.0], [0.6, 0.018], [2.4, 0.036]].forEach(([sx, off]) => {
      SIDEKICKS.push({ s: glowSprite(COL.photon, 0.3, sx, 12, HZ), off });
    });

    // Window ripple, absorption flash, electrode / ASIC glows.
    const winRipple = glowSprite(COL.coldHi, 0.7, HX, 0.05, HZ);
    const absorbFlash = glowSprite(COL.coldHi, 1.4, A.x, A.y, A.z);
    const electrodeGlow = glowSprite(COL.cold, 0.55, E.x, E.y, E.z);
    const asicGlow = glowSprite(COL.coldHi, 1.2, ASIC_X, -0.7, HZ);

    // Warm scintillation bloom (anisotropic — spreads laterally).
    const bloom = glowSprite(COL.warm, 1, HX, -0.34, GZ);
    // Smear band on the photodiode — the wide arrival footprint.
    const smear = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.32),
      new THREE.MeshBasicMaterial({
        color: COL.warm, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    smear.rotation.x = -Math.PI / 2;
    smear.position.set(HX, -0.712, GZ);
    scene3.add(smear);

    // Pixel-region ticks on the photodiode: SEVERAL of them glow under
    // the spread light — the indirect weakness made countable (vs ONE
    // electrode lighting up on the direct side).
    const diodeTicks = (function () {
      const n = 7;
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        arr[i * 3] = HX + (i - 3) * 0.55; arr[i * 3 + 1] = -0.705; arr[i * 3 + 2] = GZ;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const p = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.15, map: sprite, color: COL.warm, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      }));
      p.frustumCulled = false;
      scene3.add(p);
      return p;
    })();

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

    const LIGHT_N = 130;
    const lightP = points(LIGHT_N, COL.warm, 0.5);     // spreading optical cloud
    const CHARGE_N = 60;
    const chargeP = points(CHARGE_N, COL.cold, 0.16);  // localized charge cluster

    // Vertical field lines guiding the charge to the electrode.
    const fieldLines = (function () {
      const n = 5;
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(n * 2 * 3);
      for (let i = 0; i < n; i++) {
        const x = HX + (i - 2) * 0.19;
        arr[i * 6] = x;     arr[i * 6 + 1] = -0.22; arr[i * 6 + 2] = HZ;
        arr[i * 6 + 3] = x; arr[i * 6 + 4] = -0.80; arr[i * 6 + 5] = HZ;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const l = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
        color: COL.cold, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      scene3.add(l);
      return l;
    })();

    // Readout channel: glowing lane + travelling pulse train.
    const laneLen = ASIC_X - E.x;
    const lane = new THREE.Mesh(
      new THREE.BoxGeometry(laneLen, 0.02, 0.05),
      new THREE.MeshBasicMaterial({
        color: COL.cold, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    lane.position.set(E.x + laneLen / 2, -0.855, HZ);
    scene3.add(lane);
    const PULSES = [];
    for (let i = 0; i < 4; i++) {
      PULSES.push(glowSprite(COL.coldHi, 0.34 - i * 0.045, E.x, -0.855, HZ));
    }

    // FINAL COMPARISON — the climax: two identical test patterns side
    // by side, revealed top-down by a scan line. Indirect = softer /
    // wider; direct = crisp / localized.
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
       CAMERA — one continuous purposeful move (no aimless spin)
    ============================================================== */
    const KEYS = [
      { u: 0.000, p: [0.5, 12.5, 6.5],  t: [-1.2, 6.0, 0.95] },  // high above (target overridden: tracks the photon)
      { u: 0.100, p: [-0.6, 8.5, 5.8],  t: [-1.2, 0.8, 0.95] },  // following it down
      { u: 0.150, p: [-3.4, 2.4, 4.4],  t: [-1.2, 0.1, 0.95] },  // macro on window
      { u: 0.225, p: [-3.9, 1.8, 4.6],  t: [-0.9, -0.4, 0.3] },  // section opens
      { u: 0.300, p: [-2.6, 1.5, 4.9],  t: [-0.9, -0.45, -0.6] },// frame the ghost lane
      { u: 0.460, p: [-1.6, 1.15, 4.5], t: [-0.5, -0.5, -0.85] },// slow drift: light spread held
      { u: 0.540, p: [-2.8, 0.9, 3.1],  t: [-1.2, -0.45, 0.9] }, // back to the hero lane
      { u: 0.630, p: [-2.2, 0.3, 2.5],  t: [-1.2, -0.6, 0.95] }, // charge close-up
      { u: 0.720, p: [-1.0, 0.0, 2.6],  t: [0.6, -0.85, 0.95] }, // traces → ASIC
      { u: 0.790, p: [3.4, 4.0, 8.2],   t: [0.2, 0.6, 0.3] },    // pull back
      { u: 0.870, p: [0.6, 3.4, 10.0],  t: [0.0, 1.35, 0.3] },   // comparison frame
      { u: 0.970, p: [0.3, 3.5, 10.3],  t: [0.0, 1.4, 0.3] },    // long hold, drift
      { u: 1.000, p: [0.5, 12.5, 6.5],  t: [-1.2, 6.0, 0.95] }   // loop (in fade)
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

    /* ---- HTML captions & 3D-anchored layer tags ------------------ */
    const capEls = {};
    root.querySelectorAll('.dce-line').forEach((el) => { capEls[el.dataset.cap] = el; });
    const CAPS = [
      ['enter',    0.02, 0.135],
      ['indirect', 0.30, 0.51],
      ['direct',   0.545, 0.66],
      ['readout',  0.665, 0.785],
      ['payoff',   0.86, 0.985]
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
      { key: 'window',       pos: [-3.0, 0.1, 1.6],    a: 0.145, b: 0.215 },
      { key: 'scintillator', pos: [1.8, -0.3, GZ],     a: 0.30, b: 0.505 },
      { key: 'photodiode',   pos: [1.8, -0.8, GZ],     a: 0.37, b: 0.505 },
      { key: 'cdte',         pos: [0.9, -0.35, HZ],    a: 0.545, b: 0.645 },
      { key: 'electrodes',   pos: [-0.35, -0.72, HZ],  a: 0.615, b: 0.705 },
      { key: 'cmos',         pos: [ASIC_X, -0.62, HZ], a: 0.705, b: 0.79 },
      { key: 'softer',       pos: [-1.85, 0.72, 0.42], a: 0.83, b: 0.985 },
      { key: 'sharper',      pos: [1.85, 0.72, 0.42],  a: 0.83, b: 0.985 }
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
    // Hero photon path: STRAIGHT DOWN, normal to the detector plane
    // (real imaging geometry) → window crossing → slow-motion fall
    // held through the indirect beat → absorption in the direct beat.
    const HERO_PATH = [
      { u: 0.015, p: [HX, 11.5, HZ] },
      { u: 0.145, p: [HX, 0.03, HZ] },   // window crossing
      { u: 0.50,  p: [HX, -0.20, HZ] },  // slow-motion fall to the CdTe surface
      { u: 0.53,  p: [HX, A.y, HZ] }     // absorption
    ];
    const _hp = new THREE.Vector3(), _hpA = new THREE.Vector3(),
          _hpB = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
    function heroPos(u, out) {
      let a = HERO_PATH[0], b = HERO_PATH[0];
      if (u <= HERO_PATH[0].u) { out.set(a.p[0], a.p[1], a.p[2]); return out; }
      for (let i = 0; i < HERO_PATH.length - 1; i++) {
        if (u >= HERO_PATH[i].u && u <= HERO_PATH[i + 1].u) { a = HERO_PATH[i]; b = HERO_PATH[i + 1]; break; }
        a = b = HERO_PATH[HERO_PATH.length - 1];
      }
      const e = a === b ? 0 : smooth((u - a.u) / (b.u - a.u));
      out.set(lerp(a.p[0], b.p[0], e), lerp(a.p[1], b.p[1], e), lerp(a.p[2], b.p[2], e));
      return out;
    }

    const posL = lightP.geometry.attributes.position.array;
    const posC = chargeP.geometry.attributes.position.array;

    // Warm optical cloud expanding sideways in the ghost scintillator.
    function updateLightCloud(time, env) {
      for (let i = 0; i < LIGHT_N; i++) {
        const life = (time * 0.5 + rng(i, 5)) % 1;
        const ang = rng(i, 6) * Math.PI * 2;
        const rad = (0.25 + rng(i, 7) * 3.2) * life * env;
        posL[i * 3]     = HX + Math.cos(ang) * rad;
        posL[i * 3 + 1] = -0.4 - life * 0.26 + Math.sin(ang * 2) * 0.04;
        posL[i * 3 + 2] = GZ + Math.sin(ang) * rad * 0.3;
      }
      lightP.geometry.attributes.position.needsUpdate = true;
    }

    // Tight charge cluster forming at A and drifting down to E.
    function updateCharge(u, time) {
      const cd = clamp01((u - 0.545) / 0.10);
      const yy = lerp(A.y, E.y, smooth(cd));
      const r0 = 0.15 * (1 - cd * 0.55);
      for (let i = 0; i < CHARGE_N; i++) {
        const ang = rng(i, 8) * Math.PI * 2 + time * 0.7;
        const rad = r0 * (0.25 + rng(i, 9));
        posC[i * 3]     = A.x + Math.cos(ang) * rad;
        posC[i * 3 + 1] = yy + (rng(i, 10) - 0.5) * 0.1 * (1 - cd * 0.5);
        posC[i * 3 + 2] = A.z + Math.sin(ang) * rad * 0.7;
      }
      chargeP.geometry.attributes.position.needsUpdate = true;
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
      // Shot 1: the camera operator tracks the hero photon — aim at a
      // weighted point between the photon and its impact point so both
      // the photon and the detector stay in frame, easing back onto the
      // keyframed target as the macro dive begins.
      const trackAmt = 1 - smooth(clamp01((u - 0.105) / 0.05));
      if (trackAmt > 0.001) {
        heroPos(u, _hp);
        _t.x = lerp(_t.x, _hp.x * 0.85 + HX * 0.15, trackAmt);
        _t.y = lerp(_t.y, _hp.y * 0.85, trackAmt);
        _t.z = lerp(_t.z, _hp.z * 0.85 + HZ * 0.15, trackAmt);
      }
      camera.position.copy(_p);
      camera.position.x += px * 0.3;
      camera.position.y += -py * 0.22;
      camera.lookAt(_t);

      /* --- housing: section cut sweep + glass fade --- */
      const openAmt = smooth(clamp01((u - 0.155) / 0.08)) *
                      (1 - smooth(clamp01((u - 0.755) / 0.085)));
      clipPlane.constant = 3.6 - 3.25 * openAmt;
      const glassAmt = smooth(clamp01((u - 0.175) / 0.09)) *
                       (1 - smooth(clamp01((u - 0.77) / 0.08)));
      const bodyOp = 1 - 0.85 * glassAmt;
      for (let i = 0; i < HOUSE_MATS.length; i++) {
        HOUSE_MATS[i].opacity = HOUSE_MATS[i] === winFrameMat ? bodyOp * 0.4 : bodyOp;
        HOUSE_MATS[i].depthWrite = bodyOp > 0.7;
      }
      cutLight.position.z = clipPlane.constant;
      cutLight.material.opacity =
        0.85 * windowed(u, 0.155, 0.25, 0.03) +
        0.6 * windowed(u, 0.75, 0.85, 0.03) +
        0.1 * windowed(u, 0.24, 0.765, 0.02);

      /* --- hero photon --- */
      heroPos(u, hero.position);
      // orient the streak along the (reversed) velocity so it trails.
      heroPos(Math.min(u + 0.004, 0.53), _hpB);
      _hpA.copy(_hpB).sub(hero.position);
      if (_hpA.lengthSq() > 1e-8) {
        _hpA.normalize().negate();
        hero.quaternion.setFromUnitVectors(_up, _hpA);
      }
      const inFlight = u > 0.015 && u < 0.538;
      const heroOp = inFlight
        ? Math.min(1, (u - 0.015) / 0.02, (0.538 - u) / 0.015)
        : 0;
      heroHead.material.opacity = heroOp;
      const diving = u < 0.145;
      heroStreak.scale.y = diving ? 1.9 : 0.35;
      heroStreak.position.y = diving ? 1.15 : 0.3;
      heroStreak.material.opacity = heroOp * 0.75;
      winRipple.material.opacity = 0.8 * windowed(u, 0.135, 0.19, 0.015);
      winRipple.scale.setScalar(0.5 + 1.4 * clamp01((u - 0.135) / 0.055));

      // secondary photons — the vertical beam in the entry shot
      for (let i = 0; i < SIDEKICKS.length; i++) {
        const k = SIDEKICKS[i];
        const e = clamp01((u - 0.025 - k.off) / 0.115);
        k.s.position.y = lerp(10.5, 0.05, smooth(e));
        k.s.material.opacity = (e > 0.01 && e < 0.99) ? 0.5 * Math.min(1, (1 - e) / 0.12) : 0;
      }

      /* --- indirect conversion, slowed and held --- */
      const gEnv = windowed(u, 0.25, 0.525, 0.05);
      ghostScintMat.opacity = 0.34 * gEnv;
      ghostScintEdges.material.opacity = 0.4 * gEnv;
      ghostDiodeMat.opacity = 0.3 * gEnv;
      // the indirect photon drops straight down — same beam direction.
      const gp = clamp01((u - 0.285) / 0.045);
      ghostPhoton.position.set(HX, lerp(2.6, -0.2, smooth(gp)), GZ);
      ghostPhoton.material.opacity = 0.85 * windowed(u, 0.285, 0.345, 0.015);
      const bp = clamp01((u - 0.33) / 0.14);
      bloom.scale.set(0.6 + 3.6 * bp, 0.5 + 0.75 * bp, 1);
      bloom.material.opacity = 0.85 * windowed(u, 0.33, 0.515, 0.04);
      lightP.material.opacity = 0.9 * windowed(u, 0.335, 0.515, 0.04);
      updateLightCloud(clock, Math.max(0.001, windowed(u, 0.33, 0.525, 0.1)));
      smear.scale.x = 0.6 + 3.0 * clamp01((u - 0.365) / 0.12);
      smear.material.opacity = 0.7 * windowed(u, 0.37, 0.52, 0.04);
      diodeTicks.material.opacity = 0.8 * windowed(u, 0.385, 0.52, 0.04);

      /* --- direct conversion hero beat, slowed and held --- */
      lattice.material.opacity = 0.2 * windowed(u, 0.50, 0.68, 0.05);
      absorbFlash.material.opacity = 0.95 * windowed(u, 0.522, 0.585, 0.015);
      absorbFlash.scale.setScalar(0.9 + 1.7 * clamp01((u - 0.522) / 0.05));
      chargeP.material.opacity = 0.95 * windowed(u, 0.535, 0.665, 0.03);
      updateCharge(u, clock);
      fieldLines.material.opacity = 0.32 * windowed(u, 0.555, 0.665, 0.03);
      electrodeGlow.material.opacity = 0.9 * windowed(u, 0.605, 0.705, 0.03);
      electrodeGlow.scale.setScalar(0.45 + 0.25 * Math.sin(clock * 6));

      /* --- readout: pixel city + pulse train into the ASIC --- */
      traces.material.opacity = 0.72 * windowed(u, 0.62, 0.80, 0.04);
      bumpMat.emissiveIntensity = 0.4 + 1.5 * windowed(u, 0.655, 0.795, 0.05);
      lane.material.opacity = 0.65 * windowed(u, 0.66, 0.785, 0.03);
      const pulseOp = windowed(u, 0.66, 0.78, 0.02);
      for (let i = 0; i < PULSES.length; i++) {
        const pp = clamp01((u - 0.665) / 0.095 - i * 0.05);
        PULSES[i].position.x = E.x + laneLen * smooth(pp);
        PULSES[i].material.opacity = pulseOp * Math.pow(0.72, i) * (pp > 0 && pp < 1 ? 1 : 0.25);
      }
      asicGlow.material.opacity = 0.85 * windowed(u, 0.74, 0.815, 0.03);
      asicGlow.scale.setScalar(1.0 + 0.35 * Math.sin(clock * 5));

      /* --- climax: scan-line reveal of the two outputs, held long --- */
      const rev = smooth(clamp01((u - 0.80) / 0.085));
      const pvis = windowed(u, 0.795, 0.995, 0.02);
      const panels = [panelI, panelD];
      for (let i = 0; i < 2; i++) {
        const pn = panels[i];
        const f = Math.max(rev, 0.001);
        pn.mesh.scale.y = f;
        pn.tex.repeat.y = f;
        pn.tex.offset.y = 1 - f;
        pn.mesh.material.opacity = 0.97 * pvis;
        pn.bar.position.y = 3.15 - 2.2 * rev;
        pn.bar.material.opacity = (rev > 0.02 && rev < 0.99) ? 0.9 * pvis : 0;
      }
      grid.material.opacity = 0.16 - 0.08 * clamp01((u - 0.4) / 0.2) + 0.08 * clamp01((u - 0.8) / 0.1);

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

  // CMOS circuit traces (cool metallic lines + vias).
  function makeTraceTexture(THREE) {
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    ctx.strokeStyle = 'rgba(95,182,230,0.8)';
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
      ctx.fillStyle = 'rgba(150,220,255,0.85)';
      ctx.fillRect(x - 2.5, 10, 5, 5);
    }
    const tex = new THREE.CanvasTexture(c);
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
    const base = 212, cx = w / 2, sd = soft ? 46 : 11, amp = soft ? 38 : 66;
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
