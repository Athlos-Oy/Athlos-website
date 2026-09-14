// A single event is followed at each scale. The two SVG plots are retained
// throughout the film; their drawing and movement never replace the data.
export const DURATION = 20;
// Authoring time preserves the causal choreography while playback is brisk.
const STORY_DURATION = 42;
const clamp = x => Math.max(0, Math.min(1, x));
const mix = (a,b,p) => a+(b-a)*p;
const ease = (t,a,b) => (1-Math.cos(Math.PI*clamp((t-a)/(b-a))))/2;

export function storyState(t) {
  const direct = t < 8 ? 'incoming' : t < 8.8 ? 'generation' : t < 11.5 ? 'collection' : t < 12 ? 'readout' : 'distribution';
  const indirect = t < 20 ? 'incoming' : t < 20.7 ? 'generation' : t < 24 ? 'light-spread' : t < 24.8 ? 'charge-transfer' : t < 25.5 ? 'readout' : 'distribution';
  return { phase:t<6.5||t>=39?'product':t<17?'direct':t<31?'indirect':'comparison', direct, indirect };
}

export function createStory(T, context) {
  const {root,stage,renderer,scene,camera,model,product,productMats,lids,brand,lidTop,windowFinish,shadow,focus} = context;
  const blue=0x8cdcff, gold=0xffcc79, violet=0xc5b2ff;
  const v=(x,y,z)=>new T.Vector3(x,y,z);
  const addBox=(g,size,pos,mat)=>{const m=new T.Mesh(new T.BoxGeometry(...size),mat);m.position.set(...pos);g.add(m);return m;};
  function buildStack(indirect) {
    const group=new T.Group();scene.add(group);const mats=[];
    const mat=(color,opacity=1,emission=0)=>{const m=new T.MeshStandardMaterial({color,metalness:.3,roughness:.35,transparent:true,opacity,emissive:color,emissiveIntensity:emission,depthWrite:opacity>.95});m.userData.baseOpacity=opacity;mats.push(m);return m;};
    const lineMat=(color,opacity)=>{const m=new T.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});m.userData.baseOpacity=opacity;mats.push(m);return m;};
    const conversion=addBox(group,[4.2,1.15,1.35],[0,.1,0],mat(indirect?0x735735:0x25546d,.26,.12));
    const edge=new T.LineSegments(new T.EdgesGeometry(conversion.geometry),lineMat(indirect?gold:blue,.5));edge.position.copy(conversion.position);group.add(edge);
    addBox(group,[4.24,.045,1.4],[0,.7,0],mat(indirect?0x9c8462:0x819caa,.38));
    if(indirect)addBox(group,[4.2,.14,1.35],[0,-.56,0],mat(0x7c688b,.85));
    const readoutY=indirect?-.98:-.73;
    const pixels=Array.from({length:13},(_,i)=>addBox(group,[.275,.21,1.32],[(i-6)*.316,readoutY,0],mat(0x243846,1,.02)));
    addBox(group,[4.4,.13,1.5],[0,readoutY-.24,0],mat(0x13212c));
    // Electrode strips and individual bond contacts give the layers depth.
    for(let i=0;i<13;i++){
      addBox(group,[.12,.05,.17],[(i-6)*.316,readoutY+.14,.61],mat(0x9aa5a4,.9));
      addBox(group,[.06,.09,.08],[(i-6)*.316,readoutY-.15,.72],mat(0x597280));
    }
    // A sparse internal lattice is a texture cue, never a cloud of free particles.
    const lattice=[];for(let x=-1.8;x<=1.8;x+=.45)for(let y=-.3;y<=.55;y+=.28)lattice.push(x,y,-.24);
    const latticeMat=new T.PointsMaterial({color:indirect?gold:blue,size:.014,transparent:true,opacity:.16,depthWrite:false});latticeMat.userData.baseOpacity=.16;mats.push(latticeMat);
    const latticeGeo=new T.BufferGeometry();latticeGeo.setAttribute('position',new T.Float32BufferAttribute(lattice,3));group.add(new T.Points(latticeGeo,latticeMat));
    const photon=new T.Group();scene.add(photon);
    const head=new T.Mesh(new T.OctahedronGeometry(.085),new T.MeshBasicMaterial({color:0xf3f8ff}));photon.add(head);
    const tail=addBox(photon,[.023,.65,.023],[0,.4,0],new T.MeshBasicMaterial({color:0xe1f1ff,transparent:true,opacity:.75}));
    const charges=Array.from({length:indirect?9:7},()=>{
      const g=new T.Group();group.add(g);const m=new T.MeshBasicMaterial({color:indirect?violet:blue,transparent:true,opacity:1});
      const circle=new T.Mesh(new T.RingGeometry(.048,.065,20),m);g.add(circle);addBox(g,[.075,.014,.014],[0,0,.005],m);return g;
    });
    const lightPackets=indirect?Array.from({length:9},()=>{
      const p=new T.Mesh(new T.SphereGeometry(.047,12,8),new T.MeshBasicMaterial({color:gold}));group.add(p);return p;
    }):[];
    const routes=Array.from({length:indirect?9:7},(_,i)=>{
      const m=lineMat(indirect?gold:blue,.32);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(33*3),3));const l=new T.Line(geo,m);group.add(l);return l;
    });
    const flash=new T.Mesh(new T.RingGeometry(.07,.09,40),new T.MeshBasicMaterial({color:indirect?gold:blue,transparent:true,depthWrite:false,side:T.DoubleSide}));flash.position.set(0,.24,.78);group.add(flash);
    return {group,mats,pixels,photon,head,tail,charges,lightPackets,routes,flash,readoutY,indirect};
  }
  const direct=buildStack(false),indirect=buildStack(true),stacks=[direct,indirect];
  const marker=new T.Mesh(new T.RingGeometry(.2,.235,40),new T.MeshBasicMaterial({color:blue,transparent:true,depthWrite:false,side:T.DoubleSide}));marker.rotation.x=-Math.PI/2;scene.add(marker);
  const overlay=root.querySelector('.dce-story-overlay');
  const title=root.querySelector('[data-story-title]');
  const labelConversion=root.querySelector('[data-layer="conversion"]'),labelReadout=root.querySelector('[data-layer="readout"]');
  const entry=root.querySelector('[data-entry]');
  const captions=[...root.querySelectorAll('[data-story-caption]')];
  const legends=[...root.querySelectorAll('[data-legend]')];
  const chapters=[...root.querySelectorAll('[data-seek]')];
  const progress=root.querySelector('.dce-progress span'),clock=root.querySelector('.dce-time'),scrub=root.querySelector('[data-scrub]');
  const plots=['direct','indirect'].map(kind=>{
    const el=root.querySelector(`[data-plot="${kind}"]`),path=el.querySelector('[data-profile]');
    return {el,path,bars:[...el.querySelectorAll('[data-bar]')],sigma:kind==='direct'?.7:2.4};
  });
  const connectorSVG=root.querySelector('.dce-signal-links');
  const connectors=Array.from({length:13},()=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path'),dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','2.4');connectorSVG.append(path,dot);return {path,dot};
  });
  let width=0,height=0;
  function project(point){const p=point.clone().project(camera);return {x:(p.x*.5+.5)*width,y:(-.5*p.y+.5)*height};}
  function setLabel(el,point,alpha){const p=project(point);el.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;el.style.opacity=alpha;}
  function plotPosition(plot,x,y,scale,opacity){
    const w=Math.min(width*.76,410),h=130;
    plot.el.style.width=`${w}px`;plot.el.style.transform=`translate(${x-w*scale/2}px,${y}px) scale(${scale})`;
    plot.el.style.opacity=opacity;plot.el.style.setProperty('--plot-text-scale',String(1/scale));
    return {x:x-w*scale/2,y,w:w*scale,h:h*scale,scale};
  }
  function opticalPoint(i,p){
    const end=(i-4)*.405;
    // Representative detected rays: straight propagation from the emission
    // point to the photodiode. Lateral spread comes from different directions,
    // not continuous bending. Transport time is deliberately slowed for clarity.
    return v(end*p,.24-.73*p,.78);
  }
  function chargePoint(stack,i,p){
    const n=stack.charges.length;
    const end=stack.indirect?(i-4)*.405:(i-3)*.053;
    const startX=stack.indirect?end:(i-3)*.026;
    const startY=stack.indirect?-.57:.24+(i%3-1)*.055;
    return v(mix(startX,end,p),mix(startY,stack.readoutY+.13,p),.79);
  }
  function updateStack(stack,t,opacity){
    const offset=stack.indirect?12:0; // direct absorption 8 s; indirect 20 s
    const absorption=8+offset;
    for(const m of stack.mats)m.opacity=m.userData.baseOpacity*opacity;
    stack.group.visible=opacity>.002;
    const impact=ease(t,absorption,absorption+.3)*(1-ease(t,absorption+.5,absorption+1.15));
    stack.flash.material.opacity=impact*opacity;stack.flash.scale.setScalar(1+clamp((t-absorption)/1.15)*4);
    const drift=stack.indirect?clamp((t-24)/.8):clamp((t-8.8)/2.7);
    const spawn=stack.indirect?ease(t,24,24.2):ease(t,8,8.7);
    stack.charges.forEach((c,i)=>{c.visible=opacity>.01&&spawn>0&&drift<1;c.scale.setScalar(.25+.75*spawn);c.position.copy(chargePoint(stack,i,drift));c.children.forEach(o=>o.material.opacity=spawn*opacity);});
    stack.lightPackets.forEach((p,i)=>{const travel=clamp((t-20.7-(Math.abs(i-4)*.04))/3.05);p.visible=opacity>.01&&t>=20.25&&travel<1;p.scale.setScalar(ease(t,20.25,20.7));p.position.copy(opticalPoint(i,travel));});
    stack.routes.forEach((line,i)=>{
      const p=stack.indirect?clamp((t-20.7)/3.21):drift;
      line.visible=opacity>.01&&p>0;
      const a=line.geometry.attributes.position;
      for(let j=0;j<33;j++){const q=stack.indirect?opticalPoint(i,p*j/32):chargePoint(stack,i,p*j/32);a.setXYZ(j,q.x,q.y,q.z);}
      a.needsUpdate=true;line.material.opacity=opacity*.2*(stack.indirect?1-ease(t,24,25):1);
    });
    const collect=stack.indirect?ease(t,24.7,25.5):ease(t,11.4,12.05);
    stack.pixels.forEach((p,i)=>{const response=Math.exp(-.5*((i-6)/(stack.indirect?2.4:.7))**2);p.material.emissive.set(stack.indirect?violet:blue);p.material.emissiveIntensity=.02+collect*response*2.5;});
  }
  function drawPlot(plot,growth){
    const response=i=>Math.exp(-.5*((i-6)/plot.sigma)**2);
    plot.bars.forEach((b,i)=>{const h=50*response(i)*growth;b.setAttribute('y',String(76-h));b.setAttribute('height',String(h));});
    const d=Array.from({length:121},(_,i)=>{const x=20+i*1.5;const y=76-50*Math.exp(-.5*((i/10-6)/plot.sigma)**2)*growth;return `${i?'L':'M'}${x},${y.toFixed(2)}`;}).join('');plot.path.setAttribute('d',d);
  }
  function render(elapsed){
    // Remove two seconds only from the comparison hold. Event motion and the
    // return transition retain their existing speed.
    const speed=STORY_DURATION/22,holdStart=32/speed,returnStart=38/speed-2;
    const t=elapsed<holdStart?elapsed*speed:elapsed<returnStart
      ?mix(32,38,(elapsed-holdStart)/(returnStart-holdStart)):(elapsed+2)*speed;
    if(stage.clientWidth!==width||stage.clientHeight!==height){width=stage.clientWidth;height=stage.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();connectorSVG.setAttribute('viewBox',`0 0 ${width} ${height}`);}
    const mobile=width<600,close=ease(t,2.7,6.5),returning=ease(t,38,41.7),transition=ease(t,16,18),comparison=ease(t,30,32);
    const expanded=close*(1-returning),reveal=ease(t,2.1,4.4)*(1-ease(t,39,41.5));
    const modelOpacity=(1-ease(t,4.9,6.35)) + ease(t,39,41.6);
    const directOpacity=ease(t,3.3,5.4)*(1-ease(t,16.2,17.9));
    const indirectOpacity=ease(t,16.3,18)*(1-ease(t,30.2,32));
    for(const {object,y} of lids)object.position.y=y+reveal*.078;
    for(const m of productMats){m.opacity=modelOpacity;m.depthWrite=modelOpacity>.98;}
    model.visible=modelOpacity>.005;shadow.material.opacity=.7*modelOpacity;
    brand.visible=!!brand.userData.ready&&model.visible;brand.position.y=lidTop+reveal*.078*39;brand.material.opacity=modelOpacity;
    windowFinish.visible=model.visible;windowFinish.position.y=lidTop-.002+reveal*.078*39;windowFinish.material.opacity=modelOpacity;
    direct.group.position.copy(focus).lerp(v(0,0,0),close);direct.group.position.x-=transition*7;
    direct.group.scale.setScalar(mix(.15,1,close));indirect.group.position.set(7*(1-transition),0,0);
    const hero=v(11.05,11.05,15.3).multiplyScalar(mobile?1.65:1);
    const scienceCamera=v(0,3.15,mobile?12.8:11.8);
    const cameraTarget=focus.clone().lerp(v(0,-.55,0),close);
    camera.position.copy(hero).lerp(scienceCamera,expanded);camera.lookAt(v(0,0,0).lerp(cameraTarget,expanded));
    // Projection labels must use this frame's camera even when a seek pauses
    // playback before the renderer's usual matrix update.
    camera.updateMatrixWorld();
    updateStack(direct,t,directOpacity);updateStack(indirect,t,indirectOpacity);
    scene.updateMatrixWorld(true);
    // The very same direct photon remains visible from the full product shot
    // into the magnified section, and ends at its absorption position.
    direct.photon.visible=t>=.55&&t<8;
    const incoming=direct.group.localToWorld(v(0,.24,.78));
    const clearance=t<3.2?mix(8,2.45,ease(t,.55,3.2)):mix(2.45,0,ease(t,6.5,8));
    direct.photon.position.copy(incoming).add(v(0,clearance,0));
    direct.photon.scale.setScalar(mix(1.7,1,close));
    indirect.photon.visible=t>=18.2&&t<20;
    indirect.photon.position.copy(indirect.group.localToWorld(v(0,mix(2.69,.24,ease(t,18.2,20)),.78)));
    marker.position.copy(focus);marker.position.y=lidTop+.012;marker.material.opacity=ease(t,1.4,2.2)*(1-ease(t,4.1,5.5));marker.scale.setScalar(1+ease(t,1.4,3)*.3);
    const active=t<17?direct:indirect,activeOpacity=t<17?directOpacity:indirectOpacity;
    overlay.style.opacity=1;
    title.textContent=t<17?title.dataset.direct:t<31?title.dataset.indirect:title.dataset.compare;
    title.style.opacity=ease(t,5.5,6.5)*(1-ease(t,38,39));
    root.querySelector('.dce-model-label').style.opacity=ease(t,4.6,6)*(1-ease(t,30,32));
    labelConversion.textContent=active.indirect?labelConversion.dataset.indirect:'CdTe';
    labelReadout.textContent=active.indirect?labelReadout.dataset.indirect:labelReadout.dataset.direct;
    setLabel(labelConversion,active.group.localToWorld(v(1.35,.65,.82)),activeOpacity*ease(t,5.7,6.5));
    setLabel(labelReadout,active.group.localToWorld(v(1.35,active.indirect?-.56:active.readoutY-.37,.82)),activeOpacity*ease(t,5.7,6.5));
    setLabel(entry,v(focus.x,lidTop+.1,focus.z),ease(t,1.5,2.5)*(1-ease(t,4.4,5.4)));
    const finalFade=1-ease(t,38,40),baseScale=mobile?.92:1;
    const storedScale=mobile?.36:.48,finalScale=mobile?.54:.82;
    // The direct plot is kept as a small memory while the second event plays.
    const directX=mix(width*.5,width*.2,transition);
    const directY=mix(height*.63,height*.16,transition);
    const dpos=plotPosition(plots[0],mix(directX,width*.265,comparison),mix(directY,height*.40,comparison),mix(mix(baseScale,storedScale,transition),finalScale,comparison),ease(t,11.8,12.4)*finalFade);
    const ipos=plotPosition(plots[1],mix(width*.5,width*.735,comparison),mix(height*.63,height*.40,comparison),mix(baseScale,finalScale,comparison),ease(t,25.1,25.7)*finalFade);
    const directGrowth=ease(t,13.45,15),indirectGrowth=ease(t,26.65,28.5);
    drawPlot(plots[0],directGrowth);drawPlot(plots[1],indirectGrowth);
    const flowDirect=t>=11.8&&t<14.6,flowIndirect=t>=25&&t<28.3,flow=flowDirect||flowIndirect;
    const flowStack=flowDirect?direct:indirect,plot=flowDirect?dpos:ipos,start=flowDirect?11.8:25;
    connectors.forEach(({path,dot},i)=>{
      const weight=Math.exp(-.5*((i-6)/(flowDirect?.7:2.4))**2),p=clamp((t-start-Math.abs(i-6)*.035)/1.65);
      const from=project(flowStack.group.localToWorld(v((i-6)*.316,flowStack.readoutY-.12,.83)));
      const to={x:plot.x+plot.w*(20+i*15)/220,y:plot.y+plot.h*.73};
      const cy=mix(from.y,to.y,.56);path.setAttribute('d',`M${from.x},${from.y} C${from.x},${cy} ${to.x},${cy} ${to.x},${to.y}`);
      const alpha=flow&&p>0&&weight>.02?weight*.45*(1-ease(p,.8,1)):0;
      path.style.opacity=alpha;path.style.stroke=flowDirect?'#8cdcff':'#c5b2ff';
      const q=1-p,x=q*q*q*from.x+3*q*q*p*from.x+3*q*p*p*to.x+p*p*p*to.x,y=q*q*q*from.y+3*q*q*p*cy+3*q*p*p*cy+p*p*p*to.y;
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.style.fill=flowDirect?'#8cdcff':'#c5b2ff';dot.style.opacity=flow&&p>0&&p<1&&weight>.02?Math.max(.35,weight):0;
    });
    let caption=t<6.5?'incoming':t<8?'incoming':t<8.8?'absorbed':t<11.5?'charges':t<12.2?'collected':t<16?'narrow':t<18.2?'next':t<20?'incoming':t<20.7?'light':t<24?'spread':t<25.5?'photodiode':t<30?'broad':t<39?'final':'incoming';
    captions.forEach(p=>p.style.opacity=p.dataset.storyCaption===caption?'1':'0');
    const legend=t<8||t>=18.2&&t<20?'x':t>=20&&t<24?'light':t<30?'charge':'';
    legends.forEach(el=>el.style.opacity=el.dataset.legend===legend?'1':'.3');
    const chapter=t<6.5||t>=39?0:t<17?1:t<31?2:3;chapters.forEach((b,i)=>b.setAttribute('aria-current',String(i===chapter)));
    progress.style.transform=`scaleX(${elapsed/DURATION})`;clock.textContent=`${String(Math.floor(elapsed)).padStart(2,'0')} / ${DURATION}`;scrub.value=String(elapsed);
    const state=storyState(t);root.dataset.time=elapsed.toFixed(3);root.dataset.phase=state.phase;root.dataset.directState=state.direct;root.dataset.indirectState=state.indirect;
    renderer.render(scene,camera);
  }
  return {render};
}
