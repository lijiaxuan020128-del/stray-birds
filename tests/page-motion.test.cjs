const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/page-motion.js', 'utf8');
function setup() {
  let time=0,timers=[],takes=0,resumes=0;
  const animations=[],listeners={};
  class Element {
    constructor(tag=false,x=0,w=100){this.style={left:String(x),width:String(w)};this.attrs={};this.dataset={};this.classList={contains:s=>tag&&s==='tag',add(){},remove(){}};}
    append(){} prepend(){} setAttribute(k,v){this.attrs[k]=v;} removeAttribute(k){delete this.attrs[k];}
    addEventListener(k,fn){(this.listeners??={})[k]=fn;}
    getBoundingClientRect(){return {width:1200,height:760};}
    animate(keys,options){const a={el:this,keys,options,canceled:false,cancel(){this.canceled=true;}};animations.push(a);return a;}
    querySelectorAll(s){return s==='.item'?items:[];}
    getContext(){return {};}
  }
  const items=[new Element(false,90,220),new Element(true,920,150),new Element(false,860,250)];
  const frame=new Element(),canvas=new Element(),cover=new Element(),body=new Element();
  const doc={body,head:new Element(),createElement:()=>new Element(),querySelector:s=>({'#frame':frame,'#canvas':canvas,'#coverSurface':cover}[s]||null)};
  cover.contentDocument={body:new Element(),documentElement:new Element(),addEventListener(){}};
  cover.contentWindow={coverMotion:{take(){takes++;return {width:1200,height:760,size:5,ink:'#fff',points:[{x:500,y:300,vx:60,vy:20,phase:1,tail:[499,299]}]};},resume(){resumes++;}}};
  const reduced={matches:false,addEventListener(){}};
  const book={pages:[{type:'cover',cover:{paper:'#76708e'},birds:[]},{birds:[{name:'new-upload',x:90,y:200,w:220,h:100,tag:{x:920,y:400,w:150,h:32}}]},{birds:[]}],particles:{enabled:true}};
  const c={document:doc,window:{addEventListener:(k,fn)=>listeners[k]=fn},matchMedia:()=>reduced,performance:{now:()=>time},requestAnimationFrame(){},devicePixelRatio:1,innerHeight:900,getComputedStyle:()=>({backgroundColor:'#222'}),setTimeout:(fn,ms)=>timers.push({at:time+ms,fn}),book,pi:0,preview:true,theme:()=>({paper:'#d8cfb8',desk:'#222',ink:'#333'})};
  c.page=()=>book.pages[c.pi];c.render=()=>{};c.go=i=>{c.pi=i;c.render();};vm.createContext(c);vm.runInContext(source,c);
  function advance(ms){const end=time+ms;while(true){timers.sort((a,b)=>a.at-b.at);if(!timers.length||timers[0].at>end)break;const t=timers.shift();time=t.at;t.fn();}time=end;}
  function wheel(y,extra={}){let prevented=false;listeners.wheel({deltaY:y,deltaX:0,deltaMode:0,target:{closest:()=>null},preventDefault(){prevented=true;},...extra});return prevented;}
  return {c,book,items,animations,frame,reduced,advance,wheel,get takes(){return takes;},get resumes(){return resumes;}};
}
 test('cover handoff, generic new images and independent tag directions preserve data',()=>{
 const s=setup(),before=JSON.stringify(s.book);s.c.go(1);assert.equal(s.takes,1);assert.equal(s.frame.attrs['aria-busy'],'true');s.advance(350);assert.equal(s.c.pi,1);
 const bird=s.animations.find(a=>a.el===s.items[0]);const tag=s.animations.find(a=>a.el===s.items[1]);assert.match(bird.keys[0].translate,/^-/);assert.doesNotMatch(tag.keys[0].translate,/^-/);assert.equal(tag.options.delay,110);
 s.advance(810);assert.equal(s.frame.attrs['aria-busy'],undefined);assert.ok(s.animations.every(a=>a.canceled));assert.equal(JSON.stringify(s.book),before);s.c.go(0);s.advance(1160);assert.equal(s.c.pi,0);assert.ok(s.resumes>0);
 });
 test('wheel threshold, animation lock, inertia, reverse direction and bounds',()=>{
 const s=setup();s.wheel(25);s.advance(10);assert.equal(s.takes,0);s.wheel(35);assert.equal(s.takes,1);s.wheel(200);s.advance(1160);assert.equal(s.c.pi,1);s.wheel(200);s.advance(50);assert.equal(s.c.pi,1);s.advance(200);s.wheel(-80);s.advance(1160);assert.equal(s.c.pi,0);s.advance(200);s.wheel(-80);s.advance(1160);assert.equal(s.c.pi,0);
 });
 test('editing and reduced-motion navigate without animation; cancel cannot switch editor page later',()=>{
 const s=setup();s.c.go(1);s.advance(100);s.c.preview=false;s.c.render();s.advance(2000);assert.equal(s.c.pi,0);const n=s.animations.length;assert.equal(s.wheel(120),false);s.c.go(1);assert.equal(s.c.pi,1);assert.equal(s.animations.length,n);s.c.preview=true;s.reduced.matches=true;s.c.go(2);assert.equal(s.c.pi,2);assert.equal(s.animations.length,n);
 });
 test('zoom gestures and input fields retain their default behavior',()=>{const s=setup();assert.equal(s.wheel(120,{ctrlKey:true}),false);assert.equal(s.wheel(120,{target:{closest:()=>({})}}),false);assert.equal(s.c.pi,0);});
