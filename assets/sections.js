(() => {
  const defaults = [{id:'index',name:'目录'},{id:'species',name:'鸟类'},{id:'about',name:'关于飞鸟集'}];
  const sections = () => Array.isArray(book.sections) ? book.sections : defaults;
  const belongs = p => p.sectionId === undefined ? 'index' : p.sectionId;
  const nav = document.createElement('nav');
  nav.className = 'sectionNav'; nav.setAttribute('aria-label','栏目导航');
  document.body.append(nav);
  const settings = document.createElement('details');
  settings.className='stylePanel';
  settings.innerHTML='<summary>栏目 · 页面归属 · 背景粒子</summary><div></div>';
  document.querySelector('.right').append(settings);
  const root=settings.querySelector('div');
  const particles=document.createElement('canvas');
  particles.className='ambientParticles';
  particles.setAttribute('aria-hidden','true');
  const ctx=particles.getContext('2d');
  let points=[],last=0;
  function commit(){changed();render();}
  function button(parent,text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;parent.append(b);return b;}
  const priorRender=render;
  render=function(){
    priorRender();
    const t=theme();
    document.querySelector('#canvas').prepend(particles);
    nav.style.color=t.ink;nav.style.background=t.paper;
    nav.style.borderColor=t.muted;
    nav.replaceChildren();
    sections().forEach(s=>{
      const b=button(nav,s.name,()=>{
        const dest=book.pages.findIndex(p=>belongs(p)===s.id);
        if(dest<0){toast('这个栏目还没有页面，请先设置页面归属');return;}
        go(dest);
      });
      if(belongs(page())===s.id){b.classList.add('current');b.setAttribute('aria-current','page');}
    });
    root.replaceChildren();
    const label=document.createElement('label');label.className='field';label.textContent='本页所属栏目';
    const select=document.createElement('select');select.add(new Option('不归属',''));
    sections().forEach(s=>select.add(new Option(s.name,s.id)));
    select.value=belongs(page());select.onchange=()=>{page().sectionId=select.value;commit();};
    label.append(select);root.append(label);
    const hint=document.createElement('p');hint.className='hint';hint.textContent='底部栏目跳到该栏目第一张目录页；上一页 / 下一页仍按整本目录顺序翻页。';root.append(hint);
    sections().forEach(s=>{
      const row=document.createElement('div');row.className='sectionSetting';root.append(row);
      field(row,'栏目名称',s.name,'text',value=>{if(!value.trim()){render();return;}book.sections=sections().map(x=>x.id===s.id?{...x,name:value.trim()}:x);commit();});
      button(row,'删除',()=>{book.sections=sections().filter(x=>x.id!==s.id);book.pages.forEach(p=>{if(belongs(p)===s.id)p.sectionId='';});commit();});
    });
    button(root,'＋ 新增栏目',()=>{book.sections=[...sections(),{id:uid(),name:'新栏目'}];commit();}).className='wide';
    button(root,book.particles?.enabled===false?'开启背景粒子':'关闭背景粒子',()=>{book.particles={...book.particles,enabled:book.particles?.enabled===false};commit();}).className='wide';
    const input=field(root,'粒子速度（0.2–3）',book.particles?.speed??1,'number',v=>{book.particles={...book.particles,speed:Math.max(.2,Math.min(3,Number(v)||1))};commit();});input.min='.2';input.max='3';input.step='.1';
  };
  particles.width=1200;particles.height=760;
  for(let i=0;i<36;i++)points.push({x:Math.random()*1200,y:Math.random()*760,r:.5+Math.random()*1.4,s:7+Math.random()*18,phase:Math.random()*6.28});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function tick(now){
    const dt=Math.min((now-last)/1000,.05);last=now;
    ctx.clearRect(0,0,1200,760);
    if(book.particles?.enabled!==false){
      const speed=book.particles?.speed??1;
      ctx.fillStyle=theme().ink;
      points.forEach(p=>{
        if(!reduced.matches&&!document.hidden&&!document.querySelector('dialog[open]')){p.y-=p.s*dt*speed;p.x+=Math.sin(now/2600+p.phase)*8*dt*speed;}
        if(p.y<-4){p.y=764;p.x=Math.random()*1200;}if(p.x<-4)p.x=1204;if(p.x>1204)p.x=-4;
        ctx.globalAlpha=.17+.12*Math.sin((reduced.matches?0:now/1200)+p.phase);
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      });ctx.globalAlpha=1;
    }
    requestAnimationFrame(tick);
  }
  render();requestAnimationFrame(tick);
})();
