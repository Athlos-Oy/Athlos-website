import {createStory, DURATION} from './conversion-story.js';
/* UFS 225: CAD product → open enclosure → conceptual conversion comparison.
   One continuous 20-second event narrative. All WebGL/assets lazy-load near the viewport.
   Reduced motion, context loss and loading failure retain the product poster. */
const root = document.querySelector('[data-dce]');
if (root) initialise(root);

function initialise(root) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let film, loading = false, visible = false, userPaused = false, contextLost = false, elapsed = 0, raf = 0, last = 0;
  const toggle = root.querySelector('[data-dce-toggle]');
  const controls = root.querySelector('.dce-controls');
  const canvas = root.querySelector('canvas');
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; root.classList.remove('dce-running'); }
  function frame(now) {
    if (last) elapsed = (elapsed + Math.min((now - last) / 1000, .25)) % DURATION;
    last = now; film.render(elapsed); raf = requestAnimationFrame(frame);
  }
  function sync() {
    stop();
    const enabled = film && !motion.matches && !contextLost;
    root.classList.toggle('dce-live', !!enabled);
    controls.hidden = !enabled;
    toggle.textContent = userPaused ? toggle.dataset.play : toggle.dataset.pause;
    toggle.setAttribute('aria-label', toggle.textContent);
    if (!enabled) return;
    film.render(elapsed);
    if (visible && !document.hidden && !userPaused) { root.classList.add('dce-running'); raf = requestAnimationFrame(frame); }
  }
  async function load() {
    if (loading || film || motion.matches) return;
    loading = true;
    try {
      const [THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
        import('./vendor/three.module.min.js'), import('./vendor/GLTFLoader.js'),
        import('./vendor/meshopt_decoder.module.js'), import('./vendor/RoomEnvironment.js')
      ]);
      if (motion.matches) { loading = false; return; }
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const asset = await loader.loadAsync('/images/conversion/ufs225.glb');
      film = buildFilm(THREE, RoomEnvironment, asset.scene, root);
      root.dataset.model = 'cad';
      sync();
    } catch (error) {
      root.dataset.filmError = 'unavailable';
      controls.hidden = true;
      console.warn('Athlos product film unavailable; static illustration retained.', error);
    }
  }
  toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  root.querySelectorAll('[data-seek]').forEach(button => button.addEventListener('click', () => {
    elapsed = Number(button.dataset.seek); userPaused = true; sync();
  }));
  root.querySelector('[data-scrub]').addEventListener('input', event => {
    elapsed = Number(event.target.value); userPaused = true; sync();
  });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => { sync(); if (!motion.matches && visible) load(); });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; sync(); });
  canvas.addEventListener('webglcontextrestored', () => { contextLost = false; sync(); });
  const resize = () => { if (film && !motion.matches) film.render(elapsed); };
  new ResizeObserver(resize).observe(root.querySelector('.dce-stage'));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); if (visible) load(); }, { threshold: .05 }).observe(root);
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); near.disconnect(); } }, { rootMargin: '250px' }); near.observe(root);
  } else { visible = true; load(); }
}

function buildFilm(T, RoomEnvironment, product, root) {
  const canvas = root.querySelector('canvas'), stage = root.querySelector('.dce-stage');
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(); scene.background = new T.Color('#080c11');
  const pmrem = new T.PMREMGenerator(renderer), room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .035); scene.environment = environment.texture; room.dispose(); pmrem.dispose();
  const camera = new T.PerspectiveCamera(36, 1, .05, 160);
  scene.add(new T.HemisphereLight(0xe6f0ff, 0x182533, 1.0));
  for (const [position, color, intensity] of [[[1,9,4],0xf3f5ff,3.3],[[-7,4,-3],0x92c9f2,2.5],[[5,2,-8],0xf0d9b9,1.7]]) {
    const light = new T.DirectionalLight(color, intensity); light.position.set(...position); scene.add(light);
    if(position[1]===9){light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:35});light.shadow.bias=-.00025;light.shadow.normalBias=.015;}
  }

  const bounds = new T.Box3().setFromObject(product), center = bounds.getCenter(new T.Vector3());
  const model = new T.Group(); model.add(product); scene.add(model);
  product.position.copy(center).multiplyScalar(-1); model.scale.setScalar(39); model.position.y = -.5;
  const lids = [], productMats = [];
  const carbon = makeWeave(T), brushed = makeBrush(T);
  product.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    o.castShadow = true; o.receiveShadow = true;
    const m = o.material;
    m.transparent = true; m.envMapIntensity = 1.35; productMats.push(m);
    if (o.name.startsWith('lid_')) lids.push({ object:o, y:o.position.y });
    if (m.name === 'body') { m.color.set('#434b55'); m.metalness = .7; m.roughness = .43; m.roughnessMap = brushed; m.bumpMap = brushed; m.bumpScale = .0012; }
    if (m.name === 'carbon') { m.color.set('#ffffff'); m.map = carbon; m.roughness = .38; m.metalness = .2; m.bumpMap = carbon; m.bumpScale = .0014; }
    if (m.name === 'pcb') { m.color.set('#15201e'); m.roughness = .6; }
    if (m.name === 'sensor') { m.color.set('#b3b8a2'); m.metalness = .4; m.roughness = .3; }
  });
  // The supplied photos show the current silver brand mark on the lid.
  const brand = new T.Mesh(new T.PlaneGeometry(1.65,1),new T.MeshStandardMaterial({color:0xc8cdd1,metalness:.65,roughness:.4,transparent:true,depthWrite:false,alphaTest:.35}));
  model.updateMatrixWorld(true);
  const lidTop = new T.Box3().setFromObject(product.getObjectByName('lid_body')).max.y + .008;
  // CAD surface overlays can obscure the recessed carbon sheet after tessellation.
  // Its visible finish follows the supplied sheet's measured bounds.
  const carbonBounds=new T.Box3().setFromObject(product.getObjectByName('lid_carbon'));
  const carbonSize=carbonBounds.getSize(new T.Vector3()),carbonCenter=carbonBounds.getCenter(new T.Vector3());
  const surfaceTexture=carbon.clone();surfaceTexture.repeat.set(6,1.7);surfaceTexture.needsUpdate=true;
  const windowFinish=new T.Mesh(new T.PlaneGeometry(carbonSize.x,carbonSize.z),new T.MeshStandardMaterial({color:0x727b84,map:surfaceTexture,metalness:.15,roughness:.45,bumpMap:surfaceTexture,bumpScale:.0015,transparent:true}));
  windowFinish.rotation.x=-Math.PI/2;windowFinish.position.set(carbonCenter.x,lidTop-.002,carbonCenter.z);windowFinish.receiveShadow=true;scene.add(windowFinish);
  brand.rotation.x=-Math.PI/2;brand.position.set(3.35,lidTop,3.2);brand.visible=false;scene.add(brand);
  const logoImage=new Image();logoImage.onload=()=>{const c=document.createElement('canvas');c.width=logoImage.width;c.height=logoImage.height;const ctx=c.getContext('2d');ctx.drawImage(logoImage,0,0);ctx.globalCompositeOperation='source-in';ctx.fillStyle='#d9dde0';ctx.fillRect(0,0,c.width,c.height);brand.material.map=new T.CanvasTexture(c);brand.material.map.colorSpace=T.SRGBColorSpace;brand.material.needsUpdate=true;brand.userData.ready=true;};logoImage.src='/images/athlos-logo-nav.webp';
  // Soft studio contact shadow, independent from the moving lid.
  const shadow = new T.Mesh(new T.PlaneGeometry(19,18),new T.MeshBasicMaterial({ map:radial(T),color:0x000000,transparent:true,opacity:.7,depthWrite:false }));
  shadow.rotation.x = -Math.PI/2; shadow.position.y = -1.95; scene.add(shadow);

  const focus = new T.Vector3();
  const sensor = product.getObjectByName('base_sensor');
  model.updateMatrixWorld(true);
  if (sensor) new T.Box3().setFromObject(sensor).getCenter(focus);
  return createStory(T,{root,stage,renderer,scene,camera,model,product,productMats,lids,brand,lidTop,windowFinish,shadow,focus});
}

function clamp(x){return Math.max(0,Math.min(1,x));}
// easeInOutSine: gentle, continuous velocity for the film's camera and cover.
function ease(t,a,b){return -(Math.cos(Math.PI*clamp((t-a)/(b-a)))-1)/2;}
function radial(T){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'white');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new T.CanvasTexture(c);}
function makeWeave(T){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#11161b';ctx.fillRect(0,0,128,128);for(let y=0;y<8;y++)for(let x=0;x<8;x++){const horizontal=(x+y)%4<2;const g=ctx.createLinearGradient(x*16,y*16,x*16+(horizontal?0:16),y*16+(horizontal?16:0));g.addColorStop(0,'#171e25');g.addColorStop(.48,'#57616b');g.addColorStop(1,'#1a232a');ctx.fillStyle=g;ctx.fillRect(x*16+1,y*16+1,15,15);ctx.strokeStyle='#8a929a35';for(let k=3;k<16;k+=3){ctx.beginPath();ctx.moveTo(x*16+(horizontal?1:k),y*16+(horizontal?k:1));ctx.lineTo(x*16+(horizontal?15:k),y*16+(horizontal?k:15));ctx.stroke();}}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;return tex;}
function makeBrush(T){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#aaaaaa';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y++){const a=145+Math.floor((Math.sin(y*77.1)*43758.5453%1+1)*23);ctx.fillStyle=`rgb(${a},${a},${a})`;ctx.fillRect(0,y,256,1);}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=8;return tex;}
