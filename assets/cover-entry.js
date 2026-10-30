(() => {
 const url=new URL(location.href);
 if(url.searchParams.get('catalog')!=='1'){
   // 根链接 = 读者模式：直接进入整本书（封面开头），没有编辑入口。
   const params=new URLSearchParams(url.search);
   params.set('catalog','1');params.set('read','1');
   const target=new URL('index.html',url);target.search=params.toString();target.hash=url.hash;
   location.replace(target.href);return;
 }
 if(url.searchParams.get('read')==='1'){window.READ_MODE=true;document.documentElement.classList.add('readMode');}
 async function start(){
   for(const path of ['assets/flock.js?v=3','assets/cover-workbench.js?v=8','assets/book-header.js?v=header1','assets/page-motion.js?v=audio1','assets/book-audio.js?v=audio4'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=reject;document.body.append(script);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
