const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup(blocked = false) {
  const events = {}, gestures = {}, buttons = [];
  class Audio {
    constructor(src) { this.src=src; this.paused=true; this.currentTime=0; this.plays=0; }
    play() { this.plays++; if(blocked) return Promise.reject(new Error('NotAllowed')); this.paused=false; return Promise.resolve(); }
    pause() { this.paused=true; }
    addEventListener() {}
  }
  const header = {append:b=>buttons.push(b)};
  const doc = {querySelector:s=>s==='.bookIdentityFrame'?header:null,body:{append(){},classList:{contains:()=>false}},
    createElement:()=>({style:{},setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k];},addEventListener(k,fn){this[k]=fn;}}),
    addEventListener:(k,fn)=>gestures[k]=fn};
  const window={addEventListener:(k,fn)=>events[k]=fn};
  vm.runInNewContext(fs.readFileSync('assets/book-audio.js','utf8'),{document:doc,window,Audio,WeakSet,preview:true,performance:{now:()=>1000}});
  return {audio:window.bookAudio,button:buttons[0],events,gestures,allow(){blocked=false;}};
}
test('page turns preserve the music playhead; mute survives gestures and turns; re-enable resumes',()=>{
  const s=setup(); const {music,turn}=s.audio;
  assert.equal(music.loop,true); music.currentTime=42;
  s.events['book-page-turn'](); assert.equal(music.currentTime,42); assert.equal(music.plays,1); assert.equal(turn.plays,1);
  s.button.click(); assert.equal(music.paused,true); assert.equal(turn.paused,true);
  s.gestures.pointerdown({target:{}}); s.events['book-page-turn']();
  assert.equal(music.plays,1); assert.equal(turn.plays,1);
  s.button.click(); assert.equal(music.paused,false); assert.equal(music.currentTime,42);
});
test('blocked autoplay can be started by first gesture',async()=>{
  const s=setup(true); await Promise.resolve(); assert.equal(s.audio.music.paused,true);
  s.allow(); s.gestures.click({target:{}}); await Promise.resolve(); assert.equal(s.audio.music.paused,false);
});

test('new labels play a quiet single hover sound; inner movement and mute do not retrigger',()=>{
 const s=setup(), tag={contains:other=>other==='inside'};
 s.gestures.pointerover({target:{closest:()=>tag},relatedTarget:'inside',pointerType:'mouse'});
 assert.equal(s.audio.hover.plays,0);
 s.gestures.pointerover({target:{closest:()=>tag},pointerType:'mouse'});
 assert.equal(s.audio.hover.plays,1); assert.ok(s.audio.hover.volume<s.audio.music.volume);
 s.button.click(); assert.equal(s.audio.hover.paused,true);
 s.gestures.pointerover({target:{closest:()=>tag},pointerType:'mouse'});
 assert.equal(s.audio.hover.plays,1);
});
