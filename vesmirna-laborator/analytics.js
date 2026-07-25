/*  VESMÍRNÁ LABORATOŘ — anonymní měření (bez cookies)
 *  Posílá události do Apps Scriptu (Google Sheet). Dokud není vyplněná
 *  adresa ENDPOINT, nic se neposílá (bezpečné nasadit i "naprázdno").
 *
 *  Stránka si před načtením tohoto souboru nastaví:
 *     window.LAB_PAGE = 'hub'   (rozcestník)  nebo  'bh' (černá díra)
 *
 *  Ruční událost jde poslat přes  window.__track('share', {ch:'fb'})
 */
(function(){
  // >>> Sem po nasazení Apps Scriptu vlož URL webové aplikace (…/exec) <<<
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxUdeu73DlPTQWuEtMtvmBIV7yI_dudoaoKM0zWVcu3Fsy348YeQ3U1rtPQLb9UXMN13g/exec';

  var PAGE = window.LAB_PAGE || 'hub';

  // dokud není endpoint, __track je prázdný → web funguje beze změny
  if(!ENDPOINT || ENDPOINT.indexOf('PASTE') === 0){
    window.__track = function(){};
    return;
  }

  // anonymní ID jen pro tuhle návštěvu (bez cookie, mizí zavřením karty)
  var sid;
  try{
    sid = sessionStorage.getItem('lab_sid');
    if(!sid){ sid = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
              sessionStorage.setItem('lab_sid', sid); }
  }catch(e){ sid = 'x'; }

  function send(o){
    o.sid = sid; o.p = PAGE;
    var body = JSON.stringify(o);
    try{
      if(navigator.sendBeacon){
        navigator.sendBeacon(ENDPOINT, new Blob([body], {type:'text/plain'}));
        return;
      }
    }catch(e){}
    try{ fetch(ENDPOINT, {method:'POST', body:body, keepalive:true,
                          headers:{'Content-Type':'text/plain'}}); }catch(e){}
  }

  window.__track = function(type, extra){
    var o = extra ? Object.assign({}, extra) : {};
    o.t = type; send(o);
  };

  /* ---------- ROZCESTNÍK ---------- */
  if(PAGE === 'hub'){
    window.__track('lab_view');
    // klik na dlaždici s atributem data-app="…"
    document.addEventListener('click', function(e){
      var el = e.target.closest && e.target.closest('[data-app]');
      if(el) window.__track('app_click', { app: el.getAttribute('data-app') });
    });
  }

  /* ---------- ČERNÁ DÍRA ---------- */
  else if(PAGE === 'bh'){
    window.__track('bh_open');

    // čas hraní = jen aktivní (viditelný) čas na stránce
    var acc = 0, last = Date.now(), visible = !document.hidden;
    function tick(){ if(visible){ var n = Date.now(); acc += n - last; last = n; } }
    function flush(){ tick(); if(acc > 0){ window.__track('bh_playtime', {ms: acc}); acc = 0; } }

    document.addEventListener('visibilitychange', function(){
      if(document.hidden){ flush(); visible = false; }
      else { visible = true; last = Date.now(); }
    });
    window.addEventListener('pagehide', flush);
  }
})();
