/* Persistent, session-only audio; page rendering never recreates these players. */
(() => {
  'use strict';
  const header = document.querySelector('.bookIdentityFrame');
  if (!header || window.bookAudio) return;
  const music = new Audio('assets/audio/piano.mp3');
  const turn = new Audio('assets/audio/page-turn.mp3');
  const hover = new Audio('assets/audio/bird-hover.mp3');
  hover.volume = .10;
  hover.preload = 'auto';
  hover.id = 'bookBirdHoverSound';
  music.loop = true;
  music.volume = .45;
  music.preload = 'auto';
  turn.volume = .65;
  turn.preload = 'auto';
  music.id = 'bookBackgroundMusic';
  turn.id = 'bookPageTurnSound';
  music.hidden = turn.hidden = hover.hidden = true;
  document.body.append(music, turn, hover);
  let enabled = true;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bookAudioToggle';
  button.style.cssText = 'position:absolute;right:48px;top:16px;min-height:36px;padding:7px 11px;border:1px solid currentColor;border-radius:20px;background:transparent;color:inherit;font:11px/18px Arial,"Microsoft Yahei",sans-serif;letter-spacing:1px;cursor:pointer;pointer-events:auto';
  header.append(button);
  function sync() {
    const pending = enabled && music.paused;
    button.textContent = enabled ? (pending ? '♫ 开启声音' : '♫ 声音已开启') : '♫ 声音已关闭';
    button.setAttribute('aria-label', enabled && !pending ? '关闭全部声音' : '开启全部声音');
    button.setAttribute('aria-pressed', String(enabled && !pending));
    button.title = pending ? '点击开启音乐、翻页声和标签音效' : button.getAttribute('aria-label');
  }
  function start() {
    if (!enabled || !music.paused) return;
    music.play().then(sync).catch(sync);
  }
  function unlock(event) {
    if (event.target.closest?.('.bookAudioToggle')) return;
    start();
  }
  button.addEventListener('click', () => {
    if (enabled && !music.paused) {
      enabled = false;
      music.pause();
      turn.pause();
      turn.currentTime = 0;
      hover.pause();
      hover.currentTime = 0;
    } else { enabled = true; start(); }
    sync();
  });
  function bind(doc) {
    ['pointerdown','click','keydown','wheel','touchend'].forEach(type => doc.addEventListener(type, unlock, {capture:true,passive:true}));
  }
  bind(document);
  const cover = document.querySelector('#coverSurface');
  const bound = new WeakSet();
  function bindCover() {
    try { const doc = cover?.contentDocument; if(doc && !bound.has(doc)) {bound.add(doc);bind(doc);} } catch {}
  }
  cover?.addEventListener('load', bindCover);
  bindCover();
  window.addEventListener('book-page-turn', () => {
    if (!enabled) return;
    start();
    turn.currentTime = 0;
    turn.play().catch(() => {});
  });
  // Delegation also covers labels created by later uploads or page renders.
  let lastHover = -Infinity;
  document.addEventListener('pointerover', event => {
    if (!enabled || music.paused || !preview || event.pointerType === 'touch' || document.body.classList.contains('windTurning')) return;
    const tag = event.target.closest?.('#canvas .item.tag');
    if (!tag || (event.relatedTarget && tag.contains(event.relatedTarget))) return;
    const now = performance.now();
    if (now - lastHover < 200) return;
    lastHover = now;
    hover.volume = Math.min(.10, music.volume * .25);
    hover.currentTime = 0;
    hover.play().catch(() => {});
  }, {passive:true});
  music.addEventListener('playing', sync);
  music.addEventListener('pause', sync);
  music.addEventListener('error', sync);
  window.bookAudio = {music, turn, hover};
  sync();
  start();
})();
