(() => {
  const panel = document.createElement('dialog');
  panel.setAttribute('aria-label', '飞鸟集沉浸展示');
  panel.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#27252e;overflow:hidden';
  const frame = document.createElement('iframe');
  frame.title = '鸟类动态效果'; frame.style.cssText = 'display:block;width:100%;height:100%;border:0';
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
  function close(){panel.close();frame.src='about:blank';document.documentElement.style.overflow='';document.body.style.overflow='';previousFocus?.focus()}
  panel.addEventListener('cancel',e=>{e.preventDefault();close()});
  function equalizeMappingGaps(doc){
    const labels=[...doc.querySelectorAll('.mapping-row .mapping-cn')];
    if(labels.length<3)return;
    labels.forEach(el=>el.style.transform='');
    const first=labels[0].getBoundingClientRect();
    const middle=labels[1].getBoundingClientRect();
    const last=labels[2].getBoundingClientRect();
    const targetCenter=(first.right+last.left)/2;
    const currentCenter=(middle.left+middle.right)/2;
    labels[1].style.transform=`translateX(${targetCenter-currentCenter}px)`;
    const english=[...doc.querySelectorAll('.mapping-row .mapping-en')];
    if(english.length>=3){
      english.forEach(el=>el.style.transform='');
      const a=english[0].getBoundingClientRect(),b=english[1].getBoundingClientRect(),c=english[2].getBoundingClientRect();
      const target=(a.right+c.left)/2;
      const current=(b.left+b.right)/2;
      english[1].style.transform=`translateX(${target-current}px)`;
    }
  }
  frame.addEventListener('load',()=>{
    if(frame.src==='about:blank')return;
    try{
      const doc=frame.contentDocument;
      doc?.querySelectorAll('#full, #pageFullscreen, .effect-fullscreen').forEach(el=>el.remove());
      if(frame.src.includes('/birds/view/')){
        requestAnimationFrame(()=>equalizeMappingGaps(doc));
        setTimeout(()=>equalizeMappingGaps(doc),120);
      }
    }catch{}
  });
  window.addEventListener('resize',()=>{
    try{if(frame.src.includes('/birds/view/')&&frame.contentDocument)equalizeMappingGaps(frame.contentDocument)}catch{}
  });
  window.addEventListener('message',e=>{
    if(e.source!==frame.contentWindow||!e.data)return;
    if(e.data.type==='stray-birds-close')close();
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