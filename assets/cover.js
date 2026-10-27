(() => {
'use strict';
const defaults={shape:'bird',size:4,count:64,speed:1,passing:true,interval:12};
const key='stray-birds-cover-v1';
let cfg={...defaults};
try {const v=JSON.parse(localStorage.getItem(key)||'null');if(v){for(const k of ['size','count','speed','interval'])if(Number.isFinite(v[k]))cfg[k]=v[k];if(['bird','dot','dash'].includes(v.shape))cfg.shape=v.shape;if(typeof v.passing==='boolean')cfg.passing=v.passing;}}catch{}
cfg.size=Math.max(1,Math.min(12,cfg.size));cfg.count=Math.round(Math.max(12,Math.min(120,cfg.count)));cfg.speed=Math.max(.3,Math.min(2,cfg.speed));cfg.interval=Math.max(5,Math.min(30,cfg.interval));
const $=id=>document.getElementById(id),canvas=$('sky'),ctx=canvas.getContext('2d');
let w=innerWidth,h=innerHeight,birds=[],visitors=[],pointer={x:w*.7,y:h*.55,time:-100},time=0,nextPass=3,last=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);}
function seed(){birds=Array.from({length:cfg.count},()=>({x:w*.7+(Math.random()-.5)*240,y:h*.6+(Math.random()-.5)*160,vx:30+Math.random()*30,vy:(Math.random()-.5)*40,phase:Math.random()*6.28}));}
function sync(){for(const k of ['shape','size','count','speed','interval']){$(k).value=cfg[k];if($(k+'Out'))$(k+'Out').textContent=cfg[k]+(k==='interval'?' 秒':k==='size'?' px':'');}$('passing').checked=cfg.passing;$('pause').textContent=paused?'继续运动':'暂停运动';}
function drawBird(b,size,opacity){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.globalAlpha=opacity;ctx.strokeStyle=ctx.fillStyle='#f4efdc';ctx.lineWidth=Math.max(.75,size*.2);ctx.lineCap='round';ctx.beginPath();if(cfg.shape==='dot'){ctx.arc(0,0,size*.5,0,Math.PI*2);ctx.fill();}else if(cfg.shape==='dash'){ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.stroke();}else{const flap=Math.sin(time*7+b.phase)*size*.55;ctx.moveTo(-size*.7,-size+flap);ctx.quadraticCurveTo(size*.5,-size*.4,0,0);ctx.quadraticCurveTo(size*.5,size*.4,-size*.7,size-flap);ctx.stroke();}ctx.restore();}
function spawn(){const dir=Math.random()<.5?1:-1,cy=h*(.15+Math.random()*.65);for(let i=0;i<26;i++){const row=Math.floor(i/2);visitors.push({x:(dir===1?-100:w+100)-dir*row*15,y:cy+(i%2?1:-1)*row*7,vx:dir*(70+Math.random()*8),vy:-8,phase:Math.random()*6.28,age:0});}}
function step(dt){time+=dt;const active=time-pointer.time<3;const target=active?pointer:{x:w*(.5+.31*Math.cos(time*.15)),y:h*(.5+.28*Math.sin(time*.21))};
const forces=birds.map(b=>{let sx=0,sy=0,ax=0,ay=0,cx=0,cy=0,n=0;for(const o of birds){if(o===b)continue;const dx=b.x-o.x,dy=b.y-o.y,d2=dx*dx+dy*dy;if(d2<6400){n++;ax+=o.vx;ay+=o.vy;cx+=o.x;cy+=o.y;if(d2<625){sx+=dx/(d2+1);sy+=dy/(d2+1);}}}let fx=(target.x-b.x)*.12+sx*650,fy=(target.y-b.y)*.12+sy*650;if(n){fx+=(ax/n-b.vx)*.65+(cx/n-b.x)*.12;fy+=(ay/n-b.vy)*.65+(cy/n-b.y)*.12;}return {x:fx,y:fy};});
birds.forEach((b,i)=>{b.vx+=forces[i].x*dt;b.vy+=forces[i].y*dt;const v=Math.hypot(b.vx,b.vy)||1,limit=Math.max(28,Math.min(105,v));b.vx=b.vx/v*limit;b.vy=b.vy/v*limit;b.x+=b.vx*dt*cfg.speed;b.y+=b.vy*dt*cfg.speed;});
if(cfg.passing&&time>=nextPass){spawn();nextPass=time+cfg.interval+Math.random()*3;}
visitors.forEach(b=>{b.age+=dt;b.x+=b.vx*dt*cfg.speed;b.y+=(b.vy+Math.sin(time+b.phase)*5)*dt*cfg.speed;});visitors=visitors.filter(b=>b.age<60&&b.x>-600&&b.x<w+600);
}
function tick(now){const dt=Math.min((now-last)/1000||0,.033);last=now;if(!paused&&!document.hidden)step(dt);ctx.clearRect(0,0,w,h);if(cfg.passing)visitors.forEach(b=>drawBird(b,cfg.size*.65,.27));birds.forEach(b=>drawBird(b,cfg.size,.7));requestAnimationFrame(tick);}
window.addEventListener('resize',resize);document.addEventListener('pointermove',e=>{if(e.target.closest('aside,button,a,select,input'))return;pointer={x:e.clientX,y:e.clientY,time};});
$('settingsButton').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsButton').setAttribute('aria-expanded',String(open));};document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('settings').hidden=true;$('settingsButton').setAttribute('aria-expanded','false');}});
for(const k of ['shape','size','count','speed','interval'])$(k).addEventListener('input',()=>{cfg[k]=k==='shape'?$(k).value:Number($(k).value);if(k==='count')seed();if(k==='interval')nextPass=time+cfg.interval;sync();$('status').textContent='预览已更新，点击保存以保留设置。';});
$('passing').onchange=()=>{cfg.passing=$('passing').checked;visitors=[];nextPass=time+1;};$('pause').onclick=()=>{paused=!paused;sync();};
$('saveSettings').onclick=()=>{try{localStorage.setItem(key,JSON.stringify(cfg));$('status').textContent='封面设置已保存在此浏览器。';}catch{$('status').textContent='浏览器无法保存设置；当前预览仍可使用。';}};
$('reset').onclick=()=>{cfg={...defaults};seed();sync();visitors=[];nextPass=time+2;$('status').textContent='已恢复默认，点击保存以保留。';};
resize();seed();sync();requestAnimationFrame(tick);
})();
