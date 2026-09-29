(()=>{
 'use strict';
 const endpoint=document.querySelector('script[data-integrations]')?.dataset.endpoint;
 if(!endpoint||location.hostname!=='dolozeno.cz')return;
 const started=Date.now();let sessionId='nosid',flushed=false,maxDepth=0;
 try{sessionId=sessionStorage.getItem('dz_sid')||Date.now().toString(36)+Math.random().toString(36).slice(2,8);sessionStorage.setItem('dz_sid',sessionId)}catch{}
 function track(type,extra={}){
  const body=JSON.stringify({type,page:location.pathname,sessionId,...extra});
  try{if(navigator.sendBeacon?.(endpoint,new Blob([body],{type:'text/plain;charset=UTF-8'})))return;
   fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body,keepalive:true}).catch(()=>{});
  }catch{}
 }
 track('pageview');
 const articleId=location.pathname.match(/^\/clanky\/([^/]+)\.html$/)?.[1];
 function depth(){const el=document.documentElement;return Math.min(100,Math.max(0,Math.round(scrollY/Math.max(1,el.scrollHeight-innerHeight)*100)))}
 if(articleId){track('article',{articleId});addEventListener('scroll',()=>{maxDepth=Math.max(maxDepth,depth())},{passive:true})}
 function flush(){if(flushed)return;flushed=true;const seconds=Math.round((Date.now()-started)/1000);if(articleId)track('read',{articleId,maxDepth:Math.max(maxDepth,depth()),closedAt:depth(),seconds});track('time',{duration:seconds})}
 addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
})();
