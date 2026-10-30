(() => {
  const panel=document.createElement('dialog');panel.setAttribute('aria-label','飞鸟集沉浸展示');panel.style.cssText='position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#27252e;overflow:hidden';
  const frame=document.createElement('iframe');frame.title='鸟类动态效果';frame.style.cssText='display:block;width:100%;height:100%;border:0;visibility:hidden';panel.append(frame);
  const loader=document.createElement('div');loader.style.cssText='position:absolute;inset:0;display:none;place-items:center;background:#27252e;z-index:2;pointer-events:none';const lc=document.createElement('canvas');lc.width=260;lc.height=150;lc.style.cssText='width:260px;height:150px';loader.append(lc);panel.append(loader);document.body.append(panel);
  const pages=[['苍鹭','birds/heron/?v=20261029-heroncall4'],['麻雀','birds/view/?bird=麻雀'],['普通翠鸟','birds/view/?bird=普通翠鸟'],['普通雨燕','birds/view/?bird=普通雨燕'],['太平鸟','birds/view/?bird=太平鸟'],['小䴙䴘','birds/view/?bird=小䴙䴘'],['针尾沙锥','birds/view/?bird=针尾沙锥'],['震旦鸦雀','birds/view/?bird=震旦鸦雀'],['珠颈斑鸠','birds/view/?bird=珠颈斑鸠'],['红隼','birds/view/?bird=红隼'],['白鹡鸰','birds/view/?bird=白鹡鸰'],['斑头雁','birds/view/?bird=斑头雁'],['大斑啄木鸟','birds/view/?bird=大斑啄木鸟'],['戴胜','birds/view/?bird=戴胜'],['黑水鸡','birds/view/?bird=黑水鸡'],['鸿雁','birds/view/?bird=鸿雁'],['家燕','birds/view/?bird=家燕']];
  const colors={'苍鹭':['#838b95','#e5ebf1'],'麻雀':['#9D4B3D','#e5c7a4'],'普通翠鸟':['#38c9cc','#99dbc2'],'普通雨燕':['#26353D','#B8C4C7'],'太平鸟':['#A58D73','#fbbb32'],'小䴙䴘':['#795548','#5f1707'],'针尾沙锥':['#796044','#E1CAA1'],'震旦鸦雀':['#f3bc44','#9a5b28'],'珠颈斑鸠':['#A58D8C','#514945'],'红隼':['#B87652','#332724'],'白鹡鸰':['#E4E6E3','#303331'],'斑头雁':['#D5D2C8','#343536'],'大斑啄木鸟':['#B8322A','#52231F'],'戴胜':['#D98232','#5A351D'],'黑水鸡':['#541c2d','#282424'],'鸿雁':['#89674F','#cab69b'],'家燕':['#263E47','#e45b21']};
  const categoryEn={'鸣禽':'PASSERINE','攀禽':'CLIMBING BIRD','游禽':'WATERFOWL','涉禽':'WADING BIRD','陆禽':'TERRESTRIAL BIRD','猛禽':'RAPTOR'};
  let previousFocus,loadRaf=0,loadPts=[];
  function startLoader(n){loader.style.display='grid';const col=colors[n]||['#d8d3c9','#8f899d'];loadPts=Array.from({length:18},(_,i)=>({x:35+(i%6)*34+Math.random()*10,y:48+((i/6)|0)*24+Math.random()*10,p:Math.random()*6.28,s:.6+Math.random()*.7}));const x=lc.getContext('2d');let t=0;cancelAnimationFrame(loadRaf);const loop=()=>{t+=.035;x.clearRect(0,0,260,150);x.fillStyle=col[0];x.strokeStyle=col[1];x.lineWidth=1.2;for(const p of loadPts){p.x+=p.s;p.y+=Math.sin(t*2+p.p)*.35;if(p.x>235)p.x=24;x.beginPath();x.arc(p.x,p.y,4.2,0,6.283);x.fill();x.stroke()}x.fillStyle='rgba(244,239,220,.7)';x.font='12px sans-serif';x.textAlign='center';x.fillText((n||'鸟类')+' · LOADING',130,128);loadRaf=requestAnimationFrame(loop)};loop()}
  function stopLoader(){loader.style.display='none';cancelAnimationFrame(loadRaf);loadRaf=0}
  function close(){panel.close();frame.src='about:blank';frame.style.visibility='hidden';stopLoader();document.documentElement.style.overflow='';document.body.style.overflow='';if(typeof window.resetCatalogParticles==='function')window.resetCatalogParticles();previousFocus?.focus()}panel.addEventListener('cancel',e=>{e.preventDefault();close()});
  function styleHeading(doc){
    if(!doc)return;
    const eyebrow=doc.querySelector('.species-head .eyebrow');
    if(eyebrow){let cn=(eyebrow.textContent||'').replace(/FIELD NOTES\s*[·｜|/-]?\s*/i,'').trim();if(!cn&&frame.dataset.bird==='苍鹭')cn='涉禽';const en=categoryEn[cn]||'';eyebrow.textContent=en?`${cn} · ${en}`:cn;eyebrow.style.letterSpacing='2px'}
    const h1=doc.querySelector('.species-head h1');
    if(!h1)return;
    let cnEl=h1.querySelector('#cn');let enEl=h1.querySelector('#en');
    if(!cnEl||!enEl){const spans=[...h1.querySelectorAll(':scope > span')];if(spans.length){enEl=spans[0]}}
    const style=doc.createElement('style');style.textContent=`
      .species-head h1{display:flex!important;align-items:baseline!important;gap:0!important;letter-spacing:0!important;white-space:nowrap}
      .species-head h1 #cn{margin:0!important;font-size:27px!important;letter-spacing:3px!important;opacity:1!important}
      .species-head h1 #en,.species-head h1>span:not(#cn){margin-left:9px!important;font-size:25px!important;letter-spacing:.6px!important;opacity:.78!important}
      .species-head h1 #en::before,.species-head h1>span:not(#cn)::before{content:"/";display:inline-block;margin-right:9px;font-size:18px;opacity:.38;transform:translateY(-1px)}
      .species-head .eyebrow{margin-bottom:8px!important;font-size:9px!important;letter-spacing:2px!important;opacity:.46!important}
      #heronCall{margin-left:14px!important}
    `;doc.head.append(style);
  }
  function align(doc){const cn=[...doc.querySelectorAll('.mapping-row .mapping-cn')],en=[...doc.querySelectorAll('.mapping-row .mapping-en')];if(cn.length<3||en.length<3)return false;[...cn,...en].forEach(e=>e.style.transform='');const a=cn[0].getBoundingClientRect(),b=en[0].getBoundingClientRect(),c=cn[2].getBoundingClientRect(),d=en[2].getBoundingClientRect(),axis=(Math.max(a.right,b.right)+Math.min(c.left,d.left))/2;for(const e of [cn[1],en[1]]){const r=e.getBoundingClientRect();e.style.transform=`translateX(${axis-(r.left+r.right)/2}px)`}return true}
  frame.addEventListener('load',()=>{if(frame.src==='about:blank')return;try{const doc=frame.contentDocument;doc?.querySelectorAll('#full,#pageFullscreen,.effect-fullscreen').forEach(e=>e.remove());styleHeading(doc);const reveal=()=>{styleHeading(doc);align(doc);frame.style.visibility='visible';stopLoader()};align(doc);if(doc?.fonts?.ready)doc.fonts.ready.then(()=>requestAnimationFrame(reveal));else requestAnimationFrame(reveal)}catch{frame.style.visibility='visible';stopLoader()}});
  window.addEventListener('resize',()=>{try{if(frame.contentDocument)align(frame.contentDocument)}catch{}});window.addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data?.type==='stray-birds-close')close()});
  function open(url,n){if(panel.open)return;const target=new URL(url,location.href);if(!['http:','https:'].includes(target.protocol)){toast('效果链接格式不正确');return}previousFocus=document.activeElement;frame.dataset.bird=n||'';frame.style.visibility='hidden';startLoader(n);window.bookAudio?.startBirdEntrySound?.();frame.src=target.href;panel.showModal()}
  function builtIn(n){const x=pages.find(([k])=>n.includes(k));return x?x[1]:''}const originalActivate=activate;activate=function(b,part){if(!preview)return originalActivate(b,part);const u=builtIn(b.name);if(u)return open(u,b.name);if(b.url)return open(b.url,b.name);toast('这只鸟的效果链接还没有填写')};
  const s=document.createElement('script');s.src='assets/heron-catalog-particles.js?v=20261027-continuous8';document.head.append(s);
})();
