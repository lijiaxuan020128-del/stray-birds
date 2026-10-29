(() => {
 const url=new URL(location.href);
 if(url.searchParams.get('catalog')!=='1'){
   const target=new URL('cover.html',url);target.search=url.search;target.hash=url.hash;
   location.replace(target.href);return;
 }
 async function start(){
   for(const path of ['assets/flock.js?v=3','assets/cover-workbench.js?v=6','assets/book-header.js?v=header1','assets/page-motion.js?v=wind1'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=reject;document.body.append(script);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
