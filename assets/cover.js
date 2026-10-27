(() => {
'use strict';
const defaults={size:5,count:90,speed:1,spacing:1,scatter:1,passing:true,interval:12,birdSize:10,title:'飞鸟集',english:'STRAY BIRDS',tagline:'形态隐去，习性浮现。',paper:'#76708e',ink:'#f4efdc',titleSize:108,titleX:50,titleY:48};
const key='stray-birds-cover-v2',embedded=new URLSearchParams(location.search).has('embed');
let cfg={...defaults};try{Object.assign(cfg,JSON.parse(localStorage.getItem(key)||'{}'));}catch{}
const $=id=>document.getElementById(id),canvas=$('sky'),ctx=canvas.getContext('2d');let w=innerWidth,h=innerHeight,points=[],time=0,last=0,pointer={x:w*.65,y:h*.6,active:false},paused=false,anchor={x:w*.65,y:h*.6},velX=0,velY=0,dirX=1,dirY=0;
function normalize(){for(const [k,min,max] of [['size',1,12],['count',12,180],['speed',.3,2],['interval',5,30],['birdSize',4,24],['titleSize',40,160],['titleX',15,85],['titleY',20,75],['spacing',.4,2.5]])cfg[k]=Math.max(min,Math.min(max,Number(cfg[k])||defaults[k]));const sv=Number(cfg.scatter);cfg.scatter=Math.max(0,Math.min(2.5,Number.isFinite(sv)?sv:defaults.scatter));cfg.count=Math.round(cfg.count);}
function seed(){points=Array.from({length:cfg.count},(_,i)=>{const t=Math.sqrt((i+.5)/cfg.count),ph=i*2.39996+Math.random()*.6;return{x:anchor.x+(Math.random()-.5)*200,y:anchor.y+(Math.random()-.5)*160,vx:0,vy:0,phase:ph,r:26+t*92,follow:.22+t*.78,ang:.3+Math.random()*.42,squish:.5+Math.random()*.34,breathe:.13+Math.random()*.15,bf:.3+Math.random()*.5,wob:Math.random()*6.283,jx:Math.random()*2-1,jy:Math.random()*2-1,tail:[]};});}
function sync(){normalize();for(const k of ['size','count','speed','interval','spacing','scatter']){$(k).value=cfg[k];$(k+'Out').textContent=cfg[k]+(k==='interval'?' 秒':k==='size'?' px':'');}$('passing').checked=cfg.passing;$('pause').textContent=paused?'继续运动':'暂停运动';document.querySelector('h1').textContent=cfg.title;document.querySelector('.english').textContent=cfg.english;document.querySelector('main p').textContent=cfg.tagline;document.documentElement.style.setProperty('--paper',cfg.paper);document.documentElement.style.setProperty('--ink',cfg.ink);const main=document.querySelector('main');main.style.left=cfg.titleX+'%';main.style.top=cfg.titleY+'%';document.querySelector('h1').style.fontSize=`clamp(40px,${cfg.titleSize/12}vw,${cfg.titleSize}px)`;}
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);}
function tick(now){const dt=Math.min((now-last)/1000||0,.033);last=now;ctx.clearRect(0,0,w,h);if(!paused&&!document.hidden)time+=dt;const target=pointer.active?pointer:{x:w*(.5+.26*Math.cos(time*.18)),y:h*(.52+.22*Math.sin(time*.24))};
/* 锚点本身先被缓动：鼠标瞬移时鸟群整体滑翔过去，而不是跳过去 */
const glide=1-Math.exp(-dt*(2.4+.8*cfg.speed)),pax=anchor.x,pay=anchor.y;anchor.x+=(target.x-anchor.x)*glide;anchor.y+=(target.y-anchor.y)*glide;
/* 用平滑后的锚点速度决定队形朝向：移动越快，队伍沿运动方向拉得越长 */
const avx=(anchor.x-pax)/(dt||1e-4),avy=(anchor.y-pay)/(dt||1e-4),sv=1-Math.exp(-dt*3);velX+=(avx-velX)*sv;velY+=(avy-velY)*sv;
const vspd=Math.hypot(velX,velY);if(vspd>4){dirX=velX/vspd;dirY=velY/vspd;}
const stretch=Math.min(1.7,vspd/240),gap=cfg.spacing,scat=cfg.scatter;
let cx=0,cy=0;ctx.lineCap='round';ctx.strokeStyle=cfg.ink;ctx.fillStyle=cfg.ink;
for(const p of points){if(!paused&&!document.hidden){
 const a=p.phase+time*p.ang,r=p.r*gap*(1+p.breathe*Math.sin(time*p.bf+p.phase*1.7)),sq=p.squish+.16*Math.sin(time*.21+p.wob);
 /* 纵向沿速度拉长、横向收窄：从球团变成一列纵队；静止时回到松散的团 */
 const L=Math.cos(a)*r*(1+stretch*1.35)-stretch*r,T=Math.sin(a)*r*sq*(1-Math.min(.62,stretch*.42));
 const wobX=(Math.sin(p.y*.011+time*.75+p.wob)*16+Math.sin(time*.5+p.wob*1.3)*p.jx*46)*scat;
 const wobY=(Math.sin(time*.62+p.wob*2.1)*12+Math.cos(p.x*.009-time*.5+p.wob)*9+Math.cos(time*.44+p.wob*.7)*p.jy*46)*scat;
 const tx=anchor.x+dirX*L-dirY*T+wobX,ty=anchor.y+dirY*L+dirX*T+wobY;
 /* 外圈粒子滞后更多：鸟群像流体一样被拉扯变形，而不是刚性圆盘 */
 const k=1-Math.exp(-dt*(1.8+4.6*p.follow)*cfg.speed);
 const nx=p.x+(tx-p.x)*k,ny=p.y+(ty-p.y)*k;p.vx=nx-p.x;p.vy=ny-p.y;p.x=nx;p.y=ny;
 p.tail.push(p.x,p.y);if(p.tail.length>14)p.tail.splice(0,2);}
 const n=p.tail.length/2;
 for(let i=1;i<n;i++){const t=i/n;ctx.globalAlpha=.55*t*t;ctx.lineWidth=Math.max(.6,cfg.size*(.3+.6*t));ctx.beginPath();ctx.moveTo(p.tail[2*i-2],p.tail[2*i-1]);ctx.lineTo(p.tail[2*i],p.tail[2*i+1]);ctx.stroke();}
 if(n){ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.8,cfg.size*.5),0,Math.PI*2);ctx.fill();}
 cx+=p.x;cy+=p.y;}
ctx.globalAlpha=1;canvas.dataset.centerX=(cx/points.length).toFixed(1);canvas.dataset.centerY=(cy/points.length).toFixed(1);canvas.dataset.targetX=target.x.toFixed(1);canvas.dataset.targetY=target.y.toFixed(1);requestAnimationFrame(tick);}
window.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY,active:true};},{capture:true,passive:true});document.documentElement.addEventListener('pointerleave',()=>pointer.active=false);window.addEventListener('resize',resize);
$('settingsButton').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsButton').setAttribute('aria-expanded',String(open));};document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('settings').hidden=true;$('settingsButton').setAttribute('aria-expanded','false');}});
function notify(){if(embedded)parent.postMessage({type:'cover-change',config:cfg},location.origin);}
for(const k of ['size','count','speed','interval','spacing','scatter'])$(k).addEventListener('input',()=>{cfg[k]=Number($(k).value);sync();if(k==='count')seed();notify();$('status').textContent=embedded?'已同步到工作台，请保存排版。':'预览已更新，请保存设置。';});$('passing').onchange=()=>{cfg.passing=$('passing').checked;notify();};$('pause').onclick=()=>{paused=!paused;sync();};
$('saveSettings').onclick=()=>{try{localStorage.setItem(key,JSON.stringify(cfg));notify();$('status').textContent=embedded?'请在工作台点击「保存排版」。':'封面设置已保存在此浏览器。';}catch{$('status').textContent='保存失败，请检查浏览器存储。';}};
$('reset').onclick=()=>{cfg={...defaults};sync();seed();notify();};
if(embedded){document.body.classList.add('embedded');document.querySelector('.enter').onclick=e=>{e.preventDefault();parent.postMessage({type:'cover-enter'},location.origin);};window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='cover-config')return;cfg={...defaults,...e.data.config};sync();if(points.length!==cfg.count)seed();});parent.postMessage({type:'cover-ready'},location.origin);}
const bg=document.createElement('canvas');bg.className='passingFlock';bg.setAttribute('aria-hidden','true');document.body.prepend(bg);createPassingFlock(bg,()=>cfg);resize();sync();seed();requestAnimationFrame(tick);
})();
