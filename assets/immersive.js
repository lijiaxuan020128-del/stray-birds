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
  function close(){
    panel.close();frame.src='about:blank';
    document.documentElement.style.overflow='';document.body.style.overflow='';
    if(typeof window.resetCatalogParticles==='function')window.resetCatalogParticles();
    else if(typeof window.resetHeronCatalogParticles==='function')window.resetHeronCatalogParticles();
    previousFocus?.focus();
  }
  panel.addEventListener('cancel',e=>{e.preventDefault();close()});
  function equalizeMappingGaps(doc){
    const cn=[...doc.querySelectorAll('.mapping-row .mapping-cn')];
    const en=[...doc.querySelectorAll('.mapping-row .mapping-en')];
    if(cn.length<3||en.length<3)return;
    [...cn,...en].forEach(el=>el.style.transform='');
    const cnLeft=cn[0].getBoundingClientRect(),enLeft=en[0].getBoundingClientRect();
    const cnRight=cn[2].getBoundingClientRect(),enRight=en[2].getBoundingClientRect();
    const leftTextEdge=Math.max(cnLeft.right,enLeft.right);
    const rightTextEdge=Math.min(cnRight.left,enRight.left);
    const targetAxis=(leftTextEdge+rightTextEdge)/2;
    const cnMiddle=cn[1].getBoundingClientRect();
    const enMiddle=en[1].getBoundingClientRect();
    cn[1].style.transform=`translateX(${targetAxis-(cnMiddle.left+cnMiddle.right)/2}px)`;
    en[1].style.transform=`translateX(${targetAxis-(enMiddle.left+enMiddle.right)/2}px)`;
  }
  frame.addEventListener('load',()=>{
    if(frame.src==='about:blank')return;
    try{
      const doc=frame.contentDocument;
      doc?.querySelectorAll('#full, #pageFullscreen, .effect-fullscreen').forEach(el=>el.remove());
      requestAnimationFrame(()=>equalizeMappingGaps(doc));
      setTimeout(()=>equalizeMappingGaps(doc),120);
      setTimeout(()=>equalizeMappingGaps(doc),420);
    }catch{}
  });
  window.addEventListener('resize',()=>{try{if(frame.contentDocument)equalizeMappingGaps(frame.contentDocument)}catch{}});
  window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||!e.data)return;if(e.data.type==='stray-birds-close')close()});
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

  const particleScript=document.createElement('script');
  particleScript.src='assets/heron-catalog-particles.js?v=20261027-adaptive2';
  document.head.append(particleScript);
})();