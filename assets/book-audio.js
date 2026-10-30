/* Persistent, session-only audio; page rendering never recreates these players. */
(() => {
  'use strict';
  const header = document.querySelector('.bookIdentityFrame');
  if (!header || window.bookAudio) return;

  const music = new Audio('assets/audio/piano.mp3');
  const turn = new Audio('assets/audio/page-turn.mp3');
  const hover = new Audio('assets/audio/bird-hover.mp3');
  const wing = new Audio('assets/audio/wing-flap.mp3');
  music.loop = true;
  music.volume = .45;
  music.preload = 'auto';
  turn.volume = .65;
  turn.preload = 'auto';
  hover.volume = .10;
  hover.preload = 'auto';
  wing.volume = .34;
  wing.preload = 'auto';
  wing.loop = true;
  music.id = 'bookBackgroundMusic';
  turn.id = 'bookPageTurnSound';
  hover.id = 'bookBirdHoverSound';
  wing.id = 'bookBirdEntrySound';
  music.hidden = turn.hidden = hover.hidden = wing.hidden = true;
  document.body.append(music, turn, hover, wing);

  let musicEnabled = true;
  let effectsEnabled = true;
  let wingWanted = false;

  const controls = document.createElement('div');
  controls.className = 'bookAudioControls';
  controls.style.cssText = 'position:absolute;right:48px;top:16px;display:flex;gap:8px;align-items:center;pointer-events:auto';

  function makeButton(className) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.style.cssText = 'min-height:36px;padding:7px 11px;border:1px solid currentColor;border-radius:20px;background:transparent;color:inherit;font:11px/18px Arial,"Microsoft Yahei",sans-serif;letter-spacing:1px;cursor:pointer;pointer-events:auto';
    controls.append(b);
    return b;
  }

  const musicButton = makeButton('bookMusicToggle');
  const effectsButton = makeButton('bookEffectsToggle');
  header.append(controls);

  function sync() {
    const musicPending = musicEnabled && music.paused;
    musicButton.textContent = musicEnabled ? (musicPending ? '♫ 开启音乐' : '♫ 背景音乐') : '♫ 音乐已关闭';
    musicButton.setAttribute('aria-label', musicEnabled && !musicPending ? '关闭背景音乐' : '开启背景音乐');
    musicButton.setAttribute('aria-pressed', String(musicEnabled && !musicPending));
    musicButton.title = musicPending ? '点击开启钢琴背景音乐' : musicButton.getAttribute('aria-label');

    effectsButton.textContent = effectsEnabled ? '♪ 音效' : '♪ 音效已关闭';
    effectsButton.setAttribute('aria-label', effectsEnabled ? '关闭音效' : '开启音效');
    effectsButton.setAttribute('aria-pressed', String(effectsEnabled));
    effectsButton.title = effectsEnabled ? '关闭翻页、标签触碰、进入效果页和鸟鸣等音效' : '开启翻页、标签触碰、进入效果页和鸟鸣等音效';
  }

  function startMusic() {
    if (!musicEnabled || !music.paused) return;
    music.play().then(sync).catch(sync);
  }

  function startWing() {
    wingWanted = true;
    if (!effectsEnabled) return;
    try { wing.currentTime = 0; } catch {}
    wing.play().catch(() => {});
  }

  function stopWing() {
    wingWanted = false;
    wing.pause();
    try { wing.currentTime = 0; } catch {}
  }

  function unlock(event) {
    if (event.target.closest?.('.bookAudioControls')) return;
    startMusic();
  }

  musicButton.addEventListener('click', () => {
    if (musicEnabled && !music.paused) {
      musicEnabled = false;
      music.pause();
    } else {
      musicEnabled = true;
      startMusic();
    }
    sync();
  });

  effectsButton.addEventListener('click', () => {
    effectsEnabled = !effectsEnabled;
    if (!effectsEnabled) {
      turn.pause();
      turn.currentTime = 0;
      hover.pause();
      hover.currentTime = 0;
      wing.pause();
      wing.currentTime = 0;
    } else if (wingWanted) {
      try { wing.currentTime = 0; } catch {}
      wing.play().catch(() => {});
    }
    sync();
    window.dispatchEvent(new CustomEvent('book-effects-toggle', {detail:{enabled:effectsEnabled}}));
  });

  function bind(doc) {
    ['pointerdown','click','keydown','wheel','touchend'].forEach(type => doc.addEventListener(type, unlock, {capture:true,passive:true}));
  }
  bind(document);

  const cover = document.querySelector('#coverSurface');
  const bound = new WeakSet();
  function bindCover() {
    try {
      const doc = cover?.contentDocument;
      if (doc && !bound.has(doc)) { bound.add(doc); bind(doc); }
    } catch {}
  }
  cover?.addEventListener('load', bindCover);
  bindCover();

  window.addEventListener('book-page-turn', () => {
    if (!effectsEnabled) return;
    turn.currentTime = 0;
    turn.play().catch(() => {});
  });

  let lastHover = -Infinity;
  document.addEventListener('pointerover', event => {
    if (!effectsEnabled || !preview || event.pointerType === 'touch' || document.body.classList.contains('windTurning')) return;
    const tag = event.target.closest?.('#canvas .item.tag');
    if (!tag || (event.relatedTarget && tag.contains(event.relatedTarget))) return;
    const now = performance.now();
    if (now - lastHover < 200) return;
    lastHover = now;
    hover.volume = .10;
    hover.currentTime = 0;
    hover.play().catch(() => {});
  }, {passive:true});

  music.addEventListener('playing', sync);
  music.addEventListener('pause', sync);
  music.addEventListener('error', sync);

  window.bookAudio = {
    music,
    turn,
    hover,
    wing,
    isMusicEnabled: () => musicEnabled,
    isEffectsEnabled: () => effectsEnabled,
    startBirdEntrySound: startWing,
    stopBirdEntrySound: stopWing,
    playEffect(audio) {
      if (!effectsEnabled || !audio) return Promise.resolve(false);
      try { audio.currentTime = 0; } catch {}
      return audio.play().then(() => true).catch(() => false);
    }
  };

  sync();
  startMusic();
})();
