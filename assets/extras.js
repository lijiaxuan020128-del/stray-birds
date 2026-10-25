// 预览模式铺满窗口：画布按窗口宽度缩放（与原站行为一致）
(function(){
  'use strict';
  const prevResize=resize;
  resize=function(){
    if(preview){
      scale=window.innerWidth/1200;
      const f=$('#frame');
      f.style.width=window.innerWidth+'px';
      f.style.height=760*scale+'px';
      $('#canvas').style.transform='scale('+scale+')';
      return;
    }
    prevResize();
  };
  const prevRender=render;
  render=function(){
    prevRender();
    const t=theme();
    if(t&&t.dream){ document.body.style.background=(t.desk||'#27252e'); }
  };
  const st=document.createElement('style');
  const st=document.createElement('style');
  st.textContent='.preview .work{max-width:none!important;padding:0!important}html{overflow-x:hidden}';
  document.head.append(st);
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='mode')setTimeout(()=>resize(),60);});
  window.addEventListener('resize',()=>{if(document.body.classList.contains('preview'))resize();});
})();
