(() => {
  'use strict';

  const HERON_NAME = '苍鹭';
  const PARTICLE_COUNT = 18;
  const PARTICLE_RADIUS = 4.6;
  const SPEED_MIN = 0.22;
  const SPEED_MAX = 0.58;
  const ALPHA_THRESHOLD = 28;
  const SAMPLE_MAX = 520;
  const FILL = '#838b95';
  const STROKE = '#e5ebf1';

  const maskCache = new Map();
  const states = new WeakMap();
  let raf = 0;

  function isHeronItem(el){
    if(!preview || !el || el.classList.contains('tag')) return false;
    const im = el.querySelector('img');
    return !!im && (im.alt || '').includes(HERON_NAME);
  }

  function loadMask(src){
    if(maskCache.has(src)) return maskCache.get(src);
    const promise = new Promise(resolve => {
      const im = new Image();
      im.onload = () => {
        try{
          const sc = Math.min(1, SAMPLE_MAX / im.naturalWidth, SAMPLE_MAX / im.naturalHeight);
          const w = Math.max(1, Math.round(im.naturalWidth * sc));
          const h = Math.max(1, Math.round(im.naturalHeight * sc));
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          const x = c.getContext('2d', {willReadFrequently:true});
          x.drawImage(im, 0, 0, w, h);
          resolve({w,h,data:x.getImageData(0,0,w,h).data});
        }catch(e){ resolve(null); }
      };
      im.onerror = () => resolve(null);
      im.src = src;
    });
    maskCache.set(src,promise);
    return promise;
  }

  function inside(mask,x,y){
    if(!mask) return true;
    const px = Math.max(0,Math.min(mask.w-1,Math.floor(x*mask.w)));
    const py = Math.max(0,Math.min(mask.h-1,Math.floor(y*mask.h)));
    return mask.data[(py*mask.w+px)*4+3] > ALPHA_THRESHOLD;
  }

  function randomInside(mask){
    for(let i=0;i<900;i++){
      const x=Math.random(), y=Math.random();
      if(inside(mask,x,y)) return {x,y};
    }
    return {x:.5,y:.5};
  }

  function particle(mask){
    const p=randomInside(mask);
    const a=Math.random()*Math.PI*2;
    const s=SPEED_MIN+Math.random()*(SPEED_MAX-SPEED_MIN);
    return {x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s};
  }

  async function enter(el){
    if(!isHeronItem(el)) return;
    let st=states.get(el);
    if(st){st.hover=true;return;}
    const im=el.querySelector('img');
    const mask=await loadMask(im.src);
    if(!el.isConnected || !preview) return;
    const canvas=document.createElement('canvas');
    canvas.className='heronParticleLayer';
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .28s ease;z-index:2';
    el.style.overflow='visible';
    el.append(canvas);
    st={el,im,canvas,mask,hover:true,particles:Array.from({length:PARTICLE_COUNT},()=>particle(mask)),fade:0};
    states.set(el,st);
    im.style.transition='opacity .34s ease';
    requestAnimationFrame(()=>{if(st.hover){canvas.style.opacity='1';im.style.opacity='.08';}});
    start();
  }

  function leave(el){
    const st=states.get(el); if(!st)return;
    st.hover=false;
    st.canvas.style.opacity='0';
    st.im.style.opacity='1';
    setTimeout(()=>{
      if(st.hover)return;
      st.canvas.remove();
      st.im.style.opacity='';
      st.im.style.transition='';
      states.delete(el);
    },360);
  }

  function collide(ps,w,h){
    const minDist=PARTICLE_RADIUS*2.25;
    for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
      const a=ps[i],b=ps[j];
      const dx=(b.x-a.x)*w,dy=(b.y-a.y)*h,d2=dx*dx+dy*dy;
      if(d2>0&&d2<minDist*minDist){
        const d=Math.sqrt(d2),nx=dx/d,ny=dy/d;
        const avx=a.vx,avy=a.vy;
        a.vx=b.vx;a.vy=b.vy;b.vx=avx;b.vy=avy;
        const push=(minDist-d)/2;
        a.x-=nx*push/w;a.y-=ny*push/h;b.x+=nx*push/w;b.y+=ny*push/h;
      }
    }
  }

  function drawState(st){
    const r=st.el.getBoundingClientRect();
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const cw=Math.max(1,Math.round(r.width*dpr)),ch=Math.max(1,Math.round(r.height*dpr));
    if(st.canvas.width!==cw||st.canvas.height!==ch){st.canvas.width=cw;st.canvas.height=ch;}
    const x=st.canvas.getContext('2d');
    x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);
    const ps=st.particles;
    collide(ps,r.width,r.height);
    for(const p of ps){
      const ox=p.x,oy=p.y;
      p.x+=p.vx/r.width;p.y+=p.vy/r.height;
      if(!inside(st.mask,p.x,p.y)){
        p.x=ox;p.y=oy;
        const probes=[[ -p.vx,p.vy],[p.vx,-p.vy],[-p.vx,-p.vy]];
        let ok=false;
        for(const [vx,vy] of probes){
          const nx=p.x+vx/r.width,ny=p.y+vy/r.height;
          if(inside(st.mask,nx,ny)){p.vx=vx;p.vy=vy;ok=true;break;}
        }
        if(!ok){const q=randomInside(st.mask);p.x=q.x;p.y=q.y;p.vx*=-1;p.vy*=-1;}
      }
      x.beginPath();x.arc(p.x*r.width,p.y*r.height,PARTICLE_RADIUS,0,Math.PI*2);
      x.fillStyle=FILL;x.fill();x.lineWidth=1.15;x.strokeStyle=STROKE;x.stroke();
    }
  }

  function tick(){
    let active=false;
    document.querySelectorAll('#canvas .item').forEach(el=>{
      const st=states.get(el);if(st&&st.hover&&el.isConnected){drawState(st);active=true;}
    });
    raf=active?requestAnimationFrame(tick):0;
  }
  function start(){if(!raf)raf=requestAnimationFrame(tick);}

  document.addEventListener('pointerover',e=>{
    if(!preview)return;
    const el=e.target.closest?.('#canvas .item');
    if(isHeronItem(el)) enter(el);
  },true);
  document.addEventListener('pointerout',e=>{
    const el=e.target.closest?.('#canvas .item');
    if(!isHeronItem(el))return;
    if(e.relatedTarget&&el.contains(e.relatedTarget))return;
    leave(el);
  },true);

  const previousRender=render;
  render=function(){
    document.querySelectorAll('.heronParticleLayer').forEach(n=>n.remove());
    previousRender();
  };
})();