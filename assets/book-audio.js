/* Persistent, session-only audio; page rendering never recreates these players. */
(() => {
  'use strict';
  const header = document.querySelector('.bookIdentityFrame');
  if (!header || window.bookAudio) return;

  const VOLUME_KEY = 'stray-birds-audio-v1';
  const defaultVolumes = {music: .45, turn: .65, hover: .10, wing: .8, call: .72};
  let volumes = {...defaultVolumes};
  try { Object.assign(volumes, JSON.parse(localStorage.getItem(VOLUME_KEY) || '{}')); } catch {}
  for (const k of Object.keys(defaultVolumes)) {
    const n = Number(volumes[k]);
    volumes[k] = Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : defaultVolumes[k];
  }

  const music = new Audio('assets/audio/piano.mp3');
  const turn = new Audio('assets/audio/page-turn.mp3');
  const hover = new Audio('assets/audio/bird-hover.mp3');
  const wing = new Audio('assets/audio/wing-flap.mp3');
  music.loop = true;
  music.volume = volumes.music;
  music.preload = 'auto';
  turn.volume = volumes.turn;
  turn.preload = 'auto';
  hover.volume = volumes.hover;
  hover.preload = 'auto';
  wing.volume = volumes.wing;
  wing.preload = 'auto';
  wing.loop = false;
  music.id = 'bookBackgroundMusic';
  turn.id = 'bookPageTurnSound';
  hover.id = 'bookBirdHoverSound';
  wing.id = 'bookBirdEntrySound';
  music.hidden = turn.hidden = hover.hidden = wing.hidden = true;
  document.body.append(music, turn, hover, wing);

  let musicEnabled = true;
  let effectsEnabled = true;

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
    if (!effectsEnabled) return;
    wing.pause();
    try { wing.currentTime = 0; } catch {}
    wing.play().catch(() => {});
  }

  function stopWing() {
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
      stopWing();
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
    hover.volume = volumes.hover;
    hover.currentTime = 0;
    hover.play().catch(() => {});
  }, {passive:true});

  music.addEventListener('playing', sync);
  music.addEventListener('pause', sync);
  music.addEventListener('error', sync);

  function setVolumes(partial) {
    for (const [k, v] of Object.entries(partial || {})) {
      if (!(k in defaultVolumes)) continue;
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      volumes[k] = Math.min(1, Math.max(0, n));
    }
    music.volume = volumes.music;
    turn.volume = volumes.turn;
    hover.volume = volumes.hover;
    wing.volume = volumes.wing;
    try { localStorage.setItem(VOLUME_KEY, JSON.stringify(volumes)); } catch {}
    window.dispatchEvent(new CustomEvent('book-audio-volumes', {detail: {...volumes}}));
    return {...volumes};
  }

  window.bookAudio = {
    music,
    turn,
    hover,
    wing,
    isMusicEnabled: () => musicEnabled,
    isEffectsEnabled: () => effectsEnabled,
    startBirdEntrySound: startWing,
    stopBirdEntrySound: stopWing,
    getVolumes: () => ({...volumes}),
    setVolumes,
    resetVolumes: () => setVolumes(defaultVolumes),
    playEffect(audio) {
      if (!effectsEnabled || !audio) return Promise.resolve(false);
      try { audio.currentTime = 0; } catch {}
      return audio.play().then(() => true).catch(() => false);
    }
  };

  // 编辑面板：音效音量滑杆。仅编辑工作台有 .right 侧栏；预览/发布页不显示。
  (function volumePanel() {
    const right = document.querySelector('.right');
    if (!right) return;
    const details = document.createElement('details');
    details.className = 'stylePanel';
    details.innerHTML = '<summary>音效音量 · 音乐 / 翻页 / 悬停 / 振翅 / 鸟鸣</summary><div></div>';
    right.append(details);
    const root = details.querySelector('div');
    const note = document.createElement('p');
    note.className = 'hint';
    note.textContent = '音量保存在此浏览器，对全书预览、效果页振翅声与鸟鸣同时生效。';
    root.append(note);
    const labels = {music: '背景钢琴音乐', turn: '翻页声', hover: '悬停页码条', wing: '点击鸟类振翅', call: '鸟鸣播放（观察页）'};
    const ranges = {}, outs = {};
    function paint(key, value) {
      if (ranges[key]) ranges[key].value = value;
      if (outs[key]) outs[key].textContent = Math.round(value * 100) / 100;
    }
    for (const key of Object.keys(labels)) {
      const lab = document.createElement('label');
      lab.className = 'field';
      lab.textContent = labels[key];
      const out = document.createElement('output');
      out.style.cssText = 'float:right;opacity:.7';
      const range = document.createElement('input');
      range.type = 'range';
      range.min = '0'; range.max = '1'; range.step = '0.01';
      ranges[key] = range; outs[key] = out;
      paint(key, volumes[key]);
      range.oninput = () => { const v = setVolumes({[key]: range.value}); paint(key, v[key]); };
      lab.append(out, range);
      root.append(lab);
    }
    window.addEventListener('book-audio-volumes', e => {
      for (const key of Object.keys(labels)) paint(key, e.detail?.[key] ?? volumes[key]);
    });
    const reset = document.createElement('button');
    reset.className = 'wide';
    reset.textContent = '恢复默认音量';
    reset.onclick = () => setVolumes(defaultVolumes);
    root.append(reset);
  })();

  sync();
  startMusic();
})();
