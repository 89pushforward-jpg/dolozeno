const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT,load,esc}=require('./model.cjs');
const read=p=>fs.readFileSync(path.join(ROOT,'dist',p),'utf8');
const model=load(),published=model.articles.filter(a=>a.status==='published');
const xml=read('sitemap.xml'),urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,new Set(urls).size,'duplicate sitemap URL');
assert.equal(urls.length,published.length+3,'unexpected sitemap entries');
for(const url of urls){
 const u=new URL(url);assert.equal(u.origin,'https://dolozeno.cz');
 const file=u.pathname==='/'?'index.html':u.pathname.slice(1),html=read(file);
 assert.ok(html.includes('rel="canonical" href="'+url+'"'),file+' canonical');
 assert.ok(html.includes('content="index,follow"'),file+' indexable');
 assert.ok(!/noindex/i.test(html),file+' noindex');
 for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(m[1]);
 for(const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
  let p=m[1];if(p.endsWith('/'))p+='index.html';assert.ok(fs.existsSync(path.join(ROOT,'dist',p)),file+' broken '+p);
 }
}
for(const a of model.articles){
 const exists=fs.existsSync(path.join(ROOT,'dist',a._url));
 assert.equal(exists,a.status==='published',a._slug+' publication visibility');
 if(a.status==='published'){
  assert.ok(xml.includes('https://dolozeno.cz'+a._url),a._slug+' sitemap');
  const html=read(a._url);assert.ok(html.includes(esc(a.title)));
  for(const source of a.sources||[])assert.ok(html.includes(esc(source.url)));
  if(a.verdikt&&a.verdikt.proPct!=null)assert.ok(html.includes('width:'+a.verdikt.proPct+'%'));
 }
}
assert.ok(read('robots.txt').includes('Allow: /'));
assert.ok(!read('robots.txt').includes('Disallow: /\n'));
assert.ok(!read('_headers').includes('noindex'));
assert.ok(read('admin.html').includes('noindex,nofollow'));
assert.ok(read('admin.html').includes('ghGetFile("index.html")'));
assert.ok(!fs.existsSync(path.join(ROOT,'dist','vesmirna-laborator')));
assert.equal(read('CNAME').trim(),'dolozeno.cz');
assert.ok(read('sw.js').includes('unregister'));
console.log(`Production verified: ${published.length} articles, ${urls.length} sitemap URLs, metadata, local links, admin and publication visibility.`);
