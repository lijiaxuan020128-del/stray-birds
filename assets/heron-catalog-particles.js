(() => {
  'use strict';

  const HERON_NAME='苍鹭';
  const PARTICLE_COUNT=24;
  const PARTICLE_RADIUS=4.6;
  const SPEED_MIN=.20;
  const SPEED_MAX=.48;
  const ALPHA_THRESHOLD=28;
  const SAMPLE_MAX=560;
  const FILL='#838b95';
  const STROKE='#e5ebf1';
  const maskCache=new Map();
  const states=new WeakMap();
  let raf=0;

  function isHeronItem(el){
    if(!preview||!el||el.classList.contains('tag'))return false;
    const im=el.querySelector('img');
    return !!im&&(im.alt||'').includes(HERON_NAME);
  }

  function loadMask(src){
    if(maskCache.has(src))return maskCache.get(src);
    const promise=new Promise(resolve=>{
      const im=new Image();
      im.onload=()=>{
        try{
          const sc=Math.min(1,SAMPLE_MAX/im.naturalWidth,SAMPLE_MAX/im.naturalHeight);
          const w=Math.max(1,Math.round(im.naturalWidth*sc));
          const h=Math.max(1,Math.round(im.naturalHeight*sc));
          const c=document.createElement('canvas');c.width=w;c.height=h;
          const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,w,h);
          resolve({w,h,data:x.getImageData(0,0,w,h).data});
        }catch{resolve(null)}
      };
      im.onerror=()=>resolve(null);im.src=src;
    });
    maskCache.set(src,promise);return promise;
  }

  function alphaAt(mask,x,y){
    if(!mask||x<0||x>1||y<0||y>1)return 0;
    const px=Math.max(0,Math.min(mask.w-1,Math.floor(x*mask.w)));
    const py=Math.max(0,Math.min(mask.h-1,Math.floor(y*mask.h)));
    return mask.data[(py*mask.w+px)*4+3];
  }
  function inside(mask,x,y){return alphaAt(mask,x,y)>ALPHA_THRESHOLD}
  function randomInside(mask){
    for(let i=0;i<1400;i++){const x=Math.random(),y=Math.random();if(inside(mask,x,y))return{x,y}}
    return{x:.5,y:.5};
  }
  function makeParticle(mask){
    const p=randomInside(mask),a=Math.random()*Math.PI*2,s=SPEED_MIN+Math.random()*(SPEED_MAX-SPEED_MIN);
    return{x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,alpha:0};
  }

  async function ensureState(el){
    let st=states.get(el);if(st)return st;
    const im=el.querySelector('img'),mask=await loadMask(im.src);
    if(!mask||!el.isConnected||!preview)return null;
    const canvas=document.createElement('canvas');
    canvas.className='heronParticleLayer';
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:1;z-index:3';
    el.append(canvas);
    im.style.transition='opacity .42s ease';
    st={el,im,canvas,mask,hover:false,burst:false,particles:Array.from({length:PARTICLE_COUNT},()=>makeParticle(mask))};
    states.set(el,st);start();return st;
  }

  async function setHover(el,on){
    if(!on){
      const st=states.get(el);if(!st||st.burst)return;
      st.hover=false;st.im.style.opacity='1';
      st.particles.forEach(p=>p.alpha=Math.min(p.alpha,.75));
      setTimeout(()=>{
        if(st.hover||st.burst)return;
        st.canvas.remove();st.im.style.opacity='';st.im.style.transition='';states.delete(el);
      },460);
      return;
    }
    const st=await ensureState(el);if(!st||st.burst)return;
    st.hover=true;
    requestAnimationFrame(()=>{if(st.hover&&!st.burst)st.im.style.opacity='0'});
  }

  function collide(ps,w,h){
    const minDist=PARTICLE_RADIUS*2.35;
    for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
      const a=ps[i],b=ps[j],dx=(b.x-a.x)*w,dy=(b.y-a.y)*h,d2=dx*dx+dy*dy;
      if(d2>0&&d2<minDist*minDist){
        const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,avx=a.vx,avy=a.vy;
        a.vx=b.vx;a.vy=b.vy;b.vx=avx;b.vy=avy;
        const push=(minDist-d)/2;a.x-=nx*push/w;a.y-=ny*push/h;b.x+=nx*push/w;b.y+=ny*push/h;
      }
    }
  }

  function drawState(st){
    const r=st.el.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
    const cw=Math.max(1,Math.round(r.width*dpr)),ch=Math.max(1,Math.round(r.height*dpr));
    if(st.canvas.width!==cw||st.canvas.height!==ch){st.canvas.width=cw;st.canvas.height=ch}
    const x=st.canvas.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);
    const ps=st.particles;if(!st.burst)collide(ps,r.width,r.height);
    for(const p of ps){
      if(st.burst){
        p.x+=p.vx/r.width;p.y+=p.vy/r.height;p.vx*=1.035;p.vy*=1.035;p.alpha=Math.max(0,p.alpha-.018);
      }else{
        p.alpha+=st.hover?.075:-.055;p.alpha=Math.max(0,Math.min(1,p.alpha));
        const ox=p.x,oy=p.y;p.x+=p.vx/r.width;p.y+=p.vy/r.height;
        if(!inside(st.mask,p.x,p.y)){
          p.x=ox;p.y=oy;
          const probes=[[-p.vx,p.vy],[p.vx,-p.vy],[-p.vx,-p.vy]];let ok=false;
          for(const [vx,vy] of probes){const nx=p.x+vx/r.width,ny=p.y+vy/r.height;if(inside(st.mask,nx,ny)){p.vx=vx;p.vy=vy;ok=true;break}}
          if(!ok){const q=randomInside(st.mask);p.x=q.x;p.y=q.y;p.vx*=-1;p.vy*=-1}
        }
      }
      if(p.alpha<=0)continue;
      x.globalAlpha=p.alpha;x.beginPath();x.arc(p.x*r.width,p.y*r.height,PARTICLE_RADIUS,0,Math.PI*2);
      x.fillStyle=FILL;x.fill();x.lineWidth=1.15;x.strokeStyle=STROKE;x.stroke();
    }
    x.globalAlpha=1;
  }

  function tick(){
    let active=false;
    document.querySelectorAll('#canvas .item').forEach(el=>{const st=states.get(el);if(st&&el.isConnected){drawState(st);active=true}});
    raf=active?requestAnimationFrame(tick):0;
  }
  function start(){if(!raf)raf=requestAnimationFrame(tick)}

  function heronAtPoint(cx,cy){
    const els=[...document.querySelectorAll('#canvas .item')].filter(isHeronItem);
    for(const el of els){
      const r=el.getBoundingClientRect();if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)continue;
      const st=states.get(el),im=el.querySelector('img'),cached=maskCache.get(im.src);
      if(st&&inside(st.mask,(cx-r.left)/r.width,(cy-r.top)/r.height))return el;
      if(cached)cached.then(mask=>{if(mask&&!states.get(el)){} });
    }
    return null;
  }

  document.addEventListener('pointermove',async e=>{
    if(!preview)return;
    const herons=[...document.querySelectorAll('#canvas .item')].filter(isHeronItem);
    for(const el of herons){
      const r=el.getBoundingClientRect(),im=el.querySelector('img');
      let hit=false;
      if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
        const mask=await loadMask(im.src);
        hit=!!mask&&inside(mask,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
      }
      const st=states.get(el);
      if(hit){if(!st||!st.hover)setHover(el,true)}else if(st&&st.hover&&!st.burst)setHover(el,false);
    }
  },true);

  document.addEventListener('pointerleave',()=>{
    document.querySelectorAll('#canvas .item').forEach(el=>{const st=states.get(el);if(st&&st.hover&&!st.burst)setHover(el,false)});
  },true);

  const previousActivate=activate;
  activate=function(b,part){
    if(!preview||part!=='bird'||!(b.name||'').includes(HERON_NAME))return previousActivate(b,part);
    const el=[...document.querySelectorAll('#canvas .item:not(.tag)')].find(node=>node.querySelector('img')?.alt===b.name);
    if(!el)return previousActivate(b,part);
    ensureState(el).then(st=>{
      if(!st)return previousActivate(b,part);
      st.hover=false;st.burst=true;st.im.style.opacity='0';
      const r=st.el.getBoundingClientRect();
      st.particles.forEach(p=>{
        const dx=(p.x-.42)*r.width,dy=(p.y-.55)*r.height,d=Math.hypot(dx,dy)||1;
        const outward=.8+Math.random()*.7;
        p.vx=dx/d*outward+1.25+Math.random()*.55;
        p.vy=dy/d*outward-.95-Math.random()*.45;
        p.alpha=1;
      });
      start();setTimeout(()=>previousActivate(b,part),520);
    });
  };

  const previousRender=render;
  render=function(){document.querySelectorAll('.heronParticleLayer').forEach(n=>n.remove());previousRender()};

  document.querySelectorAll('#canvas .item img').forEach(im=>{if((im.alt||'').includes(HERON_NAME))loadMask(im.src)});
})();