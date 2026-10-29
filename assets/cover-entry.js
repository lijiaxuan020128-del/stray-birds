(() => {
 const url=new URL(location.href);
 if(url.searchParams.get('catalog')!=='1'){
   const target=new URL(url);target.searchParams.set('catalog','1');
   location.replace(target.href);return;
 }
 async function start(){
   for(const path of ['assets/flock.js?v=3','assets/cover-workbench.js?v=6','assets/book-header.js?v=header1','assets/page-motion.js?v=audio1','assets/book-audio.js?v=audio1'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=reject;document.body.append(script);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
