const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {ROOT,load,json}=require('./model.cjs');
test('only five complete dialogues are retired; ordinary articles remain published',()=>{
 const all=load().articles,retired=json('content/retired-articles.json');
 assert.equal(retired.length,5);assert.deepEqual(all.filter(a=>a.status==='retired').map(a=>a._slug),retired);
 for(const id of retired){const a=all.find(a=>a._slug===id);assert.equal(a.kind,'franta');assert.ok(!fs.existsSync(path.join(ROOT,'dist',a._url)));}
 for(const id of ['cervena-koule-plazma','mars-leopardi-skvrny','ztraceni-kosmonauti'])assert.equal(all.find(a=>a._slug===id).status,'published');
 for(const file of ['index.html','search.json','sitemap.xml','web/map-articles.json']){const text=fs.readFileSync(path.join(ROOT,'dist',file),'utf8');for(const id of retired)assert.ok(!text.includes('/clanky/'+id+'.html'),file+' '+id);}
});
test('Giza map has one dossier, old articles link to it without duplicate map entries',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(ROOT,'dist/web/map-articles.json'),'utf8')),config=json('content/map-catalog.json');
 const spis=data.filter(a=>a.id==='spis-giza');assert.equal(spis.length,1);assert.equal(spis[0].kind,'spis');assert.ok(spis[0].url.endsWith('bjtkaipdhbovphmtwtnxnervaiyizrq'));assert.ok(spis[0].image&&spis[0].locations.length===1);
 for(const id of config.excludedArticleIds){assert.ok(!data.some(a=>a.id===id));const page=fs.readFileSync(path.join(ROOT,'dist/clanky',id+'.html'),'utf8');assert.ok(page.includes('mapa=zeme&clanek=spis-giza'));}
 const page=fs.readFileSync(path.join(ROOT,'dist/mapa-zahad.html'),'utf8');assert.ok(page.includes(spis[0].url));for(const id of config.excludedArticleIds)assert.ok(!page.includes('/clanky/'+id+'.html'));
});
