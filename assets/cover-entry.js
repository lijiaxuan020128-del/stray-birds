(() => {
 const url=new URL(location.href);
 if(url.searchParams.get('catalog')!=='1'){
   // 首次无参数打开 = 读者模式：原地切换成正式链接，不做整页重定向（避免工作台闪现数秒）。
   const params=new URLSearchParams(url.search);
   params.set('catalog','1');params.set('read','1');
   const merged=new URL(url);merged.search=params.toString();merged.hash=url.hash;
   try{history.replaceState(null,'',merged.href)}catch{}
   window.READ_MODE=true;
   document.documentElement.classList.add('readMode');
 }
 if(url.searchParams.get('read')==='1'){window.READ_MODE=true;document.documentElement.classList.add('readMode');}
 async function start(){
   for(const path of ['assets/flock.js?v=3','assets/cover-workbench.js?v=9','assets/book-header.js?v=header1','assets/page-motion.js?v=audio1','assets/book-audio.js?v=audio4'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=reject;document.body.append(script);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
