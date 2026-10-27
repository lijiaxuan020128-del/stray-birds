/* Shared bird silhouettes: independent from the cover's circular particles. */
window.createPassingFlock=function(canvas,options=()=>({})){const ctx=canvas.getContext('2d');let birds=[],time=0,next=1,last=0,raf,stopped=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function tick(now){if(stopped)return;raf=requestAnimationFrame(tick);if(!canvas.isConnected||document.hidden){last=now;return;}const cfg=options(),w=canvas.clientWidth||1200,h=canvas.clientHeight||760,d=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);const dt=Math.min((now-last)/1000||0,.04);last=now;if(cfg.passing===false)return;if(!reduced.matches)time+=dt;
/* 一群鸟主要从画面上空掠过：松散队形，起飞后慢慢散开 */
if(time>=next){const dir=Math.random()<.5?1:-1,baseY=h*(.06+Math.random()*.3),alpha=.2+Math.random()*.1,n=9+Math.floor(Math.random()*6);
for(let i=0;i<n;i++){const row=Math.floor(i/2),side=i%2?1:-1,rr=Math.random();birds.push({x:(dir>0?-w*.06:w*1.06),ox:-dir*(row*26+rr*18+(Math.random()-.5)*8),by:baseY,oy:side*row*(11+rr*9)+(Math.random()-.5)*13,vx:dir*(68+Math.random()*32),fs:3.4+Math.random()*2.4,gp:Math.random()*6.283,wf:.45+Math.random()*.5,wa:h*.024+Math.random()*h*.028,ph:Math.random()*6.283,drift:h*.016+Math.random()*h*.024,age:0,s:.72+rr*.5,py:undefined});}
flockAlpha=alpha;next=time+(Number(cfg.interval)||12)+Math.random()*3;}
ctx.fillStyle=cfg.ink||'#f4efdc';ctx.globalAlpha=flockAlpha;
for(const b of birds){if(!reduced.matches){b.age+=dt;
 /* 扑翼-滑翔循环带来的忽快忽慢，加上正弦起伏的航线与缓慢的纵向漂移 */
 b.x+=b.vx*(1+.16*Math.sin(b.age*2.3+b.gp))*dt;
 const sp=1+b.age*.02;
 b.y=b.by+b.oy*sp+Math.sin(b.age*b.wf+b.ph)*b.wa+Math.sin(b.age*b.wf*2.3+b.ph*1.7)*b.wa*.32+Math.sin(b.age*.12+b.ph)*b.drift;
}else{b.y=b.by;}
 const dy=b.py===undefined?0:b.y-b.py;b.py=b.y;
 const pitch=Math.max(-.42,Math.min(.42,Math.atan2(dy,Math.abs(b.vx)*dt+1e-4)));
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(pitch);ctx.scale(b.vx>0?1:-1,1);
 const s=(Number(cfg.birdSize)||10)*b.s,glide=.5+.5*Math.sin(time*.45+b.gp),flap=Math.sin(b.age*b.fs+b.gp)*(.62-.46*glide),bob=Math.sin(b.age*b.fs*2+b.gp)*s*.06;
 ctx.translate(0,bob);ctx.beginPath();
 ctx.moveTo(-s,-s*flap);ctx.quadraticCurveTo(-s*.38,-s*.3,0,0);ctx.quadraticCurveTo(s*.38,-s*.3,s,-s*flap);
 ctx.quadraticCurveTo(s*.45,s*.02,s*.16,s*.2);ctx.quadraticCurveTo(0,s*.3,-s*.16,s*.2);ctx.quadraticCurveTo(-s*.45,s*.02,-s,-s*flap);
 ctx.fill();ctx.restore();}
birds=birds.filter(b=>b.age<60&&b.x>-w*.35&&b.x<w*1.35);}
let flockAlpha=.25;
raf=requestAnimationFrame(tick);return()=>{stopped=true;cancelAnimationFrame(raf);};};
