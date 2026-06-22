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

function page(a,sl){
  const url=`${BASE}/clanky/${sl}.html`;
  const img=a.image?`${BASE}/${a.image}`:`${BASE}/img/og-default.jpg`;
  const d=desc(a);
  const bodyHtml=(a.body||[]).map(p=>`      <p>${esc(p)}</p>`).join('\n');
  const srcHtml=(a.sources&&a.sources.length)?
    `\n    <div class="src"><div class="src-h">Zdroje</div>\n`+
    a.sources.map(z=>`      <a href="${esc(z.url)}" target="_blank" rel="noopener nofollow">${esc(z.name)}${z.lang?` <span>(${esc(z.lang)})</span>`:''}</a>`).join('\n')+
    `\n    </div>`:'';
  const factHtml=a.fact?`\n    <div class="fact"><span>DOLOŽENO:</span> ${esc(a.fact)}</div>`:'';
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
<style>
  :root{--bg:#0a0c10;--card:#11151c;--tx:#e8ecf3;--mut:#9aa6b5;--amb:#f5a623;--cy:#36d6e7;--line:#1e2530}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--tx);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.65}
  .wrap{max-width:720px;margin:0 auto;padding:24px 20px 60px}
  header{display:flex;align-items:baseline;gap:12px;padding:8px 0 24px;border-bottom:1px solid var(--line);margin-bottom:28px}
  .logo{font-weight:800;font-size:24px;letter-spacing:.5px;color:var(--amb);text-decoration:none}
  .tagline{color:var(--mut);font-size:13px}
  .badge{display:inline-block;background:rgba(54,214,231,.12);color:var(--cy);font-size:12px;font-weight:700;letter-spacing:1px;padding:5px 11px;border-radius:6px}
  h1{font-size:30px;line-height:1.25;margin:16px 0 10px}
  .meta{color:var(--mut);font-size:14px;margin-bottom:22px}
  .hero{width:100%;border-radius:12px;border:1px solid var(--line);margin:6px 0 24px;display:block}
  .lead{font-size:19px;color:#f3f6fb;font-weight:500;margin:0 0 22px}
  p{margin:0 0 18px}
  .fact{background:rgba(245,166,35,.10);border-left:3px solid var(--amb);padding:14px 16px;border-radius:8px;margin:24px 0;color:#f1e7d4}
  .fact span{color:var(--amb);font-weight:800;letter-spacing:.5px}
  .src{margin:30px 0 0;padding-top:18px;border-top:1px solid var(--line)}
  .src-h{font-size:13px;letter-spacing:1px;color:var(--mut);font-weight:700;margin-bottom:10px}
  .src a{display:block;color:var(--cy);text-decoration:none;font-size:14px;padding:4px 0}
  .src a span{color:var(--mut)}
  .cta{display:block;text-align:center;margin:38px 0 0;background:var(--amb);color:#0a0c10;font-weight:800;text-decoration:none;padding:15px;border-radius:10px;font-size:16px}
  footer{margin-top:48px;padding-top:20px;border-top:1px solid var(--line);color:var(--mut);font-size:13px;text-align:center}
  footer a{color:var(--mut)}
  @media(max-width:540px){h1{font-size:25px}.lead{font-size:17px}}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <a class="logo" href="${BASE}/">DOLOŽENO</a>
      <span class="tagline">Fakta oddělíme od blbostí</span>
    </header>
    <article>
      <span class="badge">${badge(a)}</span>
      <h1>${esc(a.title)}</h1>
      <div class="meta">${esc(a.published||a.date||'')}${a.source?` · zdroj: ${esc(a.source)}`:''}</div>
      <img class="hero" src="/${esc(a.image||'img/og-default.jpg')}" alt="${esc(a.title)}" onerror="this.onerror=null;this.src='/img/og-default.jpg'">
      ${a.teaser?`<p class="lead">${esc(a.teaser)}</p>`:''}
${bodyHtml}${factHtml}${srcHtml}
      <a class="cta" href="${BASE}/">Číst víc na DOLOŽENO →</a>
    </article>
    <footer>© 2026 · <a href="${BASE}/">dolozeno.cz</a> · UFO, vládní spisy a vesmírné záhady česky</footer>
  </div>
</body>
</html>`;
}

const sitemap=[{loc:`${BASE}/`,lastmod:new Date().toISOString().slice(0,10),pri:'1.0',freq:'daily'}];
const seen={};
const keep=new Set();
FEED.forEach(a=>{
  let sl=a.id||slug(a.title); if(seen[sl])sl=sl+'-'+(++seen[sl]); seen[sl]=1;
  fs.writeFileSync(`${OUT}/${sl}.html`,page(a,sl),'utf8');
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
