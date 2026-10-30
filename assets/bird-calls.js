/* Shared bird-call controls for all observation pages. */
(() => {
  'use strict';
  const heading = document.querySelector('.species-head h1');
  if (!heading || window.birdCallPlayer) return;
  const name = document.getElementById('cn')?.textContent.trim() || '苍鹭';
  const recordings = {
    '苍鹭':'XC531166', '太平鸟':'XC1168801', '白鹡鸰':'XC1174980',
    '红隼':'XC1178672', '麻雀':'XC1184687', '鸿雁':'XC575152',
    '针尾沙锥':'XC840942', '大斑啄木鸟':'XC979809', '戴胜':'XC1029700',
    '斑头雁':'XC1046635', '普通翠鸟':'XC1052485', '珠颈斑鸠':'XC1054704',
    '小䴙䴘':'XC1101785', '黑水鸡':'XC1152369', '普通雨燕':'XC1172263',
    '普通楼燕':'XC1172263', '家燕':'XC1166650'
  };
  const button = document.getElementById('heronCall') || document.createElement('button');
  button.id = 'heronCall';
  button.type = 'button';
  heading.append(button);
  const style = document.createElement('style');
  style.textContent = `#heronCall{position:static;display:inline-block;vertical-align:middle;flex-shrink:0;margin-left:14px;padding:5px 9px;border:1px solid rgba(244,239,220,.25);background:transparent;color:rgb(244,239,220);font:9px Arial,"Microsoft Yahei",sans-serif;letter-spacing:1px;opacity:.62;cursor:pointer;transform:translateY(-1px);transition:.18s ease}#heronCall:hover:not(:disabled){opacity:.95;background:rgba(244,239,220,.07);border-color:rgba(244,239,220,.42)}#heronCall:disabled{cursor:default} `;
  document.head.append(style);
  if (name === '震旦鸦雀' || !recordings[name]) {
    button.textContent = name === '震旦鸦雀' ? '出于保护目的暂不展示鸟鸣' : '鸟鸣暂未提供';
    button.disabled = true;
    button.setAttribute('aria-label', button.textContent);
    button.title = button.textContent;
    return;
  }
  const call = new Audio(new URL('audio/calls/' + recordings[name] + '.mp3', document.currentScript.src).href);
  call.preload = 'metadata';
  call.volume = .72;
  // 鸟鸣音量跟随主页面「音效音量」面板的设置（localStorage + 实时事件）。
  try {
    const saved = JSON.parse(localStorage.getItem('stray-birds-audio-v1') || '{}');
    const n = Number(saved.call);
    if (Number.isFinite(n)) call.volume = Math.min(1, Math.max(0, n));
  } catch {}
  try {
    parent.addEventListener('book-audio-volumes', e => {
      const v = Number(e.detail?.call);
      if (Number.isFinite(v)) call.volume = Math.min(1, Math.max(0, v));
    });
  } catch {}
  call.loop = false;
  let timer = null, generation = 0;
  function parentAudio() {
    try { return parent !== window ? parent.bookAudio : null; } catch { return null; }
  }
  function stop() {
    generation++;
    clearTimeout(timer);
    timer = null;
    call.pause();
    try { call.currentTime = 0; } catch {}
    button.textContent = '♪ 鸟鸣';
    button.setAttribute('aria-label', '播放' + name + '叫声');
    button.title = '播放' + name + '叫声（最多20秒）';
  }
  button.addEventListener('click', () => {
    stop();
    if (parentAudio()?.isEffectsEnabled?.() === false) return;
    const ticket = generation;
    call.play().then(() => {
      if (ticket !== generation) return;
      button.textContent = '♪ 再次播放';
      button.setAttribute('aria-label', '从头播放' + name + '叫声');
      timer = setTimeout(stop, 20000);
    }).catch(() => { if (ticket === generation) stop(); });
  });
  call.addEventListener('timeupdate', () => { if (call.currentTime >= 20) stop(); });
  call.addEventListener('ended', stop);
  call.addEventListener('error', stop);
  window.addEventListener('pagehide', stop);
  window.addEventListener('beforeunload', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  document.getElementById('back')?.addEventListener('click', stop);
  document.getElementById('backToCatalog')?.addEventListener('click', stop);
  try { parent.addEventListener('book-effects-toggle', e => { if (e.detail?.enabled === false) stop(); }); } catch {}
  window.birdCallPlayer = {call, stop};
  window.stopHeronCall = stop;
  stop();
})();
