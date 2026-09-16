import {test,expect} from '@playwright/test';
test.setTimeout(60000);
test.beforeEach(async({page})=>{await page.addInitScript(()=>{localStorage.setItem('cookies-accepted','1');});});

async function openFilm(page){
  await page.goto('/');
  await page.locator('[data-dce]').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
  const film=page.locator('[data-dce]');
  await expect(film).toHaveClass(/dce-live/,{timeout:30000});
  return film;
}
test('CAD is lazy-loaded; chapters, pause and offscreen suspension use one clock',async({page})=>{
  test.setTimeout(60000); // Software WebGL runners compile the PBR/shadow shaders on first use.
  const requests=[];page.on('request',r=>{if(r.url().endsWith('.glb'))requests.push(r.url());});
  await page.goto('/');await page.waitForTimeout(300);expect(requests).toHaveLength(0);
  await page.locator('[data-dce]').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
  const film=page.locator('[data-dce]');await expect(film).toHaveAttribute('data-model','cad',{timeout:30000});
  await film.locator('[data-seek="3.7"]').click();await expect(film).toHaveAttribute('data-phase','direct');
  const paused=await film.getAttribute('data-time');await page.waitForTimeout(300);expect(await film.getAttribute('data-time')).toBe(paused);
  await film.getByRole('button',{name:'Play',exact:true}).click();await expect(film).toHaveClass(/dce-running/);
  await expect.poll(()=>film.getAttribute('data-time')).not.toBe(paused);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await expect(film).not.toHaveClass(/dce-running/);
  const offscreen=await film.getAttribute('data-time');await page.waitForTimeout(300);expect(await film.getAttribute('data-time')).toBe(offscreen);
  expect(requests).toHaveLength(1);
});
test('reduced motion starts with an actual product poster and no 3D download',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const requests=[];page.on('request',r=>{if(/\.glb|three\.module/.test(r.url()))requests.push(r.url());});
  await page.goto('/#conversion-comparison');const film=page.locator('[data-dce]');await expect(film).not.toHaveClass(/dce-live/);
  await expect(film.locator('.dce-controls')).toBeHidden();await expect(film.locator('.dce-fallback img')).toBeVisible();
  await expect.poll(()=>film.locator('.dce-fallback img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);expect(requests).toHaveLength(0);
});
test('motion preference can change during playback',async({page})=>{
  const film=await openFilm(page);await page.emulateMedia({reducedMotion:'reduce'});await expect(film).not.toHaveClass(/dce-live|dce-running/);
  await expect(film.locator('.dce-fallback')).toBeVisible();await page.emulateMedia({reducedMotion:'no-preference'});await expect(film).toHaveClass(/dce-live/);
  await film.locator('canvas').dispatchEvent('webglcontextlost');await expect(film).not.toHaveClass(/dce-live|dce-running/);
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(film.locator('.dce-fallback')).toBeVisible();
});
test('failed model download retains complete static explanation',async({page})=>{
  await page.route('**/ufs225.glb',r=>r.abort());await page.goto('/#conversion-comparison');const film=page.locator('[data-dce]');
  await expect(film).toHaveAttribute('data-film-error','unavailable',{timeout:30000});await expect(film.locator('.dce-fallback')).toBeVisible();await expect(film.locator('figcaption')).toContainText('scintillator');await expect(film.locator('.dce-controls')).toBeHidden();
});
test('WebGL unavailable retains poster',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};});
  await page.goto('/#conversion-comparison');const film=page.locator('[data-dce]');await expect(film).toHaveAttribute('data-film-error','unavailable',{timeout:30000});await expect(film.locator('.dce-fallback')).toBeVisible();
});
test('mobile comparison stays within viewport; controls work with keyboard',async({page})=>{
  await page.setViewportSize({width:390,height:900});const film=await openFilm(page);
  for(const [time,phase] of [['0.4','product'],['3.7','direct'],['10','indirect'],['17.8','comparison']]){
    const chapter=film.locator(`[data-seek="${time}"]`);await chapter.focus();await page.keyboard.press('Enter');
    await expect(film).toHaveAttribute('data-phase',phase);await expect(chapter).toHaveAttribute('aria-current','true');
    const layout=await film.evaluate(el=>({width:document.documentElement.scrollWidth,viewport:innerWidth,plots:[...el.querySelectorAll('[data-plot]')].filter(x=>Number(x.style.opacity)>.9).map(x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right};})}));
    expect(layout.width).toBeLessThanOrEqual(layout.viewport);
    for(const plot of layout.plots){expect(plot.left).toBeGreaterThanOrEqual(0);expect(plot.right).toBeLessThanOrEqual(layout.viewport);}
    if(phase==='direct'||phase==='indirect'){
      const projection=await film.evaluate(el=>{const frame=el.getBoundingClientRect();return {left:frame.left,right:frame.right,labels:[...el.querySelectorAll('[data-layer]')].filter(label=>Number(getComputedStyle(label).opacity)>.9).map(label=>{const r=label.getBoundingClientRect();return {left:r.left,right:r.right};})};});
      expect(projection.labels).toHaveLength(phase==='indirect'?3:2);
      for(const label of projection.labels){expect(label.left).toBeGreaterThanOrEqual(projection.left);expect(label.right).toBeLessThanOrEqual(projection.right);}
    }
  }
});

async function seek(film,time){
  // Only the final comparison hold is trimmed from the original playback.
  const trimmedHold=2*Math.max(0,Math.min(1,(time-32)/6));
  const actual=Math.round((time*22/42-trimmedHold)/.05)*.05;
  await film.locator('[data-scrub]').evaluate((input,value)=>{input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));},actual);
  await expect(film).toHaveAttribute('data-time',actual.toFixed(3));
}

test('one event progresses from absorption through collection to its retained distribution',async({page})=>{
  const film=await openFilm(page);
  // Retain references to the actual nodes, so replacement charts cannot pass.
  const nodes=await film.evaluateHandle(el=>[...el.querySelectorAll('[data-plot]')].map(plot=>({plot,profile:plot.querySelector('[data-profile]'),bars:[...plot.querySelectorAll('[data-bar]')]})));
  for(const [time,kind,state,caption] of [
    [8,'direct','generation','absorbed'],[8.8,'direct','collection','charges'],
    [11.5,'direct','readout','collected'],[12.2,'direct','distribution','narrow'],
    [20,'indirect','generation','light'],[20.7,'indirect','light-spread','spread'],
    [24,'indirect','charge-transfer','photodiode'],[24.8,'indirect','readout','photodiode'],
    [25.5,'indirect','distribution','broad']
  ]){
    await seek(film,time+.1); // Sample inside the state, beyond range-step rounding.
    await expect(film).toHaveAttribute(`data-${kind}-state`,state);
    await expect(film.locator(`[data-story-caption="${caption}"]`)).toHaveCSS('opacity','1');
  }
  const transforms={};
  for(const [kind,travel,start,middle,end] of [['direct',13,13.45,14.2,15],['indirect',26.3,26.65,27.5,28.5]]){
    const plot=film.locator(`[data-plot="${kind}"]`),center=plot.locator('[data-bar]').nth(6);
    await seek(film,start-.1);expect(Number(await center.getAttribute('height'))).toBe(0);
    const emptyPath=await plot.locator('[data-profile]').getAttribute('d');
    await seek(film,travel);
    expect(await film.locator('.dce-signal-links circle').evaluateAll(dots=>dots.some(dot=>Number(dot.style.opacity)>0))).toBe(true);
    expect(await plot.locator('[data-bar]').evaluateAll(bars=>bars.every(bar=>Number(bar.getAttribute('height'))===0))).toBe(true);
    expect(await plot.locator('[data-profile]').getAttribute('d')).toBe(emptyPath);
    await seek(film,middle);const growing=Number(await center.getAttribute('height'));expect(growing).toBeGreaterThan(0);expect(growing).toBeLessThan(50);
    await seek(film,end+.1);expect(Number(await center.getAttribute('height'))).toBeCloseTo(50);
    expect(await plot.locator('[data-profile]').getAttribute('d')).not.toBe(emptyPath);
    transforms[kind]=await plot.evaluate(el=>el.style.transform);
  }
  await seek(film,34);await expect(film).toHaveAttribute('data-phase','comparison');
  expect(await nodes.evaluate(saved=>saved.every(({plot,profile,bars})=>plot.isConnected&&plot.querySelector('[data-profile]')===profile&&bars.every((bar,i)=>plot.querySelectorAll('[data-bar]')[i]===bar)))).toBe(true);
  for(const kind of ['direct','indirect']){
    const plot=film.locator(`[data-plot="${kind}"]`);await expect(plot).toHaveCSS('opacity','1');
    expect(await plot.evaluate(el=>el.style.transform)).not.toBe(transforms[kind]);
  }
  const directBars=await film.locator('[data-plot="direct"] [data-bar]').evaluateAll(bars=>bars.map(b=>Number(b.getAttribute('height'))));
  const indirectBars=await film.locator('[data-plot="indirect"] [data-bar]').evaluateAll(bars=>bars.map(b=>Number(b.getAttribute('height'))));
  expect(directBars[6]).toBe(indirectBars[6]);expect(directBars[5]).toBeGreaterThan(0);expect(indirectBars[3]).toBeGreaterThan(directBars[3]);
  await seek(film,37);for(const kind of ['direct','indirect'])await expect(film.locator(`[data-plot="${kind}"]`)).toHaveCSS('opacity','1');
  await nodes.dispose();
});
test('without JavaScript the product and explanation remain visible',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});try{const page=await context.newPage();await page.goto('http://localhost:8080/#conversion-comparison');await expect(page.locator('.dce-fallback img')).toBeVisible();await expect(page.locator('.dce-controls')).toBeHidden();await expect(page.locator('#dce-description')).toContainText('Direct conversion');}finally{await context.close();}
});
