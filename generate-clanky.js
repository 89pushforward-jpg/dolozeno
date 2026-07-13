// DOLOŽENO – automatický generátor stránek článků pro Google.
// Spouští se sám přes GitHub Actions po každé změně index.html.
// Čte index.html (pole FEED) a vyrábí clanky/*.html + sitemap.xml.
const fs=require('fs');
let s=fs.readFileSync('index.html','utf8');
function ev(name){const i=s.indexOf('const '+name);const j=s.indexOf('\n];',i)+3;eval(s.slice(i,j).replace('const '+name,'global.'+name));}
ev('FEED');try{ev('GLOSY');}catch(e){global.GLOSY=[];}try{ev('IMAGES');}catch(e){global.IMAGES=[];}
FEED.forEach((it,i)=>{ const m=IMAGES[i]; if(m&&!it.image) it.image=m.f; });

const BASE='https://dolozeno.cz';
const OUT='clanky';
fs.mkdirSync(OUT,{recursive:true});

const map={'á':'a','č':'c','ď':'d','é':'e','ě':'e','í':'i','ň':'n','ó':'o','ř':'r','š':'s','ť':'t','ú':'u','ů':'u','ý':'y','ž':'z'};
function slug(t){return String(t).toLowerCase().replace(/[áčďéěíňóřšťúůýž]/g,c=>map[c]||c).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);}
function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function isoDate(d){const m=String(d||'').match(/(\d+)\.\s*(\d+)\.\s*(\d+)/);if(!m)return new Date().toISOString().slice(0,10);return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;}
const TAG={overeno:'OVĚŘENO',spekulace:'SPEKULACE',svedectvi:'SVĚDECTVÍ',disclosure:'DISCLOSURE'};
function badge(a){if(a.kind==='franta')return 'FRANTA';return TAG[a.tag]||TAG[a.topic]||'ZPRÁVA';}
function desc(a){let d=a.teaser||a.hook||(a.body&&a.body[0])||a.title;d=String(d).replace(/\s+/g,' ').trim();return d.length>155?d.slice(0,152)+'…':d;}
// --- stavební bloky přesně jako v overlay na webu ---
const TAGCOL={overeno:'#3ecf8e',svedectvi:'#ff9d4d',spekulace:'#ff6b6b',franta:'#f2c40f'};
const LABELS={overeno:'ZPRÁVA',svedectvi:'SVĚDECTVÍ',spekulace:'SPEKULACE',franta:'FRANTA'};
function coverSVG(tag,i){
  const c=TAGCOL[tag]||'#36d6e7', stamp=(tag==='franta')?'SATIRA':'SPIS';
  const rows=[28,52,76,100,124], widths=[560,640,300,600,420];
  const lines=rows.map((y,k)=>`<rect x="40" y="${y}" width="${widths[k]}" height="10" rx="3" fill="#2a3242"/>`).join('');
  const bars=[`<rect x="40" y="52" width="230" height="10" rx="3" fill="#0a0c10"/>`,`<rect x="300" y="100" width="190" height="10" rx="3" fill="#0a0c10"/>`,`<rect x="40" y="124" width="120" height="10" rx="3" fill="#0a0c10"/>`].join('');
  return `<svg viewBox="0 0 720 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity="0.10"/><stop offset="100%" stop-color="#0a0c10" stop-opacity="0"/></linearGradient></defs><rect width="720" height="160" fill="#0d1017"/><rect width="720" height="160" fill="url(#g${i})"/>${lines}${bars}<rect x="540" y="20" width="148" height="40" rx="6" fill="none" stroke="${c}" stroke-width="2" opacity="0.85"/><text x="614" y="46" font-family="monospace" font-size="16" fill="${c}" text-anchor="middle" letter-spacing="3" opacity="0.9">${stamp}</text></svg>`;
}
function chipHtml(tag){return tag==='franta'?'<span class="chip-fp"><span class="fp-f">Franta</span><span class="fp-p">Pepan</span></span>':'<span class="chip chip-'+tag+'">'+(LABELS[tag]||tag)+'</span>';}
function coverInner(a,i){
  if(a.image)return '<img src="/'+esc(a.image)+'" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'/img/og-default.jpg\'"><span class="imgtag">'+esc(a.imgCredit||(a.imgType==='foto'?'Foto':'Ilustrace'))+'</span>';
  return coverSVG(a.tag,i)+'<span class="imgtag">'+(a.imgType==='ai'?'Ilustrace (AI)':'Ilustrace')+'</span>';
}

function page(a,sl,i){
  const url=`${BASE}/clanky/${sl}.html`;
  const img=a.image?`${BASE}/${a.image}`:`${BASE}/img/og-default.jpg`;
  const d=desc(a);
  const bodyHtml=(a.body||[]).map(p=>{const t=String(p);return (t.indexOf("<span class='ij")===0||t.indexOf("<img")===0||t.indexOf("<figure")===0)?`      ${p}`:`      <p>${p}</p>`;}).join('\n');
  const srcHtml=(a.sources&&a.sources.length)?
    `\n      <div class="sources"><h5>Zdroje</h5>`+
    a.sources.map(z=>`<a href="${esc(z.url)}" target="_blank" rel="noopener nofollow">${esc(z.name)}<span>${esc(z.lang||'')} ↗</span></a>`).join('')+
    `</div>`:'';
  const factHtml=a.fact?`\n      <div class="fact ${a.factLabel==='FIKCE'?'fikce':''}"><b>${esc(a.factLabel||'Zajímavost')}</b>${esc(a.fact)}</div>`:'';
  const captionHtml=a.imgType==='ai'?'Ilustrace vygenerovaná umělou inteligencí (AI)':(a.image?`Foto: ${esc(a.imgCredit||'zdroj')}${a.imgSource?` · <a href="${esc(a.imgSource)}" target="_blank" rel="noopener noreferrer">zdroj ↗</a>`:''}`:'Ilustrace');
  const hookHtml=a.hook?`\n      <div class="hook"><b>REDAKCE:</b> ${esc(a.hook)}</div>`:'';
  const videoHtml=a.video?`\n      <div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(a.video)}" title="Trailer" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`:'';
  const premiumHtml=`\n      <div style="border-top:1px solid var(--line);margin-top:40px"></div>
      <div class="premium" style="border-color:rgba(54,214,231,.4);margin-top:26px">
        <div style="color:var(--cyan);font-weight:800;font-size:18px;margin-bottom:8px"><span style="font-variant-emoji:text;font-size:1.35em">✉︎</span> Nenech si ujít to nejlepší</div>
        <p style="color:var(--cyan);font-size:14.5px;line-height:1.55;margin:0 0 14px">Chystáme pravidelný přehled ze světa UAP a vesmírných záhad, k tomu hlubší rozbory — všechno přímo do e-mailu. Nech nám adresu. Bez spamu, kdykoli se odhlásíš.</p>
        <a class="buybtn" href="${BASE}/#email" style="background:var(--cyan);display:block;text-align:center;text-decoration:none;box-sizing:border-box">Chci být u toho →</a>
      </div>`;
  const rel=(typeof i==='number' && typeof relatedFor==='function')?relatedFor(i):[];
  const relHtml=rel.length?`\n    <div class="rel"><div class="rel-h">Související články</div>\n`+
    rel.map(j=>`      <a href="${BASE}/clanky/${SLUGS[j]}.html">${esc(FEED[j].title)}</a>`).join('\n')+
    `\n    </div>`:'';
  // ---- verdikt (stejné jako v overlay na webu) ----
  const v=a.verdikt;
  const vL=arr=>(arr||[]).map(t=>`<li>${esc(t)}</li>`).join('');
  let verdiktHtml='';
  if(v){
    const pro=Math.max(0,Math.min(100, v.proPct!=null?v.proPct:50)); const proti=100-pro;
    const tier=v.tier||(pro>=70?'potvrzeno':(pro<=30?'bezdukazu':'nevime'));
    const isV=tier==='vysvetleno';
    const vlabel=tier==='potvrzeno'?'POTVRZENO':isV?'VYSVĚTLENO':(tier==='bezdukazu'?'BEZ DŮKAZU':'NEVÍME');
    const topQ=esc(isV?(v.q||'Je ta záhada vyřešená?'):(v.q||'je za tím něco mimozemského?'));
    const barLabel=isV?'Míra vysvětlení':'Váha důkazů';
    const segL=isV?(proti+' % otevřené'):(proti+' % proti');
    const segR=isV?(pro+' % vysvětleno'):(pro+' % pro');
    const headProti=isV?'ZBÝVÁ OTEVŘENÉ':'PROTI';
    const headPro=isV?'VYSVĚTLENÍ':'PRO';
    verdiktHtml='\n    <div class="verdikt"><div class="v-question">'+topQ+'</div>'
      +'<div class="verdikt-cap">Verdikt redakce</div>'
      +'<div class="verdikt-head"><span class="v-verd '+tier+'">'+vlabel+'</span></div>'
      +(v.note?'<div class="v-note">'+esc(v.note)+'</div>':'')
      +'<div class="v-barcap">'+barLabel+'</div>'
      +'<div class="v-bar"><div class="seg seg-proti" style="width:'+proti+'%">'+segL+'</div><div class="seg seg-pro" style="width:'+pro+'%">'+segR+'</div></div>'
      +'<div class="v-cols"><div class="v-col col-proti"><h6><span aria-hidden="true">'+(isV?'○':'✗')+'</span> '+headProti+'</h6><ul>'+vL(v.proti)+'</ul></div>'
      +'<div class="v-col col-pro"><h6><span aria-hidden="true">✓</span> '+headPro+'</h6><ul>'+vL(v.pro)+'</ul></div></div></div>';
  }
  // ---- glosy Franta / Pepan ----
  let glosaHtml='';
  if(a.kind!=='franta'){
    let ga=a.glosy;
    if(!ga){ga=[];if(a.frantaGlosa)ga.push({spk:'f',label:'Franta dodává',text:a.frantaGlosa});if(a.pepanGlosa)ga.push({spk:'p',label:'Pepan dodává',text:a.pepanGlosa});}
    if(ga.length){
      glosaHtml='\n'+ga.map(g=>{const isP=g.spk==='p';const av=isP?'/img/pepan-avatar.jpg':'/img/franta-avatar.jpg';const cls=isP?'glosa glosa-p':'glosa';const nm=isP?'Pepan':'Franta';
        return '    <div class="'+cls+'"><div class="glosa-ava"><img src="'+av+'" alt="'+nm+'"></div><div class="glosa-text"><b>'+esc(g.label||(nm+' dodává'))+'</b><p>„'+esc(g.text)+'“</p></div></div>';}).join('\n');
    }
  }
  const ld={"@context":"https://schema.org","@type":"NewsArticle",headline:a.title,description:d,image:[img],
    datePublished:isoDate(a.published),dateModified:isoDate(a.published),
    author:{"@type":"Organization",name:"DOLOŽENO",url:BASE},
    publisher:{"@type":"Organization",name:"DOLOŽENO",logo:{"@type":"ImageObject",url:`${BASE}/img/og-default.jpg`}},
    mainEntityOfPage:{"@type":"WebPage","@id":url}};
  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.title)} · DOLOŽENO</title>
<meta name="description" content="${esc(d)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="DOLOŽENO">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(d)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:locale" content="cs_CZ">
<meta property="article:published_time" content="${isoDate(a.published)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(a.title)}">
<meta name="twitter:description" content="${esc(d)}">
<meta name="twitter:image" content="${img}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{--bg:#0a0c10;--card:#11151c;--tx:#e8ecf3;--mut:#9aa6b5;--amb:#f5a623;--cy:#36d6e7;--line:#1e2530;--mono:'IBM Plex Mono',ui-monospace,monospace;--sans:'IBM Plex Sans',sans-serif;--ink:#e8ecf3;--ink-dim:#9aa2b2;--ok:#3ecf8e;--spec:#ff6b6b;--cyan:#36d6e7;--franta:#f2c40f;--pepa:#ff6b6b;--bg-card:#13171f;--signal:#f5a623;--warn:#ff9d4d;--ink-faint:#5a6172}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--tx);font-family:'IBM Plex Sans',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.65}
  .wrap{max-width:720px;margin:0 auto}
  .closebtn{position:fixed;top:14px;right:14px;z-index:20;width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:var(--card);border:1px solid var(--line);border-radius:50%;color:var(--tx);font-size:26px;line-height:1;text-decoration:none;transition:border-color .15s,color .15s}
  .closebtn:hover{border-color:var(--amb);color:var(--amb)}
  header{display:flex;align-items:baseline;gap:12px;padding:16px 22px 18px;border-bottom:1px solid var(--line)}
  .logo{font-family:var(--mono);font-weight:700;font-size:24px;letter-spacing:1px;color:var(--amb);text-decoration:none}
  .tagline{color:var(--ink-dim);font-size:13px}
  .d-cover{position:relative;height:210px;border-bottom:1px solid var(--line);overflow:hidden}
  .d-cover svg,.d-cover img{width:100%;height:100%;display:block;object-fit:cover;object-position:center 30%}
  .d-cover .imgtag{position:absolute;left:14px;bottom:10px;font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--ink-dim);background:rgba(10,12,16,.7);padding:4px 8px;border-radius:5px;border:1px solid var(--line)}
  .sheet-body{padding:24px 22px 70px}
  .d-caption{font-family:var(--mono);font-size:11px;color:var(--ink-faint);margin-bottom:16px;line-height:1.5}
  .d-caption a{color:var(--cyan);text-decoration:none}
  .hook{font-family:var(--mono);font-size:12px;letter-spacing:.04em;color:var(--signal);margin-bottom:11px;line-height:1.45}
  .hook b{color:var(--cyan);letter-spacing:.12em}
  .chip{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;padding:5px 9px;border-radius:6px;border:1px solid;font-weight:600;white-space:nowrap;display:inline-block}
  .chip-overeno{color:var(--ok);border-color:rgba(62,207,142,.4);background:rgba(62,207,142,.08)}
  .chip-svedectvi{color:var(--warn);border-color:rgba(255,157,77,.4);background:rgba(255,157,77,.08)}
  .chip-spekulace{color:var(--spec);border-color:rgba(255,107,107,.4);background:rgba(255,107,107,.08)}
  .chip-disclosure{color:var(--cyan);border-color:rgba(54,214,231,.32);background:rgba(54,214,231,.06)}
  .chip-fp{display:inline-flex;align-items:stretch;border-radius:6px;overflow:hidden}
  .chip-fp .fp-f,.chip-fp .fp-p{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;padding:5px 10px;border:1px solid;white-space:nowrap;display:flex;align-items:center}
  .chip-fp .fp-f{color:var(--franta);border-color:rgba(242,196,15,.45);background:rgba(242,196,15,.10);border-right:0;border-radius:6px 0 0 6px}
  .chip-fp .fp-p{color:var(--pepa);border-color:rgba(255,107,107,.45);background:rgba(255,107,107,.10);border-radius:0 6px 6px 0}
  .sheet-body h1{font-size:26px;font-weight:700;line-height:1.18;letter-spacing:-.02em;margin:10px 0 16px}
  .video{position:relative;width:100%;aspect-ratio:16/9;margin:6px 0 18px;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#000}
  .video iframe{width:100%;height:100%;border:0;display:block}
  .fact{border:1px solid rgba(54,214,231,.3);background:rgba(54,214,231,.06);border-radius:12px;padding:14px 16px;margin:0 0 18px;font-size:14px;color:var(--ink-dim)}
  .fact b{color:var(--cyan);font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;display:block;margin-bottom:6px}
  .fact.fikce{border-color:rgba(242,196,15,.32);background:rgba(242,196,15,.07)} .fact.fikce b{color:var(--franta)}
  .d-body p{font-size:16px;color:var(--ink);opacity:.92;margin-bottom:14px;line-height:1.7}
  .ij{display:block;margin:20px 0;padding:8px 0 8px 16px;border-left:3px solid;font-style:italic;font-size:15.5px;line-height:1.55}
  .ij b{font-style:normal;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;display:block;margin-bottom:4px;opacity:.85}
  .ij.f{color:#f2c40f;border-color:#f2c40f}
  .ij.p{color:#ff6b6b;border-color:#ff6b6b}
  .sources{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}
  .sources h5{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:12px}
  .sources a{display:flex;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid var(--line);color:var(--cyan);text-decoration:none;font-size:14px}
  .sources a span{color:var(--ink-faint);font-family:var(--mono);font-size:11px;white-space:nowrap}
  .premium{margin-top:24px;padding:18px;border:1px solid rgba(245,166,35,.35);border-radius:14px;background:linear-gradient(180deg, rgba(245,166,35,.08), rgba(245,166,35,.02))}
  .buybtn{width:100%;font-family:var(--mono);font-weight:700;font-size:14px;letter-spacing:.03em;padding:14px 18px;border-radius:10px;color:#1a1304;border:none;cursor:pointer}
  .rel{margin:30px 0 0;padding-top:18px;border-top:1px solid var(--line)}
  .rel-h{font-size:13px;letter-spacing:1px;color:var(--mut);font-weight:700;margin-bottom:10px}
  .rel a{display:block;color:var(--cy);text-decoration:none;font-size:14px;padding:5px 0}
  .verdikt{margin:30px 0 0;padding-top:18px;border-top:1px solid var(--line)}
  .v-question{font-family:var(--mono);font-size:15px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#fff;text-align:center;line-height:1.45;margin:0 auto 16px;max-width:520px}
  .verdikt-cap{font-family:var(--mono);font-size:15px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#fff;text-align:center;margin-bottom:14px}
  .verdikt-head{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
  .v-verd{font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1.5px solid;border-radius:8px;padding:7px 13px;background:transparent}
  .v-verd.potvrzeno{color:var(--ok);border-color:var(--ok)}
  .v-verd.nevime{color:var(--cyan);border-color:var(--cyan)}
  .v-verd.bezdukazu{color:var(--spec);border-color:var(--spec)}
  .v-verd.vysvetleno{color:var(--ok);border-color:var(--ok)}
  .v-note{text-align:center;color:var(--ink-dim);font-size:14px;line-height:1.55;margin:14px auto 18px;max-width:480px}
  .v-barcap{font-family:var(--sans);font-size:14px;color:var(--ink-dim);text-align:center;margin-bottom:8px}
  .v-bar{display:flex;height:32px;border-radius:8px;overflow:hidden}
  .v-bar .seg{box-sizing:border-box;font-family:var(--mono);font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center}
  .v-bar .seg-proti{background:var(--spec);color:#3a0d12;border-right:2px solid var(--bg-card)}
  .v-bar .seg-pro{background:var(--ok);color:#063524}
  .v-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
  .v-col{border:1px solid;border-radius:10px;padding:12px 14px}
  .v-col.col-proti{border-color:rgba(255,107,107,.25);background:rgba(255,107,107,.05)}
  .v-col.col-pro{border-color:rgba(62,207,142,.22);background:rgba(62,207,142,.05)}
  .v-col h6{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.06em;margin:0 0 8px;display:flex;align-items:center;gap:6px}
  .v-col.col-proti h6{color:var(--spec)} .v-col.col-pro h6{color:var(--ok)}
  .v-col ul{list-style:none;margin:0;padding:0}
  .v-col li{font-size:13px;line-height:1.5;color:var(--ink);opacity:.9;margin:7px 0;padding-left:14px;position:relative}
  .v-col li::before{content:"—";position:absolute;left:0}
  .v-col.col-proti li::before{color:var(--spec)} .v-col.col-pro li::before{color:var(--ok)}
  @media(max-width:560px){.v-cols{grid-template-columns:1fr}}
  .glosa{margin-top:22px;padding:14px 16px;border:2px solid rgba(242,196,15,.4);border-radius:12px;background:rgba(242,196,15,.07);display:flex;gap:14px;align-items:flex-start}
  .glosa-ava{width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid var(--franta);flex-shrink:0}
  .glosa-ava img{width:100%;height:100%;object-fit:cover}
  .glosa-text b{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--franta);margin-bottom:6px}
  .glosa-text p{font-size:14.5px;color:var(--franta);font-style:italic;margin:0}
  .glosa.glosa-p .glosa-text p{color:#ff6b6b}
  .glosa.glosa-p{border-color:rgba(255,107,107,.4);background:rgba(255,107,107,.07)}
  .glosa.glosa-p .glosa-ava{border-color:#ff6b6b}
  .glosa.glosa-p .glosa-text b{color:#ff6b6b}
  @media(max-width:540px){.sheet-body h1{font-size:23px}}
</style>
</head>
<body>
  <a class="closebtn" href="${BASE}/" aria-label="Zavřít a zpět na hlavní stránku" title="Zavřít">×</a>
  <div class="wrap">
    <header>
      <a class="logo" href="${BASE}/">DOLOŽENO</a>
      <span class="tagline">Fakta oddělíme od blbostí</span>
    </header>
    <div class="d-cover">${coverInner(a,i)}</div>
    <div class="sheet-body">
      <div class="d-caption">${captionHtml}</div>${hookHtml}
      ${chipHtml(a.tag)}
      <h1>${esc(a.title)}</h1>${videoHtml}${factHtml}
      <div class="d-body">
${bodyHtml}
      </div>${verdiktHtml}${glosaHtml}${premiumHtml}${srcHtml}${relHtml}
    </div>
  </div>
</body>
</html>`;
}

const sitemap=[{loc:`${BASE}/`,lastmod:new Date().toISOString().slice(0,10),pri:'1.0',freq:'daily'}];
// předpočítej slugy všech článků (kvůli interním odkazům "Související články")
const SLUGS=[]; { const s2={}; FEED.forEach(a=>{ let sl=a.id||slug(a.title); if(s2[sl])sl=sl+'-'+(++s2[sl]); s2[sl]=1; SLUGS.push(sl); }); }
function relatedFor(i){
  const a=FEED[i];
  const others=FEED.map((x,j)=>j).filter(j=>j!==i);
  const score=j=>(a.topic&&FEED[j].topic===a.topic?2:0)+(a.tag&&FEED[j].tag===a.tag?1:0);
  others.sort((x,y)=>score(y)-score(x)||y-x); // nejdřív nejrelevantnější, pak nejnovější
  return others.slice(0,4);
}
const keep=new Set();
FEED.forEach((a,i)=>{
  const sl=SLUGS[i];
  fs.writeFileSync(`${OUT}/${sl}.html`,page(a,sl,i),'utf8');
  keep.add(sl+'.html');
  sitemap.push({loc:`${BASE}/clanky/${sl}.html`,lastmod:isoDate(a.published),pri:'0.8',freq:'monthly'});
});
// úklid: smaž stránky článků, které už ve FEED nejsou
fs.readdirSync(OUT).forEach(f=>{ if(f.endsWith('.html') && !keep.has(f)) fs.unlinkSync(`${OUT}/${f}`); });

const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  sitemap.map(u=>`  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n')+
  `\n</urlset>\n`;
fs.writeFileSync('sitemap.xml',xml,'utf8');
console.log('Hotovo:',FEED.length,'stránek + sitemap.xml');
