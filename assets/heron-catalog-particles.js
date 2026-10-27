(() => {
  'use strict';

  const ALPHA_THRESHOLD=28, SAMPLE_MAX=560;
  const CONFIG={
    '苍鹭':{n:24,r:4.6,fill:'#838b95',stroke:'#e5ebf1',sw:1.15,kind:'slow',speed:[.20,.48]},
    '麻雀':{n:26,r:4.8,fill:'#9D4B3D',stroke:'#e5c7a4',sw:1.2,kind:'hop',speed:[.35,.75]},
    '普通翠鸟':{n:22,r:3.5,fill:'#38c9cc',stroke:'#99dbc2',sw:1,kind:'dive',speed:[.55,1.05]},
    '普通雨燕':{n:30,r:3.4,fill:'#26353D',stroke:'#B8C4C7',sw:.7,kind:'swift',speed:[.8,1.45]},
    '太平鸟':{n:25,r:5.4,fill:'#A58D73',stroke:'#fbbb32',sw:1,kind:'cluster',speed:[.28,.65]},
    '小䴙䴘':{n:24,r:4.6,fill:'#795548',stroke:'#5f1707',sw:1,kind:'divehide',speed:[.30,.62]},
    '针尾沙锥':{n:24,r:4.4,fill:'#796044',stroke:'#E1CAA1',sw:1.1,kind:'horizontal',speed:[.38,.78]},
    '震旦鸦雀':{n:25,r:5.2,fill:'#f3bc44',stroke:'#9a5b28',sw:1.2,kind:'hop',speed:[.34,.72]},
    '珠颈斑鸠':{n:24,r:4.8,fill:'#A58D8C',stroke:'#514945',sw:1.5,kind:'calm',speed:[.26,.58]},
    '红隼':{n:22,r:5.1,fill:'#B87652',stroke:'#332724',sw:1.8,kind:'kestrel',speed:[.75,1.35]},
    '白鹡鸰':{n:25,r:4.5,fill:'#E4E6E3',stroke:'#303331',sw:1.5,kind:'wagtail',speed:[.48,.92]},
    '斑头雁':{n:24,r:5.0,fill:'#D5D2C8',stroke:'#343536',sw:2.2,kind:'migrate',speed:[.42,.82]},
    '大斑啄木鸟':{n:23,r:5.3,fill:'#B8322A',stroke:'#52231F',sw:2,kind:'vertical',speed:[.34,.72]},
    '戴胜':{n:24,r:5.0,fill:'#D98232',stroke:'#5A351D',sw:1.4,kind:'ground',speed:[.32,.68]},
    '黑水鸡':{n:25,r:4.5,fill:'#541c2d',stroke:'#282424',sw:1,kind:'moorhen',speed:[.30,.66]},
    '鸿雁':{n:24,r:5.0,fill:'#89674F',stroke:'#cab69b',sw:1.8,kind:'goose',speed:[.32,.68]},
    '家燕':{n:28,r:4.0,fill:'#263E47',stroke:'#e45b21',sw:2,kind:'swallow',speed:[.68,1.22]}
  };
  const maskCache=new Map(),states=new WeakMap();let raf=0;

  function birdName(el){return el?.querySelector('img')?.alt||''}
  function configFor(el){const n=birdName(el);return CONFIG[n]||Object.entries(CONFIG).find(([k])=>n.includes(k))?.[1]||null}
  function isBirdItem(el){return !!preview&&!!el&&!el.classList.contains('tag')&&!!configFor(el)}

  function loadMask(src){
    if(maskCache.has(src))return maskCache.get(src);
    const promise=new Promise(resolve=>{const im=new Image();im.onload=()=>{try{const sc=Math.min(1,SAMPLE_MAX/im.naturalWidth,SAMPLE_MAX/im.naturalHeight),w=Math.max(1,Math.round(im.naturalWidth*sc)),h=Math.max(1,Math.round(im.naturalHeight*sc)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,w,h);resolve({w,h,data:x.getImageData(0,0,w,h).data})}catch{resolve(null)}};im.onerror=()=>resolve(null);im.src=src});
    maskCache.set(src,promise);return promise;
  }
  function alphaAt(m,x,y){if(!m||x<0||x>1||y<0||y>1)return 0;const px=Math.max(0,Math.min(m.w-1,Math.floor(x*m.w))),py=Math.max(0,Math.min(m.h-1,Math.floor(y*m.h)));return m.data[(py*m.w+px)*4+3]}
  function inside(m,x,y){return alphaAt(m,x,y)>ALPHA_THRESHOLD}
  function randomInside(m){for(let i=0;i<1600;i++){const x=Math.random(),y=Math.random();if(inside(m,x,y))return{x,y}}return{x:.5,y:.5}}
  function particle(m,c,i){const p=randomInside(m),a=Math.random()*Math.PI*2,s=c.speed[0]+Math.random()*(c.speed[1]-c.speed[0]);return{x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,alpha:0,phase:Math.random()*Math.PI*2,i,hidden:0}}

  function resetState(el){const st=states.get(el);if(st){st.hover=false;st.burst=false;st.im.style.opacity='';st.im.style.transition='';st.canvas.remove();states.delete(el)}else{const im=el?.querySelector('img');if(im){im.style.opacity='';im.style.transition=''}el?.querySelectorAll('.catalogParticleLayer').forEach(n=>n.remove())}}
  function resetAll(){document.querySelectorAll('#canvas .item').forEach(el=>{if(configFor(el))resetState(el)})}
  window.resetCatalogParticles=resetAll;window.resetHeronCatalogParticles=resetAll;

  async function ensureState(el){let st=states.get(el);if(st)return st;const im=el.querySelector('img'),cfg=configFor(el),mask=await loadMask(im.src);if(!cfg||!mask||!el.isConnected||!preview)return null;const canvas=document.createElement('canvas');canvas.className='catalogParticleLayer';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:1;z-index:3';el.append(canvas);im.style.transition='opacity .42s ease';st={el,im,canvas,mask,cfg,hover:false,burst:false,t:Math.random()*100,particles:Array.from({length:cfg.n},(_,i)=>particle(mask,cfg,i))};states.set(el,st);start();return st}
  async function setHover(el,on){if(!on){const st=states.get(el);if(!st||st.burst)return;st.hover=false;st.im.style.opacity='1';st.particles.forEach(p=>p.alpha=Math.min(p.alpha,.75));setTimeout(()=>{if(st.hover||st.burst)return;st.canvas.remove();st.im.style.opacity='';st.im.style.transition='';states.delete(el)},460);return}const st=await ensureState(el);if(!st||st.burst)return;st.hover=true;requestAnimationFrame(()=>{if(st.hover&&!st.burst)st.im.style.opacity='0'})}

  function behavior(st,p){const k=st.cfg.kind,t=st.t+p.phase;
    if(k==='slow'||k==='calm'){p.vx+=Math.sin(t*.018)*.002;p.vy+=Math.cos(t*.014)*.002}
    else if(k==='hop'){if(Math.sin(t*.065)>.94){p.vx+=.045*(Math.random()>.5?1:-1);p.vy-=.07}p.vy+=.003}
    else if(k==='dive'){if(Math.sin(t*.045+p.i)>.965){p.vx*=1.35;p.vy=Math.abs(p.vy)+.32}}
    else if(k==='swift'){p.vx+=Math.cos(t*.03+p.i)*.014;p.vy+=Math.sin(t*.04+p.i)*.012}
    else if(k==='cluster'){p.vx+=(0.5-p.x)*.006;p.vy+=(0.48-p.y)*.006}
    else if(k==='divehide'){if(p.hidden>0){p.hidden--;return}if(Math.sin(t*.025+p.i)>.992)p.hidden=18+Math.floor(Math.random()*22)}
    else if(k==='horizontal'){p.vx+=Math.sign(p.vx||1)*.004;p.vy*=.985}
    else if(k==='kestrel'){p.vx+=.012;p.vy+=Math.sin(t*.035)*.008}
    else if(k==='wagtail'){p.vx+=Math.sin(t*.07+p.i)*.012;p.vy+=Math.cos(t*.11+p.i)*.004}
    else if(k==='migrate'){p.vx+=.006;p.vy+=Math.sin(t*.025+p.i)*.003}
    else if(k==='vertical'){p.vy-=.006;p.vx*=.985}
    else if(k==='ground'){p.vx+=Math.sin(t*.035+p.i)*.006;p.vy+=.004}
    else if(k==='moorhen'){p.vx+=Math.sin(t*.024+p.i)*.006;if(p.i%7===0)p.vx+=.009}
    else if(k==='goose'){p.vx+=Math.sin(t*.018+p.i)*.004;p.vy+=Math.cos(t*.021+p.i)*.003}
    else if(k==='swallow'){p.vx+=Math.cos(t*.04+p.i)*.018;p.vy+=Math.sin(t*.052+p.i)*.016}
    const max=st.cfg.speed[1]*1.55,d=Math.hypot(p.vx,p.vy);if(d>max){p.vx=p.vx/d*max;p.vy=p.vy/d*max}
  }
  function collide(st,w,h){const ps=st.particles,min=st.cfg.r*2.25;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j],dx=(b.x-a.x)*w,dy=(b.y-a.y)*h,d2=dx*dx+dy*dy;if(d2>0&&d2<min*min){const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,avx=a.vx,avy=a.vy;a.vx=b.vx;a.vy=b.vy;b.vx=avx;b.vy=avy;const q=(min-d)/2;a.x-=nx*q/w;a.y-=ny*q/h;b.x+=nx*q/w;b.y+=ny*q/h}}}
  function bounce(st,p,w,h){const ox=p.x,oy=p.y;p.x+=p.vx/w;p.y+=p.vy/h;if(inside(st.mask,p.x,p.y))return;p.x=ox;p.y=oy;const probes=[[-p.vx,p.vy],[p.vx,-p.vy],[-p.vx,-p.vy]];for(const [vx,vy] of probes){if(inside(st.mask,p.x+vx/w,p.y+vy/h)){p.vx=vx;p.vy=vy;return}}const q=randomInside(st.mask);p.x=q.x;p.y=q.y;p.vx*=-1;p.vy*=-1}
  function drawState(st){const r=st.el.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),cw=Math.max(1,Math.round(r.width*dpr)),ch=Math.max(1,Math.round(r.height*dpr));if(st.canvas.width!==cw||st.canvas.height!==ch){st.canvas.width=cw;st.canvas.height=ch}const x=st.canvas.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,r.width,r.height);st.t++;if(!st.burst)collide(st,r.width,r.height);for(const p of st.particles){if(st.burst){p.x+=p.vx/r.width;p.y+=p.vy/r.height;p.vx*=1.035;p.vy*=1.035;p.alpha=Math.max(0,p.alpha-.018)}else{p.alpha+=st.hover?.075:-.055;p.alpha=Math.max(0,Math.min(1,p.alpha));behavior(st,p);bounce(st,p,r.width,r.height)}if(p.alpha<=0||p.hidden>0)continue;x.globalAlpha=p.alpha;x.beginPath();x.arc(p.x*r.width,p.y*r.height,st.cfg.r,0,Math.PI*2);x.fillStyle=st.cfg.fill;x.fill();x.lineWidth=st.cfg.sw;x.strokeStyle=st.cfg.stroke;x.stroke()}x.globalAlpha=1}
  function tick(){let active=false;document.querySelectorAll('#canvas .item').forEach(el=>{const st=states.get(el);if(st&&el.isConnected){drawState(st);active=true}});raf=active?requestAnimationFrame(tick):0}
  function start(){if(!raf)raf=requestAnimationFrame(tick)}

  document.addEventListener('pointermove',async e=>{if(!preview)return;const birds=[...document.querySelectorAll('#canvas .item')].filter(isBirdItem);for(const el of birds){const r=el.getBoundingClientRect(),im=el.querySelector('img');let hit=false;if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){const mask=await loadMask(im.src);hit=!!mask&&inside(mask,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)}const st=states.get(el);if(hit){if(!st||!st.hover)setHover(el,true)}else if(st&&st.hover&&!st.burst)setHover(el,false)}},true);
  document.addEventListener('pointerleave',()=>{document.querySelectorAll('#canvas .item').forEach(el=>{const st=states.get(el);if(st&&st.hover&&!st.burst)setHover(el,false)})},true);

  const previousActivate=activate;
  activate=function(b,part){const cfg=CONFIG[b?.name];if(!preview||part!=='bird'||!cfg)return previousActivate(b,part);const el=[...document.querySelectorAll('#canvas .item:not(.tag)')].find(node=>node.querySelector('img')?.alt===b.name);if(!el)return previousActivate(b,part);ensureState(el).then(st=>{if(!st)return previousActivate(b,part);st.hover=false;st.burst=true;st.im.style.opacity='0';const r=st.el.getBoundingClientRect();st.particles.forEach((p,i)=>{const dx=(p.x-.46)*r.width,dy=(p.y-.55)*r.height,d=Math.hypot(dx,dy)||1,out=.8+Math.random()*.75;p.vx=dx/d*out+1.05+Math.random()*.65;p.vy=dy/d*out-.85-Math.random()*.5;if(['swift','swallow','migrate','kestrel'].includes(st.cfg.kind))p.vx+=.75;if(['ground','hop','wagtail'].includes(st.cfg.kind))p.vy-=.25;p.alpha=1;p.hidden=0});start();setTimeout(()=>previousActivate(b,part),520)})};

  const previousRender=render;render=function(){resetAll();previousRender()};
  document.querySelectorAll('#canvas .item img').forEach(im=>{if(CONFIG[im.alt])loadMask(im.src)});
})();