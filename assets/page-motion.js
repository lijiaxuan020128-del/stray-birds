/* Preview-only wind transitions. Never writes book, coordinates or storage. */
(() => {
  'use strict';
  const frame = document.querySelector('#frame');
  const canvas = document.querySelector('#canvas');
  const cover = document.querySelector('#coverSurface');
  if (!frame || !canvas || !cover) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = '.windTurning #canvas,.windTurning #coverSurface{pointer-events:none!important}.windTurning .sectionNav{pointer-events:none}.preview #frame{isolation:isolate}.windLayer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:60}.preview #canvas .item{will-change:translate,opacity}';
  document.head.append(style);
  const backdrop = document.createElement('div');
  backdrop.style.cssText='position:absolute;inset:0;z-index:-1;pointer-events:none';
  frame.style.isolation='isolate';
  frame.prepend(backdrop);
  const layer = document.createElement('canvas');
  layer.className = 'windLayer';
  layer.setAttribute('aria-hidden', 'true');
  frame.append(layer);
  const ctx = layer.getContext('2d');
  let turning = false, generation = 0, animations = [], motes = [], flow = null, transitionPaper = null, coverEntering = false;
  let last = performance.now(), wheelSum = 0, wheelLast = 0, wheelSign = 0, quietUntil = 0;
  const originalGo = go;
  const originalRender = render;
  const isCover = () => page()?.type === 'cover';
  const paper = () => isCover() ? page().cover?.paper || '#76708e' : theme().paper;
  const api = () => { try { return cover.contentWindow?.coverMotion; } catch { return null; } };
  function syncSurface() {
    backdrop.style.backgroundColor = transitionPaper || paper();
    cover.style.background = 'transparent';
    try { if (cover.contentDocument?.body) cover.contentDocument.body.style.background = 'transparent'; } catch {}
  }
  cover.addEventListener('load', syncSurface);
  function animate(el, keys, duration, delay = 0) {
    const animation = el.animate(keys, { duration, delay, easing: 'cubic-bezier(.22,.7,.22,1)', fill: 'both' });
    animations.push(animation);
    return animation;
  }
  function coverText(incoming) {
    try {
      const doc = cover.contentDocument;
      if (!doc) return false;
      const nodes = doc.querySelectorAll('main h1,main .english,main p,main .enter,footer');
      if (!nodes.length) return false;
      nodes.forEach(el => animate(el, incoming ? [{opacity:0},{opacity:1}] : [{opacity:1},{opacity:0}], incoming ? 760 : 420, incoming ? 130 : 0));
      return true;
    } catch { return false; }
  }
  function finish() {
    animations.forEach(a => a.cancel()); animations = [];
    turning = false; flow = null; transitionPaper = null;
    document.body.classList.remove('windTurning');
    frame.removeAttribute('aria-busy');
    syncSurface();
    if (isCover() || !preview) {
      motes = [];
      if (!coverEntering) api()?.resume();
    }
    coverEntering = false;
  }
  render = function () {
    if (turning) { generation++; finish(); }
    originalRender(); syncSurface();
    if (!preview || isCover()) { motes = []; if (!coverEntering) api()?.resume(); }
  };
  function slide(incoming) {
    canvas.querySelectorAll('.item').forEach(el => {
      const x = parseFloat(el.style.left) || 0, width = parseFloat(el.style.width) || 0;
      const offset = x + width / 2 < 600 ? -x - width - 36 : 1236 - x;
      const tag = el.classList.contains('tag');
      const rest = { translate: '0px 0px', opacity: 1 };
      const away = { translate: `${offset}px ${incoming ? 12 : -8}px`, opacity: 0 };
      animate(el, incoming ? [away, rest] : [rest, away], incoming ? 1050 : 620,
        incoming ? (tag ? 170 : 0) : (tag ? 0 : 70));
    });
    canvas.querySelectorAll('.pageText,.pageLine,.catalogKicker,.dreamNote,.dreamDeco,.empty').forEach(el => {
      animate(el, incoming ? [{opacity:0},{opacity:1}] : [{opacity:1},{opacity:0}], incoming ? 760 : 420, incoming ? 130 : 0);
    });
  }
  function startWind(direction) {
    const rect = frame.getBoundingClientRect();
    const snapshot = isCover() ? api()?.take() : null;
    if (snapshot) {
      motes = snapshot.points.map(p => ({
        x: p.x / snapshot.width, y: p.y / snapshot.height,
        vx: p.vx / snapshot.width, vy: p.vy / snapshot.height,
        phase: p.phase, size: snapshot.size / 2, ink: snapshot.ink, alpha: .85,
        trail: p.tail.reduce((a, n, i, all) => { if (!(i % 2)) a.push([n / snapshot.width, all[i+1] / snapshot.height]); return a; }, [])
      }));
    } else if (!motes.length && book.particles?.enabled !== false) {
      motes = Array.from({length: 48}, (_,i) => ({x:Math.random(),y:.2+Math.random()*.6,vx:0,vy:0,
        phase:i*2.39996,size:1+Math.random(),ink:theme().ink,alpha:.18,trail:[]}));
    }
    flow = { start: performance.now(), direction, width: rect.width };
  }
  go = function (index) {
    if (!Number.isInteger(index) || index < 0 || index >= book.pages.length || index === pi) return;
    if (turning) return;
    if (!preview || reduced.matches) { originalGo(index); syncSurface(); return; }
    const token = ++generation, fromCover = isCover(), fromPaper = paper();
    const targetPage = book.pages[index];
    const targetPaper = targetPage?.type === 'cover' ? targetPage.cover?.paper || '#76708e' : (targetPage?.theme?.paper || book.theme?.paper || theme().paper);
    const fromDesk = getComputedStyle(document.body).backgroundColor;
    const direction = index > pi ? 1 : -1;
    transitionPaper = fromPaper;
    turning = true;
    document.body.classList.add('windTurning'); frame.setAttribute('aria-busy', 'true');
    window.resetCatalogParticles?.();
    startWind(direction);
    if (fromCover) {
      coverText(false);
      animate(cover, [{opacity:1},{opacity:0}], 740);
    } else slide(false);
    setTimeout(() => {
      if (token !== generation || !preview) return;
      turning = false;
      originalGo(index);
      turning = true;
      const toPaper = targetPaper || paper();
      transitionPaper = fromPaper;
      backdrop.style.backgroundColor = fromPaper;
      // Never animate or overwrite #canvas background: render/theme owns catalog colors.
      // Only the independent backdrop interpolates between the two page papers.
      animate(backdrop, [{backgroundColor:fromPaper},{backgroundColor:toPaper}], 900);
      animate(document.body, [{backgroundColor:fromDesk},{backgroundColor:theme().desk}], 900);
      if (isCover()) {
        coverEntering = true;
        api()?.enterFromEdge?.(direction, 1050);
        cover.style.opacity = '1';
        if (!coverText(true)) animate(cover, [{opacity:0},{opacity:1}], 740);
      } else slide(true);
      setTimeout(() => {
        if (token !== generation) return;
        transitionPaper = toPaper;
        finish(); quietUntil = performance.now() + 150;
      }, 1210);
    }, 350);
  };
  const editable = target => target?.closest?.('input,textarea,select,[contenteditable="true"],aside');
  function wheel(event) {
    if (!preview || event.ctrlKey || document.querySelector('dialog[open]') || editable(event.target)) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    event.preventDefault();
    const now = performance.now(), sign = Math.sign(event.deltaY), gap = now - wheelLast;
    wheelLast = now;
    if (turning || now < quietUntil) { wheelSum = 0; quietUntil = now + 170; return; }
    if (gap > 180 || sign !== wheelSign) wheelSum = 0;
    wheelSign = sign;
    wheelSum += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelSum) >= 60) { wheelSum = 0; go(pi + sign); }
  }
  function key(event) {
    if (!preview || event.ctrlKey || event.metaKey || event.altKey || editable(event.target) || document.querySelector('dialog[open]')) return;
    const direction = ['PageDown','ArrowDown','ArrowRight'].includes(event.key) ? 1 : ['PageUp','ArrowUp','ArrowLeft'].includes(event.key) ? -1 : 0;
    if (direction) { event.preventDefault(); if (!event.repeat) go(pi + direction); }
  }
  window.addEventListener('wheel', wheel, {passive:false});
  window.addEventListener('keydown', key);
  function bindCover() {
    try {
      const doc = cover.contentDocument;
      if (!doc || doc.documentElement.dataset.windBound) return;
      doc.documentElement.dataset.windBound = '1';
      doc.addEventListener('wheel', wheel, {passive:false}); doc.addEventListener('keydown', key);
    } catch {}
  }
  cover.addEventListener('load', bindCover); bindCover();
  ['pointermove','click'].forEach(type => window.addEventListener(type, e => {
    if (turning && e.target.closest?.('#frame')) { e.stopImmediatePropagation(); if (type === 'click') e.preventDefault(); }
  }, true));
  function tick(now) {
    const dt = Math.min(.033, (now-last)/1000); last=now;
    const r=frame.getBoundingClientRect(), d=Math.min(2,devicePixelRatio||1);
    if (layer.width!==Math.round(r.width*d)||layer.height!==Math.round(r.height*d)) {layer.width=Math.round(r.width*d);layer.height=Math.round(r.height*d);}
    ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);
    if (preview && !document.hidden && !reduced.matches && (!isCover() || turning)) {
      const progress=flow?Math.min(1,(now-flow.start)/1160):1;
      motes.forEach((p,i)=>{
        const wind=flow?Math.sin(progress*Math.PI):0;
        const vx=flow?flow.direction*(.28+.45*wind)+Math.sin(p.phase)*.09:.008*Math.sin(now/2300+p.phase);
        const vy=flow?Math.cos(p.x*5+now/1400+p.phase*.12)*.22*wind:-.012;
        const blend=1-Math.exp(-dt*(flow?3.2:1.4));
        p.vx+=(vx-p.vx)*blend;p.vy+=(vy-p.vy)*blend;p.x+=p.vx*dt;p.y+=p.vy*dt;
        const wanted=flow ? .65*(1-progress)+.12 : .12;
        p.alpha+=(wanted-p.alpha)*(1-Math.exp(-dt*3));
        if(!flow){if(p.x>1.03)p.x=-.03;if(p.x<-.03)p.x=1.03;if(p.y<-.03)p.y=1.03;}
        p.trail.push([p.x,p.y]);if(p.trail.length>7)p.trail.shift();
        ctx.strokeStyle=p.ink;ctx.fillStyle=p.ink;ctx.lineCap='round';
        for(let j=1;j<p.trail.length;j++){const a=p.trail[j-1],b=p.trail[j];if(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])>.2)continue;ctx.globalAlpha=p.alpha*j/p.trail.length*.5;ctx.lineWidth=Math.max(.5,p.size*j/p.trail.length);ctx.beginPath();ctx.moveTo(a[0]*r.width,a[1]*r.height);ctx.lineTo(b[0]*r.width,b[1]*r.height);ctx.stroke();}
        ctx.globalAlpha=p.alpha;ctx.beginPath();ctx.arc(p.x*r.width,p.y*r.height,Math.max(.6,p.size*(flow?1:.55)),0,Math.PI*2);ctx.fill();
      });
      if(!flow&&motes.length>24)motes=motes.slice(0,24);
    }
    ctx.globalAlpha=1;requestAnimationFrame(tick);
  }
  reduced.addEventListener('change',()=>{if(turning){generation++;finish();}motes=[];});
  syncSurface();requestAnimationFrame(tick);
})();