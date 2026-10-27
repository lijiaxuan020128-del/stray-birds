(() => {
'use strict';
const defaults={size:5,count:90,speed:1,spacing:1,scatter:1,passing:true,interval:12,birdSize:10,title:'飞鸟集',english:'STRAY BIRDS',tagline:'以粒子之群，抽象飞鸟之形。形态隐去，习性浮现。',paper:'#76708e',ink:'#f4efdc',titleSize:108,titleX:50,titleY:48,font:''};
const key='stray-birds-cover-v2',embedded=new URLSearchParams(location.search).has('embed');
let cfg={...defaults};try{Object.assign(cfg,JSON.parse(localStorage.getItem(key)||'{}'));}catch{}
if(cfg.tagline==='形态隐去，习性浮现。')cfg.tagline=defaults.tagline;
const $=id=>document.getElementById(id),canvas=$('sky'),ctx=canvas.getContext('2d');let w=innerWidth,h=innerHeight,points=[],time=0,last=0,pointer={x:w*.65,y:h*.6,active:false},paused=false,anchor={x:w*.65,y:h*.6},vaX=0,vaY=0,trail=[],lenCur=140,lastSX=w*.65,lastSY=h*.6;
function normalize(){for(const [k,min,max] of [['size',1,12],['count',12,180],['speed',.3,2],['interval',5,30],['birdSize',4,24],['titleSize',40,160],['titleX',15,85],['titleY',20,75],['spacing',.4,2.5]])cfg[k]=Math.max(min,Math.min(max,Number(cfg[k])||defaults[k]));const sv=Number(cfg.scatter);cfg.scatter=Math.max(0,Math.min(2.5,Number.isFinite(sv)?sv:defaults.scatter));cfg.count=Math.round(cfg.count);}
function seed(){points=Array.from({length:cfg.count},(_,i)=>{const t=Math.sqrt((i+.5)/cfg.count),ph=i*2.39996+Math.random()*.6;return{x:anchor.x+(Math.random()-.5)*200,y:anchor.y+(Math.random()-.5)*160,vx:0,vy:0,phase:ph,slot:t,orb:9+t*30,follow:.8-.56*t,ang:.3+Math.random()*.42,breathe:.13+Math.random()*.15,bf:.3+Math.random()*.5,wob:Math.random()*6.283,jx:Math.random()*2-1,jy:Math.random()*2-1,tail:[]};});}
function sync(){normalize();for(const k of ['size','count','speed','interval','spacing','scatter']){$(k).value=cfg[k];$(k+'Out').textContent=cfg[k]+(k==='interval'?' 秒':k==='size'?' px':'');}$('passing').checked=cfg.passing;$('pause').textContent=paused?'继续运动':'暂停运动';document.querySelector('h1').textContent=cfg.title;document.querySelector('.english').textContent=cfg.english;document.querySelector('main p').textContent=cfg.tagline;document.querySelector('h1').style.fontFamily=cfg.font?'"'+cfg.font+'","Microsoft Yahei",serif':'';$('fontFace').value=cfg.font||'';document.documentElement.style.setProperty('--paper',cfg.paper);document.documentElement.style.setProperty('--ink',cfg.ink);const main=document.querySelector('main');main.style.left='50%';main.style.top=cfg.titleY+'%';document.querySelector('h1').style.fontSize=`clamp(40px,${cfg.titleSize/12}vw,${cfg.titleSize}px)`;}
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);}
function tick(now){const dt=Math.min((now-last)/1000||0,.033);last=now;ctx.clearRect(0,0,w,h);if(!paused&&!document.hidden)time+=dt;const target=pointer.active?pointer:{x:w*(.5+.26*Math.cos(time*.18)),y:h*(.52+.22*Math.sin(time*.24))};
/* 锚点用加速度受限的转向力追踪指针：急停后靠惯性滑翔再渐进减速，绝无瞬间拽动 */
if(!paused&&!document.hidden){
 const stiff=4.6+2.2*cfg.speed,vmax=850+750*cfg.speed,amax=(6000+5000*cfg.speed)*dt;
 let dvx=(target.x-anchor.x)*stiff,dvy=(target.y-anchor.y)*stiff;const dvl=Math.hypot(dvx,dvy);
 if(dvl>vmax){dvx*=vmax/dvl;dvy*=vmax/dvl;}
 let ax=dvx-vaX,ay=dvy-vaY;const al=Math.hypot(ax,ay);
 if(al>amax){ax*=amax/al;ay*=amax/al;}
 vaX+=ax;vaY+=ay;anchor.x+=vaX*dt;anchor.y+=vaY*dt;
 /* 轨迹记录做低通：折返的路径被抹圆，队伍不会沿折痕裂开或抖动 */
 lastSX+=(anchor.x-lastSX)*.3;lastSY+=(anchor.y-lastSY)*.3;
 trail.push({x:lastSX,y:lastSY,t:time});}
while(trail.length&&time-trail[0].t>1.6)trail.shift();
/* 队长独立缓动：展开快、收拢慢，落定后飘带缓缓缩回而不是骤缩 */
const vspd=Math.hypot(vaX,vaY),gap=cfg.spacing,scat=cfg.scatter;
const wantLen=Math.min(w*.62,(52+Math.min(430,vspd*1.1))*gap);
lenCur+=(wantLen-lenCur)*(1-Math.exp(-dt*(wantLen>lenCur?3.2:.85)));
const len=lenCur;
/* 队伍沿锚点最近 1.6 秒走过的路径排开：路径是弯的，队形就是弯的飘带 */
let cum=0;const segs=[0];for(let i=1;i<trail.length;i++){cum+=Math.hypot(trail[i].x-trail[i-1].x,trail[i].y-trail[i-1].y);segs.push(cum);}
const total=cum;
const trailAt=d=>{const n=trail.length;if(!n)return{x:anchor.x,y:anchor.y,tx:1,ty:0};
 const from=total-Math.min(d,total);let i=1;while(i<segs.length&&segs[i]<from)i++;
 const p0=trail[i-1],p1=trail[i]||p0,s0=segs[i-1],s1=segs[i],f=s1>s0?(from-s0)/(s1-s0):0;
 let txx=p1.x-p0.x,tyy=p1.y-p0.y;const tl=Math.hypot(txx,tyy)||1;txx/=tl;tyy/=tl;
 return{x:p0.x+(p1.x-p0.x)*f,y:p0.y+(p1.y-p0.y)*f,tx:txx,ty:tyy};};
let cx=0,cy=0;ctx.lineCap='round';ctx.strokeStyle=cfg.ink;ctx.fillStyle=cfg.ink;
for(const p of points){if(!paused&&!document.hidden){
 const d=trailAt(p.slot*len),a=p.phase+time*p.ang;
 const orb=p.orb*gap*(1+p.breathe*Math.sin(time*p.bf+p.phase*1.7));
 /* 每颗粒子绕自己在队中的位置缓缓盘旋，鸟群因此始终流动，而不是排成死直线 */
 const wobX=(Math.sin(p.y*.011+time*.75+p.wob)*9+Math.sin(time*.5+p.wob*1.3)*p.jx*40)*scat;
 const wobY=(Math.sin(time*.62+p.wob*2.1)*7+Math.cos(p.x*.009-time*.5+p.wob)*5+Math.cos(time*.44+p.wob*.7)*p.jy*40)*scat;
 const tx=d.x-d.ty*Math.cos(a)*orb+d.tx*Math.sin(a)*orb*.72+wobX;
 const ty=d.y+d.tx*Math.cos(a)*orb+d.ty*Math.sin(a)*orb*.72+wobY;
 /* 队头贴得最紧、队尾滞后更多：头部咬住指针，尾部自然拖成流带 */
 const k=1-Math.exp(-dt*(1.6+4.0*p.follow)*cfg.speed);
 const nx=p.x+(tx-p.x)*k,ny=p.y+(ty-p.y)*k;p.vx=nx-p.x;p.vy=ny-p.y;p.x=nx;p.y=ny;
 p.tail.push(p.x,p.y);if(p.tail.length>14)p.tail.splice(0,2);}
 const n=p.tail.length/2;
 for(let i=1;i<n;i++){const t=i/n;ctx.globalAlpha=.55*t*t;ctx.lineWidth=Math.max(.6,cfg.size*(.3+.6*t));ctx.beginPath();ctx.moveTo(p.tail[2*i-2],p.tail[2*i-1]);ctx.lineTo(p.tail[2*i],p.tail[2*i+1]);ctx.stroke();}
 if(n){ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.8,cfg.size*.5),0,Math.PI*2);ctx.fill();}
 cx+=p.x;cy+=p.y;}
ctx.globalAlpha=1;canvas.dataset.centerX=(cx/points.length).toFixed(1);canvas.dataset.centerY=(cy/points.length).toFixed(1);canvas.dataset.targetX=target.x.toFixed(1);canvas.dataset.targetY=target.y.toFixed(1);canvas.dataset.ax=anchor.x.toFixed(1);canvas.dataset.ay=anchor.y.toFixed(1);canvas.dataset.len=Math.round(lenCur);requestAnimationFrame(tick);}
window.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY,active:true};},{capture:true,passive:true});document.documentElement.addEventListener('pointerleave',()=>pointer.active=false);window.addEventListener('resize',resize);
$('settingsButton').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsButton').setAttribute('aria-expanded',String(open));};document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('settings').hidden=true;$('settingsButton').setAttribute('aria-expanded','false');}});
function notify(){if(embedded)parent.postMessage({type:'cover-change',config:cfg},location.origin);}
for(const k of ['size','count','speed','interval','spacing','scatter'])$(k).addEventListener('input',()=>{cfg[k]=Number($(k).value);sync();if(k==='count')seed();notify();$('status').textContent=embedded?'已同步到工作台，请保存排版。':'预览已更新，请保存设置。';});$('passing').onchange=()=>{cfg.passing=$('passing').checked;notify();};$('pause').onclick=()=>{paused=!paused;sync();};
$('saveSettings').onclick=()=>{try{localStorage.setItem(key,JSON.stringify(cfg));notify();$('status').textContent=embedded?'请在工作台点击「保存排版」。':'封面设置已保存在此浏览器。';}catch{$('status').textContent='保存失败，请检查浏览器存储。';}};
$('reset').onclick=()=>{cfg={...defaults};sync();seed();notify();};
if(embedded){document.body.classList.add('embedded');document.querySelector('.enter').onclick=e=>{e.preventDefault();parent.postMessage({type:'cover-enter'},location.origin);};window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='cover-config')return;cfg={...defaults,...e.data.config};if(cfg.tagline==='形态隐去，习性浮现。')cfg.tagline=defaults.tagline;sync();if(points.length!==cfg.count)seed();});parent.postMessage({type:'cover-ready'},location.origin);}
/* 标题字体：探测本机已安装的中西文字体，供下拉切换 */
const FONT_LIST=['宋体','黑体','微软雅黑','楷体','仿宋','隶书','幼圆','华文行楷','华文楷体','华文隶书','华文新魏','华文琥珀','方正舒体','方正姚体','等线','Georgia','Times New Roman','Arial Black','Verdana','Courier New'];
function detectFonts(){const s=document.createElement('span');s.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:64px';s.textContent='飞鸟集STRAY AgW1@';document.body.append(s);const probe=fb=>{s.style.fontFamily=fb;return s.offsetWidth};const bases=['monospace','serif','sans-serif'].map(probe);const out=[];for(const f of FONT_LIST){let ok=false;['monospace','serif','sans-serif'].forEach((fb,i)=>{s.style.fontFamily='"'+f+'",'+fb;if(s.offsetWidth!==bases[i])ok=true});if(ok)out.push(f)}s.remove();return out}
const fontSel=$('fontFace');
for(const f of detectFonts())fontSel.append(new Option(f,f));
fontSel.value=cfg.font||'';
fontSel.onchange=()=>{cfg.font=fontSel.value;sync();notify();$('status').textContent=embedded?'已同步到工作台，请保存排版。':'预览已更新，请保存设置。'};
const bg=document.createElement('canvas');bg.className='passingFlock';bg.setAttribute('aria-hidden','true');document.body.prepend(bg);createPassingFlock(bg,()=>cfg);resize();sync();seed();requestAnimationFrame(tick);
})();
