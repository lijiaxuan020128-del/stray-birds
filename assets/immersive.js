(() => {
  const panel = document.createElement('dialog');
  panel.setAttribute('aria-label', '飞鸟集沉浸展示');
  panel.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#27252e;overflow:hidden';
  const frame = document.createElement('iframe');
  frame.title = '鸟类动态效果'; frame.allow = 'fullscreen'; frame.style.cssText = 'display:block;width:100%;height:100%;border:0';
  panel.append(frame); document.body.append(panel);
  const localBirdPages = [
    ['苍鹭', 'birds/heron/?v=20261026-1938'],
    ['麻雀','birds/view/?bird=麻雀'],
    ['普通翠鸟','birds/view/?bird=普通翠鸟'],
    ['普通雨燕','birds/view/?bird=普通雨燕'],
    ['太平鸟','birds/view/?bird=太平鸟'],
    ['小䴙䴘','birds/view/?bird=小䴙䴘'],
    ['针尾沙锥','birds/view/?bird=针尾沙锥'],
    ['震旦鸦雀','birds/view/?bird=震旦鸦雀'],
    ['珠颈斑鸠','birds/view/?bird=珠颈斑鸠'],
    ['红隼','birds/view/?bird=红隼'],
    ['白鹡鸰','birds/view/?bird=白鹡鸰'],
    ['斑头雁','birds/view/?bird=斑头雁'],
    ['大斑啄木鸟','birds/view/?bird=大斑啄木鸟'],
    ['戴胜','birds/view/?bird=戴胜'],
    ['黑水鸡','birds/view/?bird=黑水鸡'],
    ['鸿雁','birds/view/?bird=鸿雁'],
    ['家燕','birds/view/?bird=家燕']
  ];
  let previousFocus;

  async function close(){
    if(document.fullscreenElement===panel)await document.exitFullscreen().catch(()=>{});
    panel.close();frame.src='about:blank';document.documentElement.style.overflow='';document.body.style.overflow='';previousFocus?.focus();
  }

  async function togglePanelFullscreen(){
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await panel.requestFullscreen();
    }catch{
      toast('此浏览器暂不支持全屏，仍可在窗口内观看');
    }
  }

  panel.addEventListener('cancel',e=>{e.preventDefault();close()});

  // 全屏必须直接发生在用户点击事件中。若先通过 postMessage 再请求，
  // 浏览器会丢失 user activation，因此按钮看起来会“没有反应”。
  // 详情页与目录同源，所以在 iframe 加载后直接接管其全屏按钮。
  frame.addEventListener('load',()=>{
    if(frame.src==='about:blank')return;
    try{
      const doc=frame.contentDocument;
      const full=doc&&doc.querySelector('#full, #pageFullscreen');
      if(!full||full.dataset.catalogFullscreenBound)return;
      full.dataset.catalogFullscreenBound='1';
      full.addEventListener('click',e=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        togglePanelFullscreen();
      },true);
    }catch{}
  });

  window.addEventListener('message',async e=>{
    if(e.source!==frame.contentWindow||!e.data)return;
    if(e.data.type==='stray-birds-close')close();
    // 保留兼容旧页面；新页面的点击由上面的同源 click 监听直接处理。
    if(e.data.type==='stray-birds-fullscreen')togglePanelFullscreen();
  });

  function open(url){
    if(panel.open)return;
    const target=new URL(url,location.href);
    if(!['http:','https:'].includes(target.protocol)){toast('效果链接格式不正确');return}
    if(target.hostname==='editor.p5js.org'){toast('请填写独立效果页面地址；p5.js 分享链接仍会显示分享界面');return}
    previousFocus=document.activeElement;frame.src=target.href;panel.showModal();
  }
  function builtInEffect(name){const item=localBirdPages.find(([birdName])=>name.includes(birdName));return item?item[1]:''}
  const originalActivate=activate;
  activate=function(b,part){if(!preview)return originalActivate(b,part);const builtIn=builtInEffect(b.name);if(builtIn)return open(builtIn);if(b.url)return open(b.url);toast('这只鸟的效果链接还没有填写')};
})();